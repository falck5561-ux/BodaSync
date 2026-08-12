const express = require('express');

const {
  createWedding,
  getWeddings,
  getWeddingBySlug,
  updateWedding,
  deleteWedding
} = require('../controllers/weddingController');

const router = express.Router();

/*
 * =========================================================
 * CREAR INVITACIÓN
 * =========================================================
 */

router.post('/', createWedding);

/*
 * =========================================================
 * LISTAR INVITACIONES
 * =========================================================
 */

router.get('/', getWeddings);

/*
 * =========================================================
 * ACTUALIZAR INVITACIÓN
 * =========================================================
 *
 * PUT /api/weddings/:id
 *
 * Permitirá editar una boda existente sin generar
 * un nuevo slug ni una invitación duplicada.
 */

router.put('/:id', updateWedding);

/*
 * =========================================================
 * CONSULTAR INVITACIÓN PÚBLICA
 * =========================================================
 */

router.get('/:slug', getWeddingBySlug);

/*
 * =========================================================
 * ELIMINAR INVITACIÓN
 * =========================================================
 */

router.delete('/:id', deleteWedding);

module.exports = router;