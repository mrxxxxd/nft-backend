module.exports = function (req, res, next) {
    // 401 if auth middleware didn't populate user
    if (!req.user) {
        return res.status(401).json({ message: 'Authorization required' });
    }

    // 403 if role is not admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }

    next();
};
