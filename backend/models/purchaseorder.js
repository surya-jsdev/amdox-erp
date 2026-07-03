import mongoose from "mongoose";


const purchaseOrderSchema = new mongoose.Schema({
    poNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendor',
        required: true,
    },
    items: [
        {
            description: {
                type: String,
                required: true,
                trim: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            unitPrice: {
                type: Number,
                required: true,
                min: 0,
            },
            total: {
                type: Number,
                required: true,
                min: 0,
            },
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: [
            'Pending',
            'Approved',
            'Received',
            'Cancelled'
        ],
        default: 'Pending'
    },
    expectedDeliveryDate: {
        type: Date,
        default: null,
    },
    notes: {
        type: String,
        trim: true,
        default: '',
    },
    createdBy: {
        type: String,
        default: null,
    },
    approvedBy: {
        type: String,
        default: null,
    },
    history: [
        {
            status: String,
            changedBy: String,
            changedAt: Date,
            comment: String,
        }
    ]
}, { timestamps: true });

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);