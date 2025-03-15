// backend/models/Payment.js

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  location: {
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    required: true,
  },
  paymentDetails: {
    cardNumber: { type: String, required: true },
    cardExpiry: { type: String, required: true },
    cardCVV: { type: String, required: true },
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
