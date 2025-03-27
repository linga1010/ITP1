// C:\Users\Admin\Desktop\new\ITP1\backend\src\routers\packageRoutes.js

import express from 'express';
import multer from 'multer';
import { createPackage, getPackages, getPackageById, updatePackage, deletePackage } from '../controllers/PackageController.js';

const router = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed!'), false);
};

const upload = multer({ storage, fileFilter });

// Routes
router.post('/', upload.single('image'), createPackage);
router.get('/', getPackages);
router.get('/:id', getPackageById);
router.put('/:id', upload.single('image'), updatePackage);
router.delete('/:id', deletePackage);

export default router;  // Use export default
