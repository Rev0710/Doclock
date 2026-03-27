const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user id to the request object
            req.user = { id: decoded.id };

            next();
        } catch (error) {
            console.error("Token Verification Error:", error.message);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }
};

module.exports = { protect };