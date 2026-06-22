import User from "../models/User";

export const registerUser = async (req, res) => {
    try {
        const User = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role
        });
        res.status(201).json(User);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { registerUser };