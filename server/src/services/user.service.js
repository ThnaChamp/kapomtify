const pool = require('../db/pool');

const createUser = async (userData) => {
  const { username, email, password, display_name } = userData;
  
  // ในโปรเจคจริงควรใช้ bcrypt ทำการ hash password ตรงนี้ก่อนเก็บนะครับ!
  const query = `
    INSERT INTO users (username, email, password_hash, display_name)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id, username, email;
  `;
  
  const values = [username, email, password, display_name];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

module.exports = { createUser };