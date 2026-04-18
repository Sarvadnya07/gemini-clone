const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  id: String,
  role: { type: String, enum: ['user', 'assistant'] },
  content: String,
  attachments: [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  id: { type: String, required: true, unique: true },
  title: String,
  pinned: { type: Boolean, default: false },
  messages: [MessageSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chat', ChatSchema);
