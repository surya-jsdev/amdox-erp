export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        const role = req.get('x-user-role');
        if (!role || !allowedRoles.includes(role)) {
            return res.status(403).json({ message: `${allowedRoles.join(' or ')} access required` });
        }
        return next();
    };
};
