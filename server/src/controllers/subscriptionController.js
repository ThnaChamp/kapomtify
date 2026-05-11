const db = require("../db/pool");

/**
 * ดึงข้อมูลแผนสมาชิกทั้งหมด (รองรับการค้นหาผ่าน query string)
 * GET /api/subscriptions?search=...
 */
const getAllSubscriptions = async (req, res) => {
    try {
        const { search } = req.query;
        let query = "SELECT * FROM subscription_plan";
        let params = [];

        if (search) {
            query += " WHERE plan_name ILIKE $1 OR plan_code ILIKE $1";
            params.push(`%${search}%`);
        }
        
        query += " ORDER BY price ASC";
        const result = await db.query(query, params);
        
        res.status(200).json({
            data: result.rows
        });
    } catch (err) {
        console.error("Error at getAllSubscriptions:", err.message);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลแผนสมาชิก" });
    }
};

/**
 * สร้างแผนสมาชิกใหม่
 * POST /api/subscriptions
 */
const createSubscription = async (req, res) => {
    // 1. ดึง Client ออกมาเพื่อทำ Transaction
    const client = await db.connect();
    
    const { plan_name, price, duration_day, description } = req.body;
    
    // ตรวจสอบข้อมูลเบื้องต้น (ไม่ต้องเช็ค plan_code เพราะเราจะเจนเอง)
    if (!plan_name || price === undefined || !duration_day) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อแผน, ราคา, ระยะเวลา)" });
    }

    try {
        await client.query('BEGIN'); // เริ่มต้น Transaction

        // 2. INSERT ข้อมูลแผนสมาชิก (เว้น plan_code ไว้ก่อน)
        const insertQuery = `
            INSERT INTO subscription_plan (plan_name, price, duration_day, description)
            VALUES ($1, $2, $3, $4)
            RETURNING plan_id;
        `;
        const result = await client.query(insertQuery, [
            plan_name, 
            price, 
            duration_day, 
            description || null
        ]);

        const newPlanId = result.rows[0].plan_id;

        // 3. ✅ สร้าง Code อัตโนมัติ (เช่น SUB-1, SUB-2)
        const generatedCode = `P00${newPlanId}`;

        // 4. UPDATE รหัสกลับเข้าไปที่แถวเดิม
        const updateQuery = `UPDATE subscription_plan SET plan_code = $1 WHERE plan_id = $2`;
        await client.query(updateQuery, [generatedCode, newPlanId]);

        await client.query('COMMIT'); // ยืนยันการบันทึกข้อมูล

        res.status(201).json({ 
            message: "สร้างแผนสมาชิกสำเร็จ!", 
            plan_code: generatedCode,
            data: { ...result.rows[0], plan_code: generatedCode }
        });

    } catch (err) {
        await client.query('ROLLBACK'); // ยกเลิกหากเกิดข้อผิดพลาด
        console.error("Error at createSubscription:", err.message);
        res.status(500).json({ error: "ไม่สามารถสร้างแผนสมาชิกได้: " + err.message });
    } finally {
        client.release(); // คืน Connection
    }
};

/**
 * ลบแผนสมาชิก
 * DELETE /api/subscriptions/:id
 */
const deleteSubscription = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("DELETE FROM subscription_plan WHERE plan_id = $1", [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "ไม่พบแผนสมาชิกที่ต้องการลบ" });
        }
        
        res.status(200).json({ message: "ลบแผนสมาชิกเรียบร้อยแล้ว" });
    } catch (err) {
        console.error("Error at deleteSubscription:", err.message);
        // กรณีลบไม่ได้เพราะติด Foreign Key (เช่น มีคนใช้งานแผนนี้อยู่)
        if (err.code === '23503') {
            return res.status(400).json({ error: "ไม่สามารถลบได้เนื่องจากมีผู้ใช้งานกำลังใช้งานแผนนี้อยู่" });
        }
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบแผนสมาชิก" });
    }
};

module.exports = {
    getAllSubscriptions,
    createSubscription,
    deleteSubscription
};
