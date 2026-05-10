const jwt = require('jsonwebtoken');

const authorizeRole = (requiredRole) => {
    return (req, res,next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if(!token) {
            return res.status(401).json({ message: "Access Denied: No Token Provided" });
        }
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
            req.user = verified;
            if (req.user.role !== requiredRole) {
                return res.status(403).json({
                    message:  `สิทธิ์ไม่พอ: เฉพาะ ${requiredRole} เท่านั้นที่ทำรายการนี้ได้`
                });
            }
            next();
        } catch (err) {
            res.status(400).json({ message: "Invalid Token"});
        }
    };
};
module.exports = { authorizeRole };