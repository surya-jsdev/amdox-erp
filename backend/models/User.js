import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    companyname: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    reportingManager: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    dateOfJoining: {
        type: Date
    },
    about: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String,
        trim: true
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

const User = mongoose.model('User', UserSchema);

export default User;