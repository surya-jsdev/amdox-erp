import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['Annual', 'Sick', 'Casual'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    reason: { type: String },
    requestedBy: { type: String },
}, { timestamps: true });

const Leave = mongoose.model('Leave', LeaveSchema);
export default Leave;
