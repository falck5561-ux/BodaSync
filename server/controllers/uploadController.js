const {
  v2: cloudinary
} = require('cloudinary');

/*
 * =========================================================
 * CLOUDINARY
 * =========================================================
 *
 * IMPORTANTE:
 *
 * CLOUDINARY_API_SECRET nunca sale del servidor.
 *
 * El frontend únicamente recibirá:
 *
 * - cloudName
 * - apiKey
 * - timestamp
 * - signature
 * - assetFolder
 * - resourceType
 * - uploadUrl
 */

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,

  secure: true
});

/*
 * =========================================================
 * CARPETAS
 * =========================================================
 */

const CLOUDINARY_IMAGE_FOLDER =
  'bodasync/images';

const CLOUDINARY_AUDIO_FOLDER =
  'bodasync/audio';

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function cleanText(value) {
  return String(value || '').trim();
}

function validateCloudinaryConfig() {
  const cloudName =
    cleanText(
      process.env.CLOUDINARY_CLOUD_NAME
    );

  const apiKey =
    cleanText(
      process.env.CLOUDINARY_API_KEY
    );

  const apiSecret =
    cleanText(
      process.env.CLOUDINARY_API_SECRET
    );

  const missingVariables = [];

  if (!cloudName) {
    missingVariables.push(
      'CLOUDINARY_CLOUD_NAME'
    );
  }

  if (!apiKey) {
    missingVariables.push(
      'CLOUDINARY_API_KEY'
    );
  }

  if (!apiSecret) {
    missingVariables.push(
      'CLOUDINARY_API_SECRET'
    );
  }

  if (missingVariables.length) {
    throw new Error(
      `Faltan variables de Cloudinary: ${missingVariables.join(
        ', '
      )}`
    );
  }

  return {
    cloudName,
    apiKey,
    apiSecret
  };
}

function normalizeResourceType(
  resourceType
) {
  const normalizedType =
    cleanText(
      resourceType
    ).toLowerCase();

  /*
   * Solo permitimos los tipos que utiliza
   * actualmente BodaSync.
   */

  if (
    normalizedType === 'image'
  ) {
    return 'image';
  }

  if (
    normalizedType === 'video' ||
    normalizedType === 'audio'
  ) {
    /*
     * Cloudinary maneja archivos de audio
     * mediante resource_type "video".
     */
    return 'video';
  }

  return '';
}

function getAssetFolder(
  resourceType
) {
  if (
    resourceType === 'video'
  ) {
    return CLOUDINARY_AUDIO_FOLDER;
  }

  return CLOUDINARY_IMAGE_FOLDER;
}

function getUploadUrl(
  cloudName,
  resourceType
) {
  return (
    `https://api.cloudinary.com/v1_1/` +
    `${encodeURIComponent(cloudName)}/` +
    `${resourceType}/upload`
  );
}

/*
 * =========================================================
 * CREAR FIRMA PARA SUBIDA DIRECTA
 * =========================================================
 *
 * POST /api/uploads/signature
 *
 * Esta petición NO recibe archivos.
 *
 * El flujo será:
 *
 * React
 *   ↓
 * POST /api/uploads/signature
 *   ↓
 * Backend verifica administrador
 *   ↓
 * Backend genera firma
 *   ↓
 * React recibe firma
 *   ↓
 * React ───────→ Cloudinary
 *               archivo pesado
 *
 * De esta manera el archivo ya no pasa
 * por Vercel.
 */

exports.createUploadSignature =
  async (req, res) => {
    try {
      const {
        cloudName,
        apiKey,
        apiSecret
      } = validateCloudinaryConfig();

      const resourceType =
        normalizeResourceType(
          req.body?.resourceType
        );

      if (!resourceType) {
        return res
          .status(400)
          .json({
            message:
              'El tipo de archivo no es válido.'
          });
      }

      /*
       * Timestamp Unix en segundos.
       */

      const timestamp =
        Math.floor(
          Date.now() / 1000
        );

      /*
       * BodaSync utiliza carpetas dinámicas
       * de Cloudinary.
       */

      const assetFolder =
        getAssetFolder(
          resourceType
        );

      /*
       * Todos los parámetros que firmemos aquí
       * deben enviarse con exactamente los mismos
       * valores cuando React haga POST directamente
       * a Cloudinary.
       */

      const paramsToSign = {
        asset_folder:
          assetFolder,

        timestamp
      };

      const signature =
        cloudinary.utils
          .api_sign_request(
            paramsToSign,
            apiSecret
          );

      const uploadUrl =
        getUploadUrl(
          cloudName,
          resourceType
        );

      return res
        .status(200)
        .json({
          cloudName,

          apiKey,

          timestamp,

          signature,

          assetFolder,

          resourceType,

          uploadUrl
        });
    } catch (error) {
      console.error(
        'Error generando firma de Cloudinary:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            process.env.NODE_ENV ===
            'development'
              ? error?.message ||
                'No fue posible preparar la subida.'
              : 'No fue posible preparar la subida.'
        });
    }
  };

/*
 * =========================================================
 * SUBIDA LEGACY
 * =========================================================
 *
 * Conservamos temporalmente POST /api/uploads para que
 * el proyecto no se rompa mientras cambiamos el frontend.
 *
 * Cuando weddingService.js utilice definitivamente
 * la subida directa, esta ruta ya no será necesaria.
 */

function uploadBufferToCloudinary(
  buffer,
  options = {}
) {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader
          .upload_stream(
            options,
            (
              error,
              result
            ) => {
              if (error) {
                reject(error);

                return;
              }

              resolve(result);
            }
          );

      uploadStream.end(
        buffer
      );
    }
  );
}

function getFirstFile(
  files,
  fieldName
) {
  const fieldFiles =
    files?.[fieldName];

  if (
    !Array.isArray(fieldFiles) ||
    fieldFiles.length === 0
  ) {
    return null;
  }

  return fieldFiles[0];
}

async function uploadLegacyFile(
  file,
  {
    resourceType = 'image',
    folder =
      CLOUDINARY_IMAGE_FOLDER
  } = {}
) {
  if (!file) {
    return '';
  }

  /*
   * Tu middleware actual utiliza memoryStorage,
   * por lo que esperamos file.buffer.
   */

  if (
    !Buffer.isBuffer(
      file.buffer
    )
  ) {
    throw new Error(
      `No fue posible leer el archivo ${
        file.originalname || ''
      }.`
    );
  }

  const result =
    await uploadBufferToCloudinary(
      file.buffer,
      {
        resource_type:
          resourceType,

        folder,

        use_filename: true,

        unique_filename: true,

        overwrite: false
      }
    );

  if (!result?.secure_url) {
    throw new Error(
      'Cloudinary no devolvió una URL válida.'
    );
  }

  return result.secure_url;
}

/*
 * =========================================================
 * CONTROLLER LEGACY
 * =========================================================
 *
 * Este controller seguirá funcionando mientras terminamos
 * la migración.
 *
 * IMPORTANTE:
 *
 * Sigue teniendo la limitación de tamaño de Vercel.
 * weddingService.js dejará de utilizarlo en el siguiente
 * cambio.
 */

exports.uploadWeddingMedia =
  async (req, res) => {
    try {
      validateCloudinaryConfig();

      const files =
        req.files || {};

      const coverImageFile =
        getFirstFile(
          files,
          'coverImage'
        );

      const coupleImageFile =
        getFirstFile(
          files,
          'coupleImage'
        );

      const backgroundMusicFile =
        getFirstFile(
          files,
          'backgroundMusic'
        );

      const galleryFiles =
        Array.isArray(
          files.gallery
        )
          ? files.gallery
          : [];

      const hasFiles =
        Boolean(
          coverImageFile ||
            coupleImageFile ||
            backgroundMusicFile ||
            galleryFiles.length
        );

      if (!hasFiles) {
        return res
          .status(400)
          .json({
            message:
              'No se recibió ningún archivo para subir.'
          });
      }

      /*
       * =====================================================
       * SUBIDAS
       * =====================================================
       */

      const [
        coverImage,
        coupleImage,
        backgroundMusic,
        gallery
      ] = await Promise.all([
        coverImageFile
          ? uploadLegacyFile(
              coverImageFile,
              {
                resourceType:
                  'image',

                folder:
                  CLOUDINARY_IMAGE_FOLDER
              }
            )
          : Promise.resolve(''),

        coupleImageFile
          ? uploadLegacyFile(
              coupleImageFile,
              {
                resourceType:
                  'image',

                folder:
                  CLOUDINARY_IMAGE_FOLDER
              }
            )
          : Promise.resolve(''),

        backgroundMusicFile
          ? uploadLegacyFile(
              backgroundMusicFile,
              {
                resourceType:
                  'video',

                folder:
                  CLOUDINARY_AUDIO_FOLDER
              }
            )
          : Promise.resolve(''),

        Promise.all(
          galleryFiles.map(
            (file) =>
              uploadLegacyFile(
                file,
                {
                  resourceType:
                    'image',

                  folder:
                    CLOUDINARY_IMAGE_FOLDER
                }
              )
          )
        )
      ]);

      /*
       * Mantenemos exactamente el formato que ya
       * consume weddingService.js.
       */

      const media = {
        coverImage,

        coupleImage,

        backgroundMusic,

        musicUrl:
          backgroundMusic,

        gallery:
          gallery.filter(Boolean)
      };

      return res
        .status(201)
        .json({
          message:
            'Archivos subidos correctamente.',

          media
        });
    } catch (error) {
      console.error(
        'Error al subir archivos a Cloudinary:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            process.env.NODE_ENV ===
            'development'
              ? error?.message ||
                'No fue posible subir los archivos.'
              : 'No fue posible subir los archivos.'
        });
    }
  };