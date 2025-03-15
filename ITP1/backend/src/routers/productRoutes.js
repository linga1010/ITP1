import express from 'express';
import { addProduct, deleteProduct, updateProduct, getProducts } from '../controllers/productController.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer setup for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
});

// API Routes
router.get('/', getProducts);
router.post('/add', upload.single('image'), addProduct);
router.delete('/:sku', deleteProduct);
router.put('/:sku', upload.single('image'), updateProduct);

export default router;
