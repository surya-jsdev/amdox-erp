import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
    {
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
            default: 'Open',
        },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model('Issue', issueSchema);
