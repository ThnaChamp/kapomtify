const express = require('express');
const cors = require('cors');
const { userCreateSchema } = require('./models/user.schema');
const { createUser } = require('./services/user.service');
const musicRoutes = require('./routes/musicRoutes');
const albumRoutes = require('./routes/albumRoutes');
const artistRoutes = require('./routes/artistRoutes');
const genreRoutes = require('./routes/genreRoutes');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4567;

app.get('/health', (req,res) => {
    res.json({ status: 'ok', message: 'Server is running'});
});
app.use('/api/music', musicRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/genres', genreRoutes);

app.listen(PORT, () => {
    console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log(`Server is running on port ${PORT}`);
});
