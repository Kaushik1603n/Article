import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to DB");
  });

  mongoose.connection.on("error", (err) => { 
    console.error("Mongoose connection error:", err);
  });
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/WorkPlace`, {
      maxPoolSize: 10, 
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000, 
    });

    console.log("MongoDB Connected");

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("Mongoose connection closed (app termination)");
      process.exit(0);
    });
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

export default connectDB;