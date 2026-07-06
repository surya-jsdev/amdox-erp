import mongoose from 'mongoose';

const biSalesRecordSchema = new mongoose.Schema(
    {
        date: { type: Date, required: true },
        revenue: { type: Number, required: true, min: 0 },
        profit: { type: Number, required: true },
        cost: { type: Number, required: true, min: 0 },
        unitsSold: { type: Number, required: true, min: 0 },
        productName: { type: String, required: true, trim: true },
        productCategory: { type: String, required: true, trim: true },
        branch: { type: String, required: true, trim: true },
        department: { type: String, required: true, trim: true },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        employeeName: { type: String, trim: true },
        client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
        clientName: { type: String, trim: true },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        projectName: { type: String, trim: true },
        status: { type: String, required: true, trim: true }, // e.g., 'Completed', 'Pending', 'Cancelled'
    },
    { timestamps: true }
);

export default mongoose.model('BISalesRecord', biSalesRecordSchema);
