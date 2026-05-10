const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require("../db/pool");
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // ตรวจสอบว่า db.query พร้อมใช้งาน
        const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: "Invalid Username or Password" });
        }
        if (user.role !== 'admin' && user.role !== 'super_admin' ) {
            return res.status(403).json({ message: "Access Denied: Admins only" });
        }

        // สำคัญ: ตรวจสอบชื่อคอลัมน์ใน DB ของคุณ (จาก INSERT ก่อนหน้าคือ password_hash)
        const dbPassword = user.password_hash || user.password;

        if (password !== dbPassword) {
            return res.status(401).json({ message: "Invalid Username or Password" });
        }

        const token = jwt.sign(
            { id: user.user_id, role: user.role }, // ใช้ user_id ตามตารางของคุณ
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Login Successful",
            token,
            user: { username: user.username, role: user.role }
        });

    } catch (err) {
        // ส่งข้อความ Error ออกมาดูเพื่อการ Debug
        console.error("Database Error:", err); 
        res.status(500).json({ error: err.message });
    }
};

module.exports = { login };