import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, unique: true, trim: true },
        client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
        manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        budget: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
            default: 'Not Started',
        },
        progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
        description: { type: String, trim: true, default: '' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
