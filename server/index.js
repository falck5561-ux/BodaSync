const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const weddingRoutes = require('./routes/weddings');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173'
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Servidor funcionando'
  });
});

app.use('/api/weddings', weddingRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB conectado correctamente');

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No fue posible iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();