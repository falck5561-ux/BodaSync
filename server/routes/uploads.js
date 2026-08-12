const express = require('express');

const {
  uploadWeddingMedia
} = require('../middleware/upload');

const {
  uploadWeddingMedia: uploadWeddingMediaController
} = require('../controllers/uploadController');

const {
  requireAdmin
} = require('../middleware/requireAdmin');

const router = express.Router();

/*
 * =========================================================
 * SUBIR MULTIMEDIA
 * =========================================================
 *
 * POST /api/uploads
 *
 * Fotografías:
 * - portada
 * - pareja
 * - galería
 *
 * Audio:
 * - música de fondo
 *
 * Solo el administrador autenticado puede subir archivos.
 *
 * requireAdmin se ejecuta ANTES de Multer para evitar que
 * usuarios no autorizados puedan enviar archivos o consumir
 * recursos del servidor.
 */

router.post(
  '/',
  requireAdmin,
  uploadWeddingMedia,
  uploadWeddingMediaController
);

module.exports = router;