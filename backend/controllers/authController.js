import User from "../models/User.js";

// Register Controller

export const registerUser = async (req, res) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            companyname: req.body.companyname,
            password: req.body.password,
            role: req.body.role
        });
        res.status(201).json({ message: 'User created successfully', user: newUser });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Login  controller

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

