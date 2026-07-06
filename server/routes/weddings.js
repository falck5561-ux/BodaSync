const express = require('express');
const router = express.Router();
const weddingController = require('../controllers/weddingController');

// Ruta GET pública: localhost:5000/api/weddings/manuel-y-luz-2026
router.get('/:slug', weddingController.getWeddingBySlug);

// Ruta POST privada (para el panel admin): localhost:5000/api/weddings
router.post('/', weddingController.createWedding);

module.exports = router;