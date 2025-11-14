import mongoose from "mongoose"

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 30000, // Timeout after 30s
            socketTimeoutMS: 45000, // Close sockets after 45s
        });
        console.log("DB Connected Successfully!");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
}

export default connectDb;
