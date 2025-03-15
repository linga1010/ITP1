const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import Routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes =require("./routes/paymentRoutes");
const paymentDetailsRoutes =require("./routes/paymentDetailsRoutes");

// Use Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments",paymentRoutes);
app.use("/api/paymentDetails",paymentDetailsRoutes);

module.exports = app;
