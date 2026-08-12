const express = require('express');

const {
  uploadWeddingMedia
} = require('../middleware/upload');

const {
  uploadWeddingMedia: uploadWeddingMediaController
} = require('../controllers/uploadController');

const router = express.Router();

router.post(
  '/',
  uploadWeddingMedia,
  uploadWeddingMediaController
);

module.exports = router;