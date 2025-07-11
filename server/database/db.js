const mongoose = require("mongoose");

require("dotenv").config();

//mongodb connection
const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB Connection Failed", error.message);
  }
};

module.exports = connectDB;