import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      rate: { type: Number, required: true },
      amount: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // Discount percentage (e.g., 10 for 10%)
  amountAfterDiscount: { type: Number }, // Final amount after discount is applied
});


export default mongoose.model('Invoice', InvoiceSchema);

//C:\Destop\Linga\ITP1\ITP1\backend\src\models\invoice.js
