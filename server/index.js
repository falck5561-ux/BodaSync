const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares (Permiten que el frontend se comunique y reciba JSON)
app.use(cors());
app.use(express.json());

// Rutas
const weddingRoutes = require('./routes/weddings');
app.use('/api/weddings', weddingRoutes);

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔥 Conectado a MongoDB Atlas con éxito'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Levantar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});