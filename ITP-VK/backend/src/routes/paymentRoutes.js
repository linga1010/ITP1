// backend/routes/paymentRoutes.js

const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");

// Endpoint to save payment details
router.post("/payment", async (req, res) => {
  try {
    const { location, paymentDetails } = req.body;
    // Create a new payment object in the database
    const newPayment = new Payment({
      location,
      paymentDetails,
    });

    await newPayment.save();
    res.status(200).json({ message: "Payment details saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving payment details!" });
  }
});

module.exports = router;
