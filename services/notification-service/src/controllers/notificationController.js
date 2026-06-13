import House from "../models/HouseModel.js";
import Order from "../models/OrderModel.js";
import Notification from "../models/Notification.js";
import Delivery from "../models/Delivery.js";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

export const notificationController = {
  notifyArrival: async (req, res) => {
    try {
      const { houseId, houseName, ownerPhone, ownerEmail, message } = req.body;

      if (!houseId || !houseName) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "houseId and houseName are required",
        });
      }

      const house = await House.findById(houseId);
      if (!house) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "House not found",
        });
      }

      const notification = new Notification({
        houseId,
        houseName,
        ownerName: house.owner?.name,
        ownerPhone: house.owner?.phone || ownerPhone,
        ownerEmail: house.owner?.email || ownerEmail,
        message,
        type: "IN_APP",
        status: "SENT",
        sentAt: new Date(),
      });

      await notification.save();

      const order = await Order.findOne({
        houseId,
        status: { $in: ["pending", "assigned", "in_transit"] },
      });

      if (order) {
        order.status = "delivered";
        order.updatedAt = Date.now();
        await order.save();
      }

      const deliveryId = order?.orderId ? `DEL-${order.orderId}` : `DEL-${uuidv4().slice(0, 8)}`;
      const existingDelivery = await Delivery.findOne({ deliveryId });

      const delivery = existingDelivery
        ? existingDelivery
        : await new Delivery({
            deliveryId,
            sender: {
              name: "Drone Delivery System",
            },
            receiver: {
              name: house.owner?.name,
              phone: house.owner?.phone || ownerPhone,
              email: house.owner?.email || ownerEmail,
              address: house.address,
              latitude: house.lat,
              longitude: house.lng,
            },
            package: order?.package,
            status: "delivered",
            actualDeliveryTime: new Date(),
            updatedAt: new Date(),
          }).save();

      res.status(StatusCodes.OK).json({
        message: "✅ Gửi thông báo thành công",
        notification: {
          id: notification._id,
          houseId,
          houseName,
          ownerName: house.owner?.name,
          ownerPhone: house.owner?.phone,
          ownerEmail: house.owner?.email,
          message,
          status: "SENT",
          sentAt: notification.sentAt,
        },
        delivery: {
          id: delivery._id,
          deliveryId: delivery.deliveryId,
          status: delivery.status,
          actualDeliveryTime: delivery.actualDeliveryTime,
        },
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  getNotificationHistory: async (req, res) => {
    try {
      const { houseId, limit = 20, page = 1 } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      if (houseId) {
        query.houseId = houseId;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

      const total = await Notification.countDocuments(query);

      res.status(StatusCodes.OK).json({
        message: `Lấy ${notifications.length} thông báo thành công`,
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  getNotificationStats: async (req, res) => {
    try {
      const stats = await Notification.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const byType = await Notification.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]);

      res.status(StatusCodes.OK).json({
        message: "Lấy thống kê thông báo thành công",
        stats: {
          byStatus: stats,
          byType: byType,
          total: stats.reduce((sum, s) => sum + s.count, 0),
        },
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },
};
