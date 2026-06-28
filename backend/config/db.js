import mongoose from 'mongoose';

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error('MongoDB connection string not found. Set MONGODB_URI in the backend .env file.');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri, {
            dbName: process.env.MONGODB_DB || 'amdox_erp',
            serverSelectionTimeoutMS: 10000,
            retryWrites: true,
            w: 'majority',
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

export default connectDB;