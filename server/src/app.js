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
    console.log(`Server is running on port ${PORT}`);
});
