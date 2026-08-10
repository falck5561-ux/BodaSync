const express = require('express');
const multer = require('multer');

const {
  uploadWeddingMedia
} = require('../middleware/upload');

const {
  uploadWeddingMedia: uploadWeddingMediaController
} = require('../controllers/uploadController');

const router = express.Router();

router.post(
  '/',
  (req, res, next) => {
    uploadWeddingMedia(req, res, (error) => {
      if (!error) {
        next();
        return;
      }

      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            message:
              'Uno de los archivos supera el límite máximo de 30 MB.'
          });
        }

        if (error.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            message:
              'Se enviaron más archivos de los permitidos.'
          });
        }

        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            message:
              'Se recibió un archivo en un campo no permitido o se superó el máximo permitido.'
          });
        }

        return res.status(400).json({
          message:
            'No fue posible procesar los archivos enviados.'
        });
      }

      if (
        error.code === 'INVALID_FILE_TYPE' ||
        error.code === 'INVALID_AUDIO_FILE' ||
        error.code === 'INVALID_IMAGE_FILE'
      ) {
        return res.status(400).json({
          message: error.message
        });
      }

      console.error('Error de upload:', error);

      return res.status(500).json({
        message:
          'Ocurrió un error al subir los archivos.'
      });
    });
  },
  uploadWeddingMediaController
);

module.exports = router;