const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const dbUrl =
  process.env.ATLASDB_URL ||
  process.env.ATLAS_URL ||
  "mongodb://127.0.0.1:27017/drifthaus";

main()
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  let demoUser = await User.findOne({ username: "delta-student" });
  if (!demoUser) {
    demoUser = await User.register(
      new User({ email: "student@gmail.com", username: "delta-student" }),
      "helloworld"
    );
  }
  const listings = initData.data.map((obj) => ({ ...obj, owner: demoUser._id }));
  await Listing.insertMany(listings);
  console.log("data was initialized");
  mongoose.connection.close();
};

initDB();
