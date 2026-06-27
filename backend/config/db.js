import mongoose from 'mongoose';

const connectDB = async () => {
    if (!process.env.MONGODB_URL) {
        console.warn('MONGODB_URL is not configured. Starting server without database access.');
        return false;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('MongoDB Connected');
        return true;
    }
    catch (error) {
        console.error('MongoDB connection failed:', error.message || error);
        return false;
    }
};

export default connectDB;