import mongoose from "mongoose";

export async function connectDB() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error("MONGODB_URI environment variable is required");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri, { dbName: 'transportgo' });
        console.log("Connected to MongoDB Atlas");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}
