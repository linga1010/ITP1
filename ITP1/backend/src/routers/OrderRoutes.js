import express from "express";
import Order from "../models/Order.js";
import Product from '../models/Product.js';

const router = express.Router();

// ✅ POST: Place an order
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

// ✅ GET: Fetch all orders (Admin View)
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

// ✅ GET: Fetch orders by user ID (User View)
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId; // Extract userId from the route parameter
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Fetch Orders Error:", error.message);
    res.status(500).json({ message: "❌ Server Error", error: error.message });
  }
});



// ✅ PUT: Confirm order (Change status to "success")
export const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "success") {
      return res.status(400).json({ message: "Order is already confirmed" });
    }

    // Reduce product quantity in inventory
    for (const item of order.items) {
      let quantityToSubtract = item.quantity; // Define quantityToSubtract based on item quantity

      if (item.packageId) {
        // If it's a package, get the package details
        const packageDetails = await Package.findById(item.packageId).populate('products.productId');
        if (!packageDetails) {
          return res.status(404).json({ message: `Package not found for item ${item.name}` });
        }

        // Loop through each product in the package
        for (const packageProduct of packageDetails.products) {
          const product = packageProduct.productId;
          const quantityInPackage = packageProduct.quantity * item.quantity; // Adjust package quantity based on item quantity

          if (product) {
            // Ensure sufficient stock and reduce the quantity
            if (product.quantity >= quantityInPackage) {
              product.quantity -= quantityInPackage; // Subtract the correct total quantity
              await product.save();
            } else {
              return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }
          }
        }
      } else {
        // If it's not a package, update individual product quantity
        const product = await Product.findOne({ name: item.name });

        if (product) {
          if (product.quantity >= quantityToSubtract) {
            product.quantity -= quantityToSubtract; // Subtract the product quantity
            await product.save();
          } else {
            return res.status(400).json({ message: `Not enough stock for ${product.name}` });
          }
        } else {
          return res.status(404).json({ message: `Product ${item.name} not found` });
        }
      }
    }

    // Update order status to success
    order.status = "success";
    await order.save();

    res.json({ message: "✅ Order confirmed successfully and inventory updated!", order });
  } catch (error) {
    console.error("❌ Order Update Error:", error.message);
    res.status(500).json({ message: "❌ Internal Server Error", error: error.message });
  }
};

// ✅ PUT: Confirm order (Change status to "success")
router.put("/:id/confirm", confirmOrder);




// ✅ PUT: Change order status to "removed" (instead of deleting the order)
router.put("/:id/remove", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Change status to "removed"
    order.status = "removed";
    await order.save();

    res.json({ message: "✅ Order status changed to 'removed' successfully!", order });
  } catch (error) {
    console.error("❌ Order Removal Error:", error.message);
    res.status(500).json({ message: "❌ Internal Server Error", error: error.message });
  }
});

export default router;
