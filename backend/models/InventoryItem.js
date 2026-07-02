import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
    {
        itemName: {
            type: String,
            required: true,
            trim: true,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        category: {
            type: String,
            trim: true,
            default: 'General',
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        reorderLevel: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        location: {
            type: String,
            trim: true,
            default: '',
        },
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'vendor',
            default: null,
        },
        status: {
            type: String,
            enum: ['In Stock', 'Low Stock', 'Out of Stock'],
            default: 'In Stock',
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('InventoryItem', inventoryItemSchema);
