import express from 'express';
import Chat from '../models/Chat.js';

const router = express.Router();


router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const chats = await Chat.find({
        $or: [{ senderId: email }, { receiverId: email }],
      }).sort({ createdAt: 1 }); // Sort by creation date to get them in the correct order
  
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chats' });
    }
  });
  
  

export default router;
