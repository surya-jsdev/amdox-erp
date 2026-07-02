import User from '../models/User.js';

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password -confirmpassword -__v');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = { ...req.body };

        delete updates.password;
        delete updates.confirmpassword;

        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        }).select('-password -confirmpassword -__v');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
