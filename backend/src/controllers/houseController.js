import House from "../models/HouseModel.js";
import Order from "../models/OrderModel.js";
import Notification from "../models/Notification.js";
import Delivery from "../models/Delivery.js";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";

export const houseController = {
  // Generate houses for Vinhomes area (100+ houses)
  generateHouses: async (req, res) => {
    try {
      const existingHouses = await House.countDocuments();
      if (existingHouses > 0) {
        return res.status(StatusCodes.OK).json({
          message: "Houses already generated",
          count: existingHouses,
        });
      }
      const depot = { lat: 21.001763, lng: 105.941928 };
      const houses = [];

      // Generate 100 houses in concentric circles around Vinhomes
      const circles = 5; // 5 circles
      const housesPerCircle = 20;

      for (let circle = 1; circle <= circles; circle++) {
        const radius = 0.002 * circle; // Expanding radius
        for (let i = 0; i < housesPerCircle; i++) {
          const angle = (i / housesPerCircle) * (2 * Math.PI);
          const lat = depot.lat + radius * Math.cos(angle);
          const lng = depot.lng + radius * Math.sin(angle);

          houses.push({
            houseId: (circle - 1) * housesPerCircle + i + 1,
            address: `Vinhomes House #${(circle - 1) * housesPerCircle + i + 1}`,
            lat,
            lng,
            zone: "vinhomes",
            hasOrder: false,
          });
        }
      }

      await House.insertMany(houses);
      res.status(StatusCodes.CREATED).json({
        message: "Houses generated successfully",
        count: houses.length,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  // Get all houses with order status
  getAllHouses: async (req, res) => {
    try {
      const houses = await House.find().lean();

      // Get all house IDs with orders
      const orderedHouseIds = await Order.distinct("houseId", {
        status: { $in: ["pending", "assigned", "in_transit"] },
      });

      const orderedSet = new Set(orderedHouseIds.map((id) => id.toString()));

      // Add hasOrder flag
      const housesWithStatus = houses.map((house) => ({
        ...house,
        hasOrder: orderedSet.has(house._id.toString()),
      }));

      res.status(StatusCodes.OK).json(housesWithStatus);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  // Get houses by zone with order status
  getHousesByZone: async (req, res) => {
    try {
      const { zone } = req.params;
      const houses = await House.find({ zone }).lean();

      // Get all house IDs with orders
      const orderedHouseIds = await Order.distinct("houseId", {
        status: { $in: ["pending", "assigned", "in_transit"] },
      });

      const orderedSet = new Set(orderedHouseIds.map((id) => id.toString()));

      // Add hasOrder flag
      const housesWithStatus = houses.map((house) => ({
        ...house,
        hasOrder: orderedSet.has(house._id.toString()),
      }));

      res.status(StatusCodes.OK).json(housesWithStatus);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  // Add batch houses
  addBatchHouses: async (req, res) => {
    try {
      const { houses } = req.body;

      if (!Array.isArray(houses) || houses.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Invalid houses data",
        });
      }

      // Get current max houseId
      const lastHouse = await House.findOne().sort({ houseId: -1 });
      let nextId = lastHouse ? lastHouse.houseId + 1 : 1;

      // Prepare houses with IDs
      const housesToInsert = houses.map((h) => ({
        houseId: nextId++,
        address: h.address || `Vinhomes House #${nextId}`,
        lat: h.lat,
        lng: h.lng,
        zone: "vinhomes",
        hasOrder: false,
      }));

      const insertedHouses = await House.insertMany(housesToInsert);

      res.status(StatusCodes.CREATED).json({
        message: "Houses added successfully",
        count: insertedHouses.length,
        houses: insertedHouses,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  // Search houses by owner info
  searchByOwner: async (req, res) => {
    try {
      const { name, phone, email } = req.body

      if (!name && !phone && !email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Provide at least one search criteria: name, phone, or email",
        })
      }

      const query = { hasOwner: true }

      if (name) {
        query["owner.name"] = { $regex: name, $options: "i" }
      }
      if (phone) {
        query["owner.phone"] = phone
      }
      if (email) {
        query["owner.email"] = { $regex: email, $options: "i" }
      }

      const houses = await House.find(query)

      res.status(StatusCodes.OK).json({
        message: `Found ${houses.length} house(s)`,
        houses,
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      })
    }
  },

  // Register/Update owner for a house
  registerOwner: async (req, res) => {
    try {
      const { houseId } = req.params
      const { name, phone, email } = req.body

      if (!name || !phone) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Name and phone are required",
        })
      }

      const updatedHouse = await House.findByIdAndUpdate(
        houseId,
        {
          owner: { name, phone, email },
          hasOwner: true,
        },
        { new: true }
      )

      if (!updatedHouse) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "House not found",
        })
      }

      res.status(StatusCodes.OK).json({
        message: "Owner registered successfully",
        house: updatedHouse,
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      })
    }
  },

  // Send notification to house owner about drone arrival
  notifyArrival: async (req, res) => {
    try {
      const { houseId, houseName, ownerPhone, ownerEmail, message } = req.body

      if (!houseId || !houseName) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "houseId and houseName are required",
        })
      }

      const house = await House.findById(houseId)
      if (!house) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "House not found",
        })
      }

      // Create notification record
      const notification = new Notification({
        houseId,
        houseName,
        ownerName: house.owner?.name,
        ownerPhone: house.owner?.phone || ownerPhone,
        ownerEmail: house.owner?.email || ownerEmail,
        message,
        type: 'IN_APP',
        status: 'SENT',
        sentAt: new Date()
      })

      await notification.save()

      const order = await Order.findOne({
        houseId,
        status: { $in: ["pending", "assigned", "in_transit"] },
      })

      if (order) {
        order.status = "delivered"
        order.updatedAt = Date.now()
        await order.save()
      }

      const deliveryId = order?.orderId ? `DEL-${order.orderId}` : `DEL-${uuidv4().slice(0, 8)}`
      const existingDelivery = await Delivery.findOne({ deliveryId })

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
          }).save()

      // Log notification
      console.log(`✅ DELIVERY NOTIFICATION SENT`)
      console.log(`   House: ${houseName}`)
      console.log(`   Owner: ${house.owner?.name}`)
      console.log(`   Phone: ${house.owner?.phone}`)
      console.log(`   Message: ${message}`)
      console.log(`   Time: ${new Date().toISOString()}`)
      console.log(`   Notification ID: ${notification._id}`)

      // TODO: Integrate with actual SMS/Email services:
      // - Twilio for SMS notifications
      // - SendGrid/Nodemailer for Email notifications
      // - Firebase for Push notifications
      // This would look like:
      // if (process.env.TWILIO_ENABLED) {
      //   await sendSMS(house.owner.phone, message)
      // }
      // if (process.env.EMAIL_ENABLED) {
      //   await sendEmail(house.owner.email, houseName, message)
      // }

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
          status: 'SENT',
          sentAt: notification.sentAt
        },
        delivery: {
          id: delivery._id,
          deliveryId: delivery.deliveryId,
          status: delivery.status,
          actualDeliveryTime: delivery.actualDeliveryTime,
        }
      })
    } catch (error) {
      console.error("Error sending notification:", error)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      })
    }
  },

  // Get notification history
  getNotificationHistory: async (req, res) => {
    try {
      const { houseId, limit = 20, page = 1 } = req.query
      const skip = (page - 1) * limit

      let query = {}
      if (houseId) {
        query.houseId = houseId
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean()

      const total = await Notification.countDocuments(query)

      res.status(StatusCodes.OK).json({
        message: `Lấy ${notifications.length} thông báo thành công`,
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      })
    }
  },

  // Get notification statistics
  getNotificationStats: async (req, res) => {
    try {
      const stats = await Notification.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])

      const byType = await Notification.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ])

      res.status(StatusCodes.OK).json({
        message: "Lấy thống kê thông báo thành công",
        stats: {
          byStatus: stats,
          byType: byType,
          total: stats.reduce((sum, s) => sum + s.count, 0)
        }
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      })
    }
  },

  // Search houses for authenticated customer
  searchCustomerHouses: async (req, res) => {
    try {
      const { phone, email } = req.body

      if (!phone && !email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Provide phone or email",
        })
      }

      const query = { hasOwner: true }

      if (email) {
        query["owner.email"] = email
      } else if (phone) {
        query["owner.phone"] = phone
      }

      const houses = await House.find(query)

      res.status(StatusCodes.OK).json({
        message: `Found ${houses.length} house(s)`,
        houses,
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      })
    }
  },
};