const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoosePackage = require("passport-local-mongoose");
const passportLocalMongoose =
  passportLocalMongoosePackage.default || passportLocalMongoosePackage;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
