const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const rawId = decoded.id ?? decoded._id ?? decoded.userId;
            const id = rawId != null ? String(rawId).trim() : '';

            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(401).json({ message: 'Not authorized, invalid token' });
            }

            // `id` and `_id`: auth routes use .id; some legacy routes used ._id (was always undefined before).
            req.user = { id, _id: id };

            next();
        } catch (error) {
            console.error('Token Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };