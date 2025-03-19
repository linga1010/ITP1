const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Get all feedbacks
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a new feedback
router.post('/', async (req, res) => {
  const feedback = new Feedback({
    rating: req.body.rating,
    comment: req.body.comment
  });

  try {
    const newFeedback = await feedback.save();
    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update feedback
router.put('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (req.body.rating) feedback.rating = req.body.rating;
    if (req.body.comment) feedback.comment = req.body.comment;

    const updatedFeedback = await feedback.save();
    res.json(updatedFeedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/// DELETE feedback by ID
router.delete("/:id", async (req, res) => {
    try {
      const feedbackId = req.params.id;
      const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);
  
      if (!deletedFeedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
  
      res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
