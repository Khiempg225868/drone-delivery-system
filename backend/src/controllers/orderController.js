import Order from "../models/OrderModel.js";
import House from "../models/HouseModel.js";
import { nearestNeighbor, twoOpt } from "../services/routeOptimization.js";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
const DEPOT = { lat: 21.001763, lng: 105.941928 };

export const orderController = {
  // Toggle order (add/remove)
  toggleOrder: async (req, res) => {
    try {
      const { houseId, lat, lng, action } = req.body;

      console.log("Toggle order request:", { houseId, lat, lng, action });

      if (!houseId || !action) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Missing required fields: houseId, action",
          success: false,
        });
      }

      if (action === "add") {
        // Check if order already exists
        const existingOrder = await Order.findOne({
          houseId,
          status: { $in: ["pending", "assigned"] },
        });

        if (existingOrder) {
          console.log("Order already exists for houseId:", houseId);
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Order already exists for this house",
            success: false,
          });
        }

        // Create new order
        const order = new Order({
          orderId: `ORD-${uuidv4().slice(0, 8)}`,
          houseId,
          lat: lat || 0,
          lng: lng || 0,
          status: "pending",
        });

        console.log("Creating new order:", order);
        await order.save();
        console.log("✅ Order saved successfully");
      } else if (action === "remove") {
        // Remove order
        console.log("Removing order for houseId:", houseId);
        const deleted = await Order.findOneAndDelete({
          houseId,
          status: { $in: ["pending", "assigned"] },
        });
        console.log("✅ Order deleted:", deleted);
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Invalid action. Use 'add' or 'remove'",
          success: false,
        });
      }

      // Get all active orders
      const orders = await Order.find({
        status: { $in: ["pending", "assigned"] },
      }).lean();

      console.log("📊 Total active orders:", orders.length);

      // Convert to array of houseId strings
      const houseIds = orders.map((o) => {
        if (typeof o.houseId === "object") {
          return o.houseId.toString();
        }
        return o.houseId;
      });

      res.status(StatusCodes.OK).json({
        message: "Order toggled successfully",
        orders: houseIds,
        success: true,
      });
    } catch (error) {
      console.error("❌ Toggle order error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error toggling order",
        error: error.message,
        success: false,
      });
    }
  },

  // Get all pending orders
  getPendingOrders: async (req, res) => {
    try {
      const orders = await Order.find({
        status: { $in: ["pending", "assigned"] },
      }).populate("houseId");
      res.status(StatusCodes.OK).json(orders);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  // Remove order
  removeOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findByIdAndDelete(orderId);
      if (!order) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Order not found" });
      }
      res.status(StatusCodes.OK).json({ message: "Order deleted" });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  // Optimize delivery route
  optimizeRoute: async (req, res) => {
    try {
      const orders = await Order.find({
        status: { $in: ["pending", "assigned"] },
      });

      if (orders.length === 0) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "No pending orders" });
      }

      const locations = orders.map((o) => ({
        lat: o.lat,
        lng: o.lng,
        orderId: o._id,
      }));

      let route = nearestNeighbor(DEPOT, locations);
      route = twoOpt(DEPOT, locations, route);

      for (let i = 0; i < route.length; i++) {
        await Order.findByIdAndUpdate(orders[route[i]]._id, {
          sequence: i + 1,
          status: "assigned",
        });
      }

      res.status(StatusCodes.OK).json({
        message: "Route optimized",
        route: route.map((idx) => ({
          index: idx,
          orderId: orders[idx]._id,
          houseId: orders[idx].houseId,
          sequence: idx + 1,
        })),
        totalOrders: orders.length,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  // Clear all pending orders
  clearOrders: async (req, res) => {
    try {
      await Order.deleteMany({
        status: { $in: ["pending", "assigned"] },
      });
      res.status(StatusCodes.OK).json({ message: "All orders cleared" });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },
};