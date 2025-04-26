import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Package from "../models/Package.js";
import Product from "../models/Product.js";

const router = express.Router();
// Place an order
router.post("/", async (req, res) => {
  try {
    // 🔥 pull location out of the body
    const { user, userName, items, total, location } = req.body;

    // 🔥 validate that location is present
    if (!user || !items || items.length === 0 || !total || !location) {
      return res
        .status(400)
        .json({ message: "Invalid order data! All fields (including location) are required." });
    }

    // 🔥 include location when creating the order
    const newOrder = new Order({
      user,
      userName,
      items,
      total,
      location,        // ← store location
      status: "pending",
      createdAt: new Date(),
    });

    await newOrder.save();
    res.status(201).json({ message: "✅ Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("❌ Order Placement Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});


// Fetch all orders (Admin View)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Fetch All Orders Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

// Fetch orders by user ID (User View)
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

// Confirm order (Change status to "success" and reduce stock)
router.put("/:id/confirm", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "success") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Order is already confirmed" });
    }

    const requiredQuantities = {}; // { productId: totalQty }

    for (const item of order.items) {
      const pkg = await Package.findOne({ name: item.name }).session(session);
      if (!pkg) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Package '${item.name}' not found` });
      }

      for (const { productId, quantity } of pkg.products) {
        const totalRequired = quantity * item.quantity;
        const key = productId.toString();
        requiredQuantities[key] = (requiredQuantities[key] || 0) + totalRequired;
      }
    }

    const productIds = Object.keys(requiredQuantities);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);

    for (const product of products) {
      const requiredQty = requiredQuantities[product._id.toString()];
      if (product.quantity < requiredQty) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for '${product.name}'. Required: ${requiredQty}, Available: ${product.quantity}`
        });
      }
    }

    for (const product of products) {
      const requiredQty = requiredQuantities[product._id.toString()];
      product.quantity -= requiredQty;
      await product.save({ session });
    }

    order.status = "success";
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "✅ Order confirmed and inventory updated successfully!", order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Order Confirm Error:", error);
    res.status(500).json({ message: "❌ Internal Server Error", error: error.message });
  }
});

// Ship Order
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

// Deliver Order
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

// Change order status to "removed" (instead of deleting the order)
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

// Cancel pending order
router.put("/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "pending") return res.status(400).json({ message: "Only pending orders can be canceled" });

    order.status = "canceled";
    await order.save();

    res.json({ message: "✅ Order canceled successfully!", order });
  } catch (error) {
    console.error("❌ Cancel Order Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});

export default router;
