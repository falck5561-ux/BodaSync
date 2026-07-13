const express = require('express');

const {
  createWedding,
  getWeddings,
  getWeddingBySlug,
  deleteWedding
} = require('../controllers/weddingController');

const router = express.Router();

router.post('/', createWedding);
router.get('/', getWeddings);
router.get('/:slug', getWeddingBySlug);
router.delete('/:id', deleteWedding);

module.exports = router;