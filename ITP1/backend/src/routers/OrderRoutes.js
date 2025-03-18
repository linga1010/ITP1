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

    const newOrder = new Order({ 
      user, 
      items, 
      total, 
      status: "pending", // Default status
      createdAt: new Date() 
    });

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

// ✅ GET route to fetch all orders (Admin View)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Fetch All Orders Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

// ✅ PUT route to update order status to success
router.put("/:id/confirm", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "success") {
      return res.status(400).json({ message: "Order is already confirmed" });
    }

    order.status = "success";
    await order.save();

    res.json({ message: "✅ Order confirmed successfully", order });
  } catch (error) {
    console.error("❌ Order Update Error:", error);
    res.status(500).json({ message: "❌ Internal Server Error", error: error.message });
  }
});

export default router;
