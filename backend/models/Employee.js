import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    role: { type: String, enum: ['Admin', 'Manager', 'Employee'], default: 'Employee' },
    status: { type: String, enum: ['Active', 'Onboarding', 'Terminated'], default: 'Onboarding' },
    salary: { type: Number, default: 0 },
    leaveBalance: {
        annual: { type: Number, default: 18 },
        sick: { type: Number, default: 10 },
        casual: { type: Number, default: 6 },
    },
}, { timestamps: true });

const Employee = mongoose.model('Employee', EmployeeSchema);
export default Employee;
