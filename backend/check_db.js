import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BISalesRecord from './models/BISalesRecord.js';
import BIReport from './models/BIReport.js';
import connectDB from './config/db.js';

dotenv.config();

const run = async () => {
    await connectDB();
    console.log('Clearing old BI data to allow re-seeding...');
    const salesDelete = await BISalesRecord.deleteMany({});
    const reportDelete = await BIReport.deleteMany({});
    console.log('Deleted sales records count:', salesDelete.deletedCount);
    console.log('Deleted reports count:', reportDelete.deletedCount);
    mongoose.connection.close();
};

run().catch(console.error);
