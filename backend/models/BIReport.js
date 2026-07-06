import mongoose from 'mongoose';

const biReportSchema = new mongoose.Schema(
    {
        reportName: { type: String, required: true, trim: true },
        createdBy: { type: String, required: true, trim: true },
        date: { type: Date, required: true, default: Date.now },
        status: { type: String, enum: ['Ready', 'Pending', 'Failed'], default: 'Ready' },
        fileSize: { type: String, default: '1.2 MB' },
    },
    { timestamps: true }
);

export default mongoose.model('BIReport', biReportSchema);
