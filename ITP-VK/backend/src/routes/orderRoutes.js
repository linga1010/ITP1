const express = require("express");
const Order = require("../models/order");
const router = express.Router();

// POST Route to create an order
router.post("/", async (req, res) => {
    const { user, items, total } = req.body;
  
    console.log("📥 Received Order Data:", req.body); // Debugging log
  
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "❌ Invalid order items" });
    }
  
    if (!total || isNaN(total)) {
      return res.status(400).json({ message: "❌ Invalid order total" });
    }
  
    try {
      const newOrder = new Order({ user: user || "Guest", items, total });
      await newOrder.save();
      res.status(201).json({ message: "✅ Order created successfully", order: newOrder });
    } catch (error) {
      console.error("❌ Order Creation Error:", error);
      res.status(500).json({ message: "❌ Server error", error: error.message });
    }
  });
  

module.exports = router;
