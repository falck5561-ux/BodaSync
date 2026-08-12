const express = require('express');

const {
  createWedding,
  getWeddings,
  getWeddingBySlug,
  updateWedding,
  deleteWedding
} = require('../controllers/weddingController');

const {
  requireAdmin
} = require('../middleware/requireAdmin');

const router = express.Router();

/*
 * =========================================================
 * CREAR INVITACIÓN
 * =========================================================
 *
 * POST /api/weddings
 *
 * Solo administrador.
 */

router.post(
  '/',
  requireAdmin,
  createWedding
);

/*
 * =========================================================
 * LISTAR INVITACIONES
 * =========================================================
 *
 * GET /api/weddings
 *
 * Esta ruta muestra todas las invitaciones dentro
 * del panel administrativo.
 *
 * Solo administrador.
 */

router.get(
  '/',
  requireAdmin,
  getWeddings
);

/*
 * =========================================================
 * ACTUALIZAR INVITACIÓN
 * =========================================================
 *
 * PUT /api/weddings/:id
 *
 * Edita una invitación existente conservando
 * su slug y URL pública.
 *
 * Solo administrador.
 */

router.put(
  '/:id',
  requireAdmin,
  updateWedding
);

/*
 * =========================================================
 * CONSULTAR INVITACIÓN PÚBLICA
 * =========================================================
 *
 * GET /api/weddings/:slug
 *
 * Esta ruta debe permanecer pública para que cualquier
 * invitado pueda abrir:
 *
 * /boda/:slug
 *
 * No requiere iniciar sesión.
 */

router.get(
  '/:slug',
  getWeddingBySlug
);

/*
 * =========================================================
 * ELIMINAR INVITACIÓN
 * =========================================================
 *
 * DELETE /api/weddings/:id
 *
 * Solo administrador.
 */

router.delete(
  '/:id',
  requireAdmin,
  deleteWedding
);

module.exports = router;