import mongoose from "mongoose";


const purchaseOrderSchema = new mongoose.Schema({
    poNumber: {
        type: String,
        required: true,
        unique: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vendor",
        required: true
    },
    items: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Inventory"
            },

            quantity: Number,
            unitPrice: Number,
            total: Number
        }
    ],

    totalAmount: Number,

    status: {
        type: String,
        enum: [
            "Pending",
            "Approved",
            "Received",
            "Cancelled"
        ],
        default: "Pending"
    },

    expectedDeliveryDate: Date
}, { timestamps: true });


export default mongoose.model("PurchaseOrder", purchaseOrderSchema);