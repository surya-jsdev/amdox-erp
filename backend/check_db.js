import mongoose from 'mongoose';
import dotenv from 'dotenv';
import InventoryItem from './models/InventoryItem.js';
import connectDB from './config/db.js';

dotenv.config();

const run = async () => {
    await connectDB();
    const inventoryCount = await InventoryItem.countDocuments();
    console.log('InventoryItem count:', inventoryCount);

    if (inventoryCount > 0) {
        const items = await InventoryItem.find();
        console.log('Items in inventory:');
        items.forEach(item => {
            console.log(`- ${item.itemName} (SKU: ${item.sku}), Category: ${item.category}, Qty: ${item.quantity}, Reorder: ${item.reorderLevel}`);
        });
    } else {
        console.log('No inventory items found.');
    }
    mongoose.connection.close();
};

run().catch(console.error);
