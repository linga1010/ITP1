import Payment from '../models/Payment.js';

export const processPayment = async (req, res) => {
  try {
    const { cardNumber, holderName, expiryDate, cvv, totalPrice, userId } = req.body;

    // Validate required fields
    if (!cardNumber || !holderName || !expiryDate || !cvv || totalPrice === undefined || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new payment instance
    const newPayment = new Payment({
      userId,         // User who made the payment
      cardNumber,     // Card number (Note: Don't store sensitive data in production!)
      holderName,     // Cardholder name
      expiryDate,     // Card expiry date
      cvv,            // CVV (Consider removing for security reasons in production)
      totalPrice,     // Total price of the order
      paymentStatus: "pending",  // Default status is "pending"
    });

    // Save the payment to the database
    await newPayment.save();

    // Respond with success message
    res.json({ success: true, message: "Payment processed and stored successfully!" });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
