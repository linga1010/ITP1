import mongoose from 'mongoose';

const deletedUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  reason: String,
  deletedAt: { type: Date, default: Date.now },
});

export default mongoose.model('DeletedUser', deletedUserSchema);
