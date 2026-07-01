import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        contactPerson: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
            default: '',
        },
        gstNumber: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('vendor', vendorSchema);
