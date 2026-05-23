const mongoose = require("mongoose");
const initData = require("./chatData.js");
const Chat = require("../models/chat.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/drifthaus";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initChats = async () => {
  await Chat.deleteMany({});
  await Chat.insertMany(initData.data);
  console.log("chat data was initialized");
};

initChats();
