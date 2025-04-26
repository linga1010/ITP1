import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: { type: String, required: true },
  userName: { type: String },
  items: [
    {
      name: String,
      price: Number,
      finalPrice: Number,
      quantity: { type: Number, min: 1, max: 100 },
    },
  ],
  total: { type: Number, required: true },
  location: { type: String, required: true },  // Add location field
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
