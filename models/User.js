const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String },
  settings: {
    theme: { type: String, default: "dark" },
    model: { type: String, default: "gemini-2.5-flash" },
    temperature: { type: Number, default: 1.0 },
    persona: { type: String, default: "helpful_assistant" },
    fontSize: { type: String, default: "medium" }
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
