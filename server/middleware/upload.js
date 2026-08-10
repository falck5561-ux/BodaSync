const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.resolve(__dirname, '..', 'uploads');
const imageUploadsDir = path.join(uploadsDir, 'images');
const audioUploadsDir = path.join(uploadsDir, 'audio');

fs.mkdirSync(imageUploadsDir, {
  recursive: true
});

fs.mkdirSync(audioUploadsDir, {
  recursive: true
});

const MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/aac': '.aac'
};

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac'
]);

function getFileCategory(file) {
  if (IMAGE_MIME_TYPES.has(file.mimetype)) {
    return 'image';
  }

  if (AUDIO_MIME_TYPES.has(file.mimetype)) {
    return 'audio';
  }

  return null;
}

const storage = multer.diskStorage({
  destination(_req, file, callback) {
    const category = getFileCategory(file);

    if (category === 'image') {
      callback(null, imageUploadsDir);
      return;
    }

    if (category === 'audio') {
      callback(null, audioUploadsDir);
      return;
    }

    callback(new Error('Tipo de archivo no permitido.'));
  },

  filename(_req, file, callback) {
    const extension = MIME_EXTENSIONS[file.mimetype];

    const uniqueName =
      `${Date.now()}-${crypto.randomUUID()}${extension}`;

    callback(null, uniqueName);
  }
});

function fileFilter(_req, file, callback) {
  const category = getFileCategory(file);

  if (!category) {
    const error = new Error(
      'Formato no permitido. Usa imágenes JPG, PNG o WebP y audio MP3, WAV, OGG, M4A o AAC.'
    );

    error.code = 'INVALID_FILE_TYPE';

    callback(error);
    return;
  }

  if (
    file.fieldname === 'backgroundMusic' &&
    category !== 'audio'
  ) {
    const error = new Error(
      'La música de fondo debe ser un archivo de audio.'
    );

    error.code = 'INVALID_AUDIO_FILE';

    callback(error);
    return;
  }

  if (
    [
      'coverImage',
      'coupleImage',
      'gallery'
    ].includes(file.fieldname) &&
    category !== 'image'
  ) {
    const error = new Error(
      'Las fotografías deben ser archivos de imagen.'
    );

    error.code = 'INVALID_IMAGE_FILE';

    callback(error);
    return;
  }

  callback(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024,
    files: 11
  }
});

const uploadWeddingMedia = upload.fields([
  {
    name: 'coverImage',
    maxCount: 1
  },
  {
    name: 'coupleImage',
    maxCount: 1
  },
  {
    name: 'gallery',
    maxCount: 8
  },
  {
    name: 'backgroundMusic',
    maxCount: 1
  }
]);

module.exports = {
  uploadWeddingMedia,
  uploadsDir,
  imageUploadsDir,
  audioUploadsDir
};