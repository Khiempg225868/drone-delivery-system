import Delivery from "../models/Delivery.js";

const deliveryController = {
  getAllDeliveries: async (req, res) => {
    try {
      const deliveries = await Delivery.find().populate("droneId");
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMyDeliveries: async (req, res) => {
    try {
      const userEmail = req.user?.email;
      const userPhone = req.user?.phone;

      if (!userEmail && !userPhone) {
        return res.status(400).json({ message: "Missing user identity" });
      }

      const emailPattern = userEmail
        ? new RegExp(`^${userEmail.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "i")
        : null;

      const query = {
        $or: [
          ...(emailPattern ? [{ "receiver.email": emailPattern }] : []),
          ...(userPhone ? [{ "receiver.phone": userPhone }] : []),
        ],
      };

      const deliveries = await Delivery.find(query).sort({ createdAt: -1 }).populate("droneId");
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getDeliveryById: async (req, res) => {
    try {
      const delivery = await Delivery.findById(req.params.id).populate("droneId");
      if (!delivery) return res.status(404).json({ message: "Delivery not found" });
      res.json(delivery);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createDelivery: async (req, res) => {
    const delivery = new Delivery(req.body);
    try {
      const newDelivery = await delivery.save();
      res.status(201).json(newDelivery);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateDelivery: async (req, res) => {
    try {
      const delivery = await Delivery.findById(req.params.id);
      if (!delivery) return res.status(404).json({ message: "Delivery not found" });

      Object.assign(delivery, req.body);
      delivery.updatedAt = Date.now();
      const updatedDelivery = await delivery.save();
      res.json(updatedDelivery);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteDelivery: async (req, res) => {
    try {
      const delivery = await Delivery.findByIdAndDelete(req.params.id);
      if (!delivery) return res.status(404).json({ message: "Delivery not found" });
      res.json({ message: "Delivery deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  confirmDelivery: async (req, res) => {
    try {
      const { rating, feedback } = req.body;
      const delivery = await Delivery.findById(req.params.id);
      if (!delivery) return res.status(404).json({ message: "Delivery not found" });

      const receiverEmail = delivery.receiver?.email?.toLowerCase();
      const receiverPhone = delivery.receiver?.phone;
      const userEmail = req.user?.email?.toLowerCase();
      const userPhone = req.user?.phone;

      const isOwnerMatch =
        (receiverEmail && userEmail && receiverEmail === userEmail) ||
        (receiverPhone && userPhone && receiverPhone === userPhone);

      if (!isOwnerMatch) {
        return res.status(403).json({ message: "Only the receiving owner can confirm this delivery" });
      }

      if (delivery.status !== "delivered") {
        return res.status(400).json({ message: "Delivery is not marked as delivered" });
      }

      if (delivery.customerConfirmed) {
        return res.status(400).json({ message: "Delivery already confirmed" });
      }

      const ratingValue = Number(rating);
      if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      delivery.customerConfirmed = true;
      delivery.customerConfirmedAt = Date.now();
      delivery.customerRating = ratingValue;
      delivery.customerFeedback = typeof feedback === "string" ? feedback.trim() : undefined;
      delivery.updatedAt = Date.now();

      const updatedDelivery = await delivery.save();
      res.json(updatedDelivery);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

export default deliveryController;
