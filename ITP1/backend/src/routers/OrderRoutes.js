import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// ✅ POST route to place an order
router.post("/", async (req, res) => {
  try {
    const { user, items, total } = req.body;

    if (!user || !items || items.length === 0 || !total) {
      return res.status(400).json({ message: "Invalid order data!" });
    }

    const newOrder = new Order({ user, items, total, createdAt: new Date() });
    await newOrder.save();

    res.status(201).json({ message: "✅ Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("❌ Order Placement Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

// ✅ GET route to fetch order history by user
router.get("/:user", async (req, res) => {
  try {
    const user = req.params.user;
    const orders = await Order.find({ user }).sort({ createdAt: -1 }); // Latest orders first

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Fetch Orders Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

export default router;
