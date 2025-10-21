import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("MONGO_URI is:", process.env.MONGO_URI);
    const res = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`mongodb connected with server ${res.connection.host}`);
  } catch (error) {
    console.log("mongodb connection failed!");
    console.log(error);
  }
};
