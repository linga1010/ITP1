import express from 'express';
import { addInvoice, deleteInvoice, getAllInvoices } from '../controllers/invoiceController.js';

const router = express.Router();

// Add new invoice
router.post('/', addInvoice);

// Delete an invoice
router.delete('/:invoiceNumber', deleteInvoice);

// Get all invoices
router.get('/', getAllInvoices);

export default router;
