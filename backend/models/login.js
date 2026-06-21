import mongoose from 'mongoose';

const LoginSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ["Admin", "Manager", "Employee"],
        default: "Employee"
    }
},
    {
        timestamps: true
    })

const User = mongoose.model('User', LoginSchema);

export default User;