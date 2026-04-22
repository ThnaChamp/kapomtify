const { z } = require('zod');

const userCreateSchema = z.object({
  username: z.string().min(3).max(40),
  email: z.string().email(),
  password: z.string().min(6), // รหัสผ่านดิบก่อนนำไป hash
  display_name: z.string().max(40).optional(),
});

module.exports = { userCreateSchema };