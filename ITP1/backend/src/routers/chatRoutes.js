import express from 'express';
import Chat from '../models/Chat.js';

const router = express.Router();

// ✅ Inside route
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params; // Extract email from URL like /api/chats/sam@gmail.com
    const chats = await Chat.find({
      $or: [{ senderId: email }, { receiverId: email }],
    }).sort({ createdAt: 1});

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});


export default router;
