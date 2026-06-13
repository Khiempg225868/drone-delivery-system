import House from "../models/HouseModel.js";
import Order from "../models/OrderModel.js";
import { StatusCodes } from "http-status-codes";

export const houseController = {
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
      const circles = 5;
      const housesPerCircle = 20;

      for (let circle = 1; circle <= circles; circle++) {
        const radius = 0.002 * circle;
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

  getAllHouses: async (req, res) => {
    try {
      const houses = await House.find().lean();
      const orderedHouseIds = await Order.distinct("houseId", {
        status: { $in: ["pending", "assigned", "in_transit"] },
      });

      const orderedSet = new Set(orderedHouseIds.map((id) => id.toString()));
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

  getHousesByZone: async (req, res) => {
    try {
      const { zone } = req.params;
      const houses = await House.find({ zone }).lean();
      const orderedHouseIds = await Order.distinct("houseId", {
        status: { $in: ["pending", "assigned", "in_transit"] },
      });

      const orderedSet = new Set(orderedHouseIds.map((id) => id.toString()));
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

  addBatchHouses: async (req, res) => {
    try {
      const { houses } = req.body;

      if (!Array.isArray(houses) || houses.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Invalid houses data",
        });
      }

      const lastHouse = await House.findOne().sort({ houseId: -1 });
      let nextId = lastHouse ? lastHouse.houseId + 1 : 1;

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

  searchByOwner: async (req, res) => {
    try {
      const { name, phone, email } = req.body;

      if (!name && !phone && !email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Provide at least one search criteria: name, phone, or email",
        });
      }

      const query = { hasOwner: true };

      if (name) {
        query["owner.name"] = { $regex: name, $options: "i" };
      }
      if (phone) {
        query["owner.phone"] = phone;
      }
      if (email) {
        query["owner.email"] = { $regex: email, $options: "i" };
      }

      const houses = await House.find(query);

      res.status(StatusCodes.OK).json({
        message: `Found ${houses.length} house(s)`,
        houses,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  registerOwner: async (req, res) => {
    try {
      const { houseId } = req.params;
      const { name, phone, email } = req.body;

      if (!name || !phone) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Name and phone are required",
        });
      }

      const updatedHouse = await House.findByIdAndUpdate(
        houseId,
        {
          owner: { name, phone, email },
          hasOwner: true,
        },
        { new: true }
      );

      if (!updatedHouse) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "House not found",
        });
      }

      res.status(StatusCodes.OK).json({
        message: "Owner registered successfully",
        house: updatedHouse,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },

  searchCustomerHouses: async (req, res) => {
    try {
      const { phone, email } = req.body;

      if (!phone && !email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Provide phone or email",
        });
      }

      const query = { hasOwner: true };

      if (email) {
        query["owner.email"] = email;
      } else if (phone) {
        query["owner.phone"] = phone;
      }

      const houses = await House.find(query);

      res.status(StatusCodes.OK).json({
        message: `Found ${houses.length} house(s)`,
        houses,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  },
};
