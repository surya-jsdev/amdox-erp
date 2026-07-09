import mongoose from 'mongoose';

const SystemSettingsSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
        default: 'AmDOX ERP'
    },
    companyEmail: {
        type: String,
        required: true,
        trim: true,
        default: 'info@amdox.com'
    },
    currency: {
        type: String,
        required: true,
        trim: true,
        default: 'USD'
    },
    taxRate: {
        type: Number,
        required: true,
        default: 18
    },
    fiscalYearStart: {
        type: String,
        required: true,
        trim: true,
        default: 'April'
    },
    allowAiFeatures: {
        type: Boolean,
        required: true,
        default: true
    },
    allowInventoryAlerts: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

const SystemSettings = mongoose.model('SystemSettings', SystemSettingsSchema);

export default SystemSettings;
