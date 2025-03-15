import express from "express";
import Order from "../models/Order.js"; // Ensure correct import

const router = express.Router();

// ✅ POST route to place an order
router.post("/", async (req, res) => {  // <== Correct path
  try {
    const { user, items, total } = req.body;
    const newOrder = new Order({ user, items, total });
    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
