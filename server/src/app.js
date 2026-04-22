const express = require('express');
const cors = require('cors');
const { userCreateSchema } = require('./models/user.schema');
const { createUser } = require('./services/user.service');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4567;

app.get('/health', (req,res) => {
    res.json({ status: 'ok', message: 'Server is running'});
});

app.post('/api/users',async (req, res) => {
    try {
        const validatedData = userCreateSchema.parse(req.body);
        const newUser = await createUser(validatedData);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message || error});
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
