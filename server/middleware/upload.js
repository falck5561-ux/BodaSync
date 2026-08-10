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
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',

  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/wave': '.wav',
  'audio/x-wav': '.wav',
  'audio/ogg': '.ogg',
  'application/ogg': '.ogg',
  'audio/mp4': '.m4a',
  'audio/m4a': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/aac': '.aac',
  'audio/x-aac': '.aac'
};

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

const AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'application/ogg',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/x-aac'
]);

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp'
]);

const AUDIO_EXTENSIONS = new Set([
  '.mp3',
  '.wav',
  '.m4a',
  '.mp4',
  '.aac',
  '.ogg'
]);

function normalizeMimeType(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function getOriginalExtension(file) {
  return path
    .extname(String(file?.originalname || ''))
    .trim()
    .toLowerCase();
}

function getFileCategory(file) {
  const mimeType = normalizeMimeType(file?.mimetype);
  const extension = getOriginalExtension(file);

  if (
    IMAGE_MIME_TYPES.has(mimeType) ||
    IMAGE_EXTENSIONS.has(extension)
  ) {
    return 'image';
  }

  if (
    AUDIO_MIME_TYPES.has(mimeType) ||
    AUDIO_EXTENSIONS.has(extension)
  ) {
    return 'audio';
  }

  return null;
}

function getSafeExtension(file, category) {
  const mimeType = normalizeMimeType(file?.mimetype);

  const mimeExtension = MIME_EXTENSIONS[mimeType];

  if (mimeExtension) {
    return mimeExtension;
  }

  const originalExtension = getOriginalExtension(file);

  if (
    category === 'image' &&
    IMAGE_EXTENSIONS.has(originalExtension)
  ) {
    return originalExtension === '.jpeg'
      ? '.jpg'
      : originalExtension;
  }

  if (
    category === 'audio' &&
    AUDIO_EXTENSIONS.has(originalExtension)
  ) {
    return originalExtension;
  }

  return category === 'audio'
    ? '.mp3'
    : '.jpg';
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

    callback(
      new Error(
        'Tipo de archivo no permitido.'
      )
    );
  },

  filename(_req, file, callback) {
    const category = getFileCategory(file);

    if (!category) {
      callback(
        new Error(
          'No fue posible determinar el tipo de archivo.'
        )
      );

      return;
    }

    const extension = getSafeExtension(
      file,
      category
    );

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

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
    /*
     * El cliente aplica límites más estrictos:
     *
     * imágenes: 5 MB
     * audio: 12 MB
     *
     * Dejamos 30 MB aquí como protección general
     * para no romper archivos aceptados por clientes
     * anteriores.
     */
    fileSize: 30 * 1024 * 1024,

    /*
     * 1 portada
     * 1 pareja
     * 8 galería
     * 1 canción
     *
     * Total máximo: 11.
     */
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