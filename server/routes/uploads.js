const express = require('express');

const {
  uploadWeddingMedia
} = require('../middleware/upload');

const {
  uploadWeddingMedia: uploadWeddingMediaController,
  createUploadSignature
} = require('../controllers/uploadController');

const {
  requireAdmin
} = require('../middleware/requireAdmin');

const router = express.Router();

/*
 * =========================================================
 * FIRMA PARA SUBIDA DIRECTA A CLOUDINARY
 * =========================================================
 *
 * POST /api/uploads/signature
 *
 * Esta ruta NO recibe imágenes ni música.
 *
 * Únicamente:
 * - verifica que el usuario sea administrador
 * - genera una firma segura de Cloudinary
 * - devuelve los datos necesarios para subir
 *   directamente desde el navegador
 *
 * El CLOUDINARY_API_SECRET nunca sale del servidor.
 */

router.post(
  '/signature',
  requireAdmin,
  createUploadSignature
);

/*
 * =========================================================
 * SUBIDA MULTIMEDIA LEGACY
 * =========================================================
 *
 * POST /api/uploads
 *
 * Esta ruta se conserva temporalmente mientras migramos
 * weddingService.js a la subida directa.
 *
 * Todavía pasa los archivos por Vercel, por lo que puede
 * alcanzar el límite 413 con archivos grandes.
 *
 * Cuando terminemos la migración podremos retirarla.
 */

router.post(
  '/',
  requireAdmin,
  uploadWeddingMedia,
  uploadWeddingMediaController
);

module.exports = router;