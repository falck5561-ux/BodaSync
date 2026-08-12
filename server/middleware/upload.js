const path = require('path');
const multer = require('multer');

/*
 * =========================================================
 * RUTAS LEGACY
 * =========================================================
 *
 * Ya no guardamos nuevas subidas aquí.
 *
 * Conservamos estas rutas exportadas porque puede existir
 * código anterior que todavía las importe y porque las
 * invitaciones antiguas pueden seguir apuntando a /uploads.
 */

const uploadsDir = path.resolve(
  __dirname,
  '..',
  'uploads'
);

const imageUploadsDir = path.join(
  uploadsDir,
  'images'
);

const audioUploadsDir = path.join(
  uploadsDir,
  'audio'
);

/*
 * =========================================================
 * LÍMITES
 * =========================================================
 */

const MB =
  1024 * 1024;

const MAX_IMAGE_SIZE =
  5 * MB;

const MAX_AUDIO_SIZE =
  12 * MB;

const MAX_GALLERY_IMAGES =
  8;

const MAX_TOTAL_FILES =
  11;

/*
 * =========================================================
 * FORMATOS PERMITIDOS
 * =========================================================
 */

const IMAGE_MIME_TYPES =
  new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]);

const AUDIO_MIME_TYPES =
  new Set([
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

const IMAGE_EXTENSIONS =
  new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.webp'
  ]);

const AUDIO_EXTENSIONS =
  new Set([
    '.mp3',
    '.wav',
    '.m4a',
    '.mp4',
    '.aac',
    '.ogg'
  ]);

/*
 * =========================================================
 * NORMALIZACIÓN
 * =========================================================
 */

function normalizeMimeType(
  value
) {
  return String(
    value || ''
  )
    .trim()
    .toLowerCase();
}

function getOriginalExtension(
  file
) {
  return path
    .extname(
      String(
        file?.originalname ||
          ''
      )
    )
    .trim()
    .toLowerCase();
}

/*
 * =========================================================
 * DETECTAR CATEGORÍA POR MIME
 * =========================================================
 */

function getMimeCategory(
  file
) {
  const mimeType =
    normalizeMimeType(
      file?.mimetype
    );

  if (
    IMAGE_MIME_TYPES.has(
      mimeType
    )
  ) {
    return 'image';
  }

  if (
    AUDIO_MIME_TYPES.has(
      mimeType
    )
  ) {
    return 'audio';
  }

  return null;
}

/*
 * =========================================================
 * DETECTAR CATEGORÍA POR EXTENSIÓN
 * =========================================================
 */

function getExtensionCategory(
  file
) {
  const extension =
    getOriginalExtension(
      file
    );

  if (
    IMAGE_EXTENSIONS.has(
      extension
    )
  ) {
    return 'image';
  }

  if (
    AUDIO_EXTENSIONS.has(
      extension
    )
  ) {
    return 'audio';
  }

  return null;
}

/*
 * =========================================================
 * OBTENER CATEGORÍA FINAL
 * =========================================================
 *
 * Comparamos MIME y extensión cuando ambos están presentes.
 *
 * Esto también evita aceptar, por ejemplo, un archivo con
 * extensión de audio enviado como imagen.
 */

function getFileCategory(
  file
) {
  const mimeCategory =
    getMimeCategory(
      file
    );

  const extensionCategory =
    getExtensionCategory(
      file
    );

  const originalExtension =
    getOriginalExtension(
      file
    );

  /*
   * Si existe extensión pero no pertenece
   * a nuestras extensiones permitidas,
   * rechazamos el archivo.
   */

  if (
    originalExtension &&
    !extensionCategory
  ) {
    return null;
  }

  /*
   * Si MIME y extensión dicen cosas
   * diferentes, también lo rechazamos.
   */

  if (
    mimeCategory &&
    extensionCategory &&
    mimeCategory !==
      extensionCategory
  ) {
    return null;
  }

  return (
    mimeCategory ||
    extensionCategory ||
    null
  );
}

/*
 * =========================================================
 * FILTRO DE ARCHIVOS
 * =========================================================
 */

function fileFilter(
  _req,
  file,
  callback
) {
  const category =
    getFileCategory(
      file
    );

  if (!category) {
    const error =
      new Error(
        'Formato no permitido. Usa imágenes JPG, PNG o WebP y audio MP3, WAV, OGG, M4A o AAC.'
      );

    error.code =
      'INVALID_FILE_TYPE';

    callback(
      error
    );

    return;
  }

  /*
   * Música
   */

  if (
    file.fieldname ===
      'backgroundMusic' &&
    category !== 'audio'
  ) {
    const error =
      new Error(
        'La música de fondo debe ser un archivo de audio.'
      );

    error.code =
      'INVALID_AUDIO_FILE';

    callback(
      error
    );

    return;
  }

  /*
   * Fotografías
   */

  if (
    [
      'coverImage',
      'coupleImage',
      'gallery'
    ].includes(
      file.fieldname
    ) &&
    category !== 'image'
  ) {
    const error =
      new Error(
        'La portada, la fotografía de pareja y la galería deben contener archivos de imagen.'
      );

    error.code =
      'INVALID_IMAGE_FILE';

    callback(
      error
    );

    return;
  }

  callback(
    null,
    true
  );
}

/*
 * =========================================================
 * MEMORY STORAGE
 * =========================================================
 *
 * IMPORTANTE:
 *
 * Ya NO creamos archivos dentro de:
 *
 * server/uploads/images
 * server/uploads/audio
 *
 * Multer mantiene temporalmente el contenido en memoria
 * como:
 *
 * file.buffer
 *
 * uploadController.js toma ese buffer y lo sube
 * inmediatamente a Cloudinary.
 */

const storage =
  multer.memoryStorage();

/*
 * =========================================================
 * CONFIGURAR MULTER
 * =========================================================
 */

const upload =
  multer({
    storage,

    fileFilter,

    limits: {
      /*
       * Multer aplica un límite general por archivo.
       *
       * Usamos el máximo permitido, que corresponde
       * al audio.
       *
       * Después validamos las imágenes por separado
       * para limitar cada una a 5 MB.
       */

      fileSize:
        MAX_AUDIO_SIZE,

      /*
       * 1 portada
       * 1 pareja
       * 8 galería
       * 1 canción
       *
       * Total máximo: 11.
       */

      files:
        MAX_TOTAL_FILES,

      /*
       * Protección adicional para formularios
       * multipart excesivamente grandes.
       */

      fields: 20,

      parts: 35
    }
  });

/*
 * =========================================================
 * CAMPOS PERMITIDOS
 * =========================================================
 */

const uploadFields =
  upload.fields([
    {
      name:
        'coverImage',

      maxCount: 1
    },

    {
      name:
        'coupleImage',

      maxCount: 1
    },

    {
      name:
        'gallery',

      maxCount:
        MAX_GALLERY_IMAGES
    },

    {
      name:
        'backgroundMusic',

      maxCount: 1
    }
  ]);

/*
 * =========================================================
 * OBTENER TODOS LOS ARCHIVOS
 * =========================================================
 */

function getRequestFiles(
  req
) {
  if (
    !req.files ||
    typeof req.files !==
      'object'
  ) {
    return [];
  }

  return Object.values(
    req.files
  )
    .flat()
    .filter(Boolean);
}

/*
 * =========================================================
 * VALIDAR TAMAÑO POR TIPO
 * =========================================================
 */

function validateFileSizes(
  req
) {
  const files =
    getRequestFiles(
      req
    );

  for (
    const file of files
  ) {
    const category =
      getFileCategory(
        file
      );

    if (
      category ===
        'image' &&
      file.size >
        MAX_IMAGE_SIZE
    ) {
      const error =
        new Error(
          `La imagen "${file.originalname}" supera el límite máximo de 5 MB.`
        );

      error.code =
        'IMAGE_TOO_LARGE';

      return error;
    }

    if (
      category ===
        'audio' &&
      file.size >
        MAX_AUDIO_SIZE
    ) {
      const error =
        new Error(
          `El audio "${file.originalname}" supera el límite máximo de 12 MB.`
        );

      error.code =
        'AUDIO_TOO_LARGE';

      return error;
    }
  }

  return null;
}

/*
 * =========================================================
 * RESPONDER ERRORES DE MULTER
 * =========================================================
 */

function sendUploadError(
  error,
  res
) {
  /*
   * Archivo demasiado grande.
   */

  if (
    error instanceof
      multer.MulterError &&
    error.code ===
      'LIMIT_FILE_SIZE'
  ) {
    return res
      .status(413)
      .json({
        message:
          'Uno de los archivos supera el tamaño máximo permitido. Las imágenes pueden pesar hasta 5 MB y el audio hasta 12 MB.'
      });
  }

  /*
   * Demasiados archivos.
   */

  if (
    error instanceof
      multer.MulterError &&
    (
      error.code ===
        'LIMIT_FILE_COUNT' ||
      error.code ===
        'LIMIT_UNEXPECTED_FILE'
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          'Se enviaron más archivos de los permitidos o se recibió un campo de archivo no reconocido.'
      });
  }

  /*
   * Demasiadas partes/campos.
   */

  if (
    error instanceof
      multer.MulterError &&
    (
      error.code ===
        'LIMIT_PART_COUNT' ||
      error.code ===
        'LIMIT_FIELD_COUNT'
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          'La solicitud contiene demasiados campos o archivos.'
      });
  }

  /*
   * Nuestros errores personalizados.
   */

  if (
    error?.code ===
      'IMAGE_TOO_LARGE' ||
    error?.code ===
      'AUDIO_TOO_LARGE'
  ) {
    return res
      .status(413)
      .json({
        message:
          error.message
      });
  }

  if (
    error?.code ===
      'INVALID_FILE_TYPE' ||
    error?.code ===
      'INVALID_AUDIO_FILE' ||
    error?.code ===
      'INVALID_IMAGE_FILE'
  ) {
    return res
      .status(400)
      .json({
        message:
          error.message
      });
  }

  console.error(
    'Error al procesar multimedia:',
    error
  );

  return res
    .status(400)
    .json({
      message:
        error?.message ||
        'No fue posible procesar los archivos seleccionados.'
    });
}

/*
 * =========================================================
 * MIDDLEWARE FINAL
 * =========================================================
 *
 * Conservamos exactamente el mismo nombre exportado que
 * utiliza actualmente routes/uploads.js.
 *
 * Así no tenemos que modificar las rutas.
 */

function uploadWeddingMedia(
  req,
  res,
  next
) {
  uploadFields(
    req,
    res,
    (error) => {
      if (error) {
        sendUploadError(
          error,
          res
        );

        return;
      }

      const sizeError =
        validateFileSizes(
          req
        );

      if (sizeError) {
        sendUploadError(
          sizeError,
          res
        );

        return;
      }

      next();
    }
  );
}

module.exports = {
  uploadWeddingMedia,

  /*
   * Mantenemos estas exportaciones únicamente
   * por compatibilidad con cualquier código
   * anterior que pueda utilizarlas.
   */

  uploadsDir,
  imageUploadsDir,
  audioUploadsDir
};