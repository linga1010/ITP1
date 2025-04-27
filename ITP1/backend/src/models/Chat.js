import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    senderId: {
      type: String, // sender can be a user or admin
      required: true,
    },
    receiverId: {
      type: String, // receiver can be a user or admin
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  }, { timestamps: true }); // Timestamps to track when each message was sent.
  
  const Chat = mongoose.model('Chat', chatSchema);
  
  export default Chat;
