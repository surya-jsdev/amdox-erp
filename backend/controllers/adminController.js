import User from '../models/User.js';

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load users' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load user' });
    }
};

export const createUser = async (req, res) => {
    try {
        const { name, email, companyname, password, role } = req.body;
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ message: 'Email already exists' });

        const newUser = await User.create({
            name,
            email,
            companyname,
            password,
            role: role || 'Employee',
        });

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create user' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { name, email, companyname, role, password } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (email && email.toLowerCase() !== user.email) {
            const existing = await User.findOne({ email: email.toLowerCase() });
            if (existing) return res.status(400).json({ message: 'Email already exists' });
        }

        user.name = name ?? user.name;
        user.email = email ? email.toLowerCase() : user.email;
        user.companyname = companyname ?? user.companyname;
        user.role = role ?? user.role;
        if (password) user.password = password;

        const updatedUser = await user.save();
        const result = updatedUser.toObject();
        delete result.password;
        res.json({ message: 'User updated successfully', user: result });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete user' });
    }
};
