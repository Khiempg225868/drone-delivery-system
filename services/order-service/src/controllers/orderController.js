import Order from "../models/OrderModel.js";
import House from "../models/HouseModel.js";
import {
  calculateRouteDistance,
  nearestNeighbor,
  twoOpt,
} from "../services/routeOptimization.js";
import { optimizeRouteWithPython } from "../services/pythonOptimizer.js";
import { StatusCodes } from "http-status-codes";
import { randomUUID } from "crypto";
const DEPOT = { lat: 21.001763, lng: 105.941928 };

export const orderController = {
  toggleOrder: async (req, res) => {
    try {
      const { houseId, lat, lng, action, package: pkg } = req.body;
      const maxWeight = 15;

      if (!houseId || !action) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Missing required fields: houseId, action",
          success: false,
        });
      }

      if (action === "add") {
        const packageDescription = pkg?.description;
        const packageWeight = Number(pkg?.weight);

        if (!packageDescription || !Number.isFinite(packageWeight)) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Missing package description or weight",
            success: false,
          });
        }

        if (packageWeight <= 0 || packageWeight > maxWeight) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: `Package weight must be between 0 and ${maxWeight}kg`,
            success: false,
          });
        }

        const existingOrder = await Order.findOne({
          houseId,
          status: { $in: ["pending", "assigned"] },
        });

        if (existingOrder) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Order already exists for this house",
            success: false,
          });
        }

        const order = new Order({
          orderId: `ORD-${randomUUID().slice(0, 8)}`,
          houseId,
          lat: lat || 0,
          lng: lng || 0,
          status: "pending",
          package: {
            weight: packageWeight,
            description: packageDescription,
          },
        });

        await order.save();
      } else if (action === "remove") {
        await Order.findOneAndDelete({
          houseId,
          status: { $in: ["pending", "assigned"] },
        });
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Invalid action. Use 'add' or 'remove'",
          success: false,
        });
      }

      const orders = await Order.find({
        status: { $in: ["pending", "assigned"] },
      }).lean();

      const houseIds = orders.map((o) => {
        if (typeof o.houseId === "object") {
          return o.houseId.toString();
        }
        return o.houseId;
      });

      res.status(StatusCodes.OK).json({
        message: "Order toggled successfully",
        houseIds,
        orders,
        total: orders.length,
        success: true,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
        success: false,
      });
    }
  },

  getPendingOrders: async (req, res) => {
    try {
      const orders = await Order.find({
        status: { $in: ["pending", "assigned", "in_transit"] },
      });
      res.status(StatusCodes.OK).json(orders);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  removeOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      await Order.deleteOne({ orderId });
      res.status(StatusCodes.OK).json({ message: "Order removed" });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  optimizeRoute: async (req, res) => {
    try {
      const algorithm = req.body?.algorithm || "clustered_tsp_py";
      const orders = await Order.find({
        status: { $in: ["pending", "assigned", "in_transit"] },
      });

      const orderLocations = await Promise.all(
        orders.map(async (order) => {
          const house = await House.findById(order.houseId);
          return {
            houseId: order.houseId,
            lat: house.lat,
            lng: house.lng,
            address: house.address,
            orderId: order.orderId,
          };
        })
      );

      const startTime = Date.now();
      let routeIndexes = [];
      let totalDistanceKm = null;
      let algorithmTimeMs = null;
      let algorithmName = algorithm;

      if (algorithm === "clustered_tsp_py") {
        const pythonUrl = process.env.PYTHON_OPTIMIZER_URL || "http://localhost:8001/optimize";
        const pythonResult = await optimizeRouteWithPython({
          depot: DEPOT,
          locations: orderLocations,
          url: pythonUrl,
        });
        routeIndexes = pythonResult.route || [];
        totalDistanceKm = pythonResult.totalDistanceKm ?? null;
        algorithmTimeMs = pythonResult.algorithmTimeMs ?? null;
        algorithmName = pythonResult.algorithmName || algorithm;
      } else {
        const initialRoute = nearestNeighbor(DEPOT, orderLocations);
        routeIndexes = twoOpt(DEPOT, orderLocations, initialRoute);
      }

      if (totalDistanceKm === null) {
        totalDistanceKm = calculateRouteDistance(DEPOT, orderLocations, routeIndexes);
      }
      if (algorithmTimeMs === null) {
        algorithmTimeMs = Date.now() - startTime;
      }
      const optimizedAt = new Date();

      const route = routeIndexes.map((idx, i) => ({
        houseId: orderLocations[idx].houseId,
        address: orderLocations[idx].address,
        lat: orderLocations[idx].lat,
        lng: orderLocations[idx].lng,
        sequence: i + 1,
      }));

      await Promise.all(
        route.map((r) =>
          Order.updateOne(
            { houseId: r.houseId, status: { $in: ["pending", "assigned", "in_transit"] } },
            {
              $set: {
                sequence: r.sequence,
                status: "assigned",
                totalDistanceKm,
                algorithmName,
                algorithmTimeMs,
                optimizedAt,
              },
            }
          )
        )
      );

      res.status(StatusCodes.OK).json({
        route,
        totalDistanceKm,
        algorithmTimeMs,
        algorithmName,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  clearOrders: async (req, res) => {
    try {
      await Order.deleteMany({});
      res.status(StatusCodes.OK).json({ message: "Orders cleared" });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },
};
