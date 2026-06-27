export const authorizeAdmin = (req, res, next) => {
    const role = req.get('x-user-role');
    if (role === 'Admin') {
        return next();
    }
    return res.status(403).json({ message: 'Admin access required' });
};
