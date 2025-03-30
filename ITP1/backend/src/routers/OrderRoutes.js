import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

//  Place an order
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
      createdAt: new Date(),
    });

    await newOrder.save();

    res.status(201).json({ message: "✅ Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("❌ Order Placement Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

//  Fetch all orders (Admin View)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Fetch All Orders Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

//  Fetch orders by user ID (User View)
router.get("/:userId", async (req, res) => {
  try {
    const userId = decodeURIComponent(req.params.userId);
    console.log("Fetching orders for user:", userId);
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    // Instead of returning 404, return an empty array if no orders found
    if (!orders.length) {
      return res.status(200).json([]);
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Fetch Orders Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

//  Confirm order (Change status to "success")
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

    res.json({ message: "✅ Order confirmed successfully!", order });
  } catch (error) {
    console.error("❌ Order Update Error:", error.message);
    res.status(500).json({ message: "❌ Internal Server Error", error: error.message });
  }
});
//  Ship Order
router.put("/:id/ship", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "success") return res.status(400).json({ message: "Order cannot be shipped" });

    order.status = "shipped";
    await order.save();
    res.json({ message: "✅ Order marked as shipped", order });
  } catch (error) {
    console.error("❌ Ship Order Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

//  Deliver Order
router.put("/:id/deliver", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "shipped") return res.status(400).json({ message: "Order cannot be delivered" });

    order.status = "delivered";
    await order.save();
    res.json({ message: "✅ Order marked as delivered", order });
  } catch (error) {
    console.error("❌ Deliver Order Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});


//  Change order status to "removed" (instead of deleting the order)
router.put("/:id/remove", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "removed";
    await order.save();

    res.json({ message: "✅ Order status changed to 'removed' successfully!", order });
  } catch (error) {
    console.error("❌ Order Removal Error:", error.message);
    res.status(500).json({ message: "❌ Internal Server Error", error: error.message });
  }
});

export default router;
