const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  from: String,
  to: String,
  message: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
