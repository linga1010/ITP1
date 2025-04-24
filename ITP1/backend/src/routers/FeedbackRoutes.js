import express from 'express';
import multer from 'multer';
import path from 'path';
import Feedback from '../models/Feedback.js';
import fs from 'fs';

const router = express.Router();

// Check if uploads folder exists, if not, create it
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // make sure the uploads folder exists at the project root
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpeg, jpg, png, gif) are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});

// GET all feedbacks
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new feedback with optional photo upload
router.post('/', upload.single('photo'), async (req, res) => {
  const { rating, comment } = req.body;

  // Validation for rating and comment
  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required.' });
  }

  const feedback = new Feedback({
    rating: req.body.rating,
    comment: req.body.comment,
    photo: req.file ? req.file.filename : undefined
  });

  try {
    const newFeedback = await feedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update feedback with optional photo update
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (req.body.rating) feedback.rating = req.body.rating;
    if (req.body.comment) feedback.comment = req.body.comment;
    if (req.file) {
      feedback.photo = req.file.filename;
    }

    const updatedFeedback = await feedback.save();
    res.json(updatedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE feedback
router.delete('/:id', async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!deletedFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
