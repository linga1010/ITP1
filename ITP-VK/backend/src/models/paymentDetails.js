const mongoose = require('mongoose');

const PaymentDetailSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true }
});

module.exports = mongoose.model('PaymentDetail', PaymentDetailSchema);
