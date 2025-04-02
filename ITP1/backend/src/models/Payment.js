// src/models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cardNumber: { type: String, required: true },
    holderName: { type: String, required: true },
    expiryDate: { type: String, required: true },
    cvv: { type: String, required: true, select: false },
    totalPrice: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "Complete" }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);
