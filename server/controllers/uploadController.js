const fs = require('fs/promises');

const {
  v2: cloudinary
} = require('cloudinary');

/*
 * =========================================================
 * CLOUDINARY
 * =========================================================
 *
 * Las credenciales se leen únicamente desde variables
 * de entorno del servidor.
 *
 * Nunca deben enviarse al frontend.
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
 * CONFIGURACIÓN
 * =========================================================
 */

const CLOUDINARY_IMAGE_FOLDER =
  'bodasync/images';

const CLOUDINARY_AUDIO_FOLDER =
  'bodasync/audio';

/*
 * =========================================================
 * VALIDAR CLOUDINARY
 * =========================================================
 */

function validateCloudinaryConfig() {
  const missingVariables = [];

  if (
    !process.env
      .CLOUDINARY_CLOUD_NAME
  ) {
    missingVariables.push(
      'CLOUDINARY_CLOUD_NAME'
    );
  }

  if (
    !process.env
      .CLOUDINARY_API_KEY
  ) {
    missingVariables.push(
      'CLOUDINARY_API_KEY'
    );
  }

  if (
    !process.env
      .CLOUDINARY_API_SECRET
  ) {
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
}

/*
 * =========================================================
 * OBTENER PRIMER ARCHIVO
 * =========================================================
 */

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

/*
 * =========================================================
 * BORRAR ARCHIVO TEMPORAL LOCAL
 * =========================================================
 *
 * Actualmente tu middleware puede estar utilizando
 * multer.diskStorage().
 *
 * Mientras terminamos la migración, permitimos que multer
 * guarde temporalmente el archivo y lo eliminamos después
 * de subirlo a Cloudinary.
 *
 * Cuando revisemos middleware/upload.js podremos decidir
 * si lo cambiamos directamente a memoria.
 */

async function removeTemporaryFile(
  file
) {
  if (!file?.path) {
    return;
  }

  try {
    await fs.unlink(
      file.path
    );
  } catch (error) {
    /*
     * ENOENT significa que el archivo ya no existe.
     * En ese caso no necesitamos hacer nada.
     */

    if (
      error?.code !== 'ENOENT'
    ) {
      console.warn(
        'No fue posible eliminar el archivo temporal:',
        file.path,
        error?.message
      );
    }
  }
}

/*
 * =========================================================
 * SUBIR BUFFER
 * =========================================================
 *
 * Esto permitirá que el mismo controller funcione también
 * cuando cambiemos multer a memoryStorage().
 */

function uploadBufferToCloudinary(
  buffer,
  options
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

/*
 * =========================================================
 * SUBIR ARCHIVO A CLOUDINARY
 * =========================================================
 */

async function uploadFileToCloudinary(
  file,
  {
    resourceType = 'image',
    folder =
      CLOUDINARY_IMAGE_FOLDER
  } = {}
) {
  if (!file) {
    return null;
  }

  const options = {
    folder,

    resource_type:
      resourceType,

    use_filename: true,

    unique_filename: true,

    overwrite: false
  };

  try {
    let result;

    /*
     * Caso futuro:
     * multer.memoryStorage()
     */

    if (
      Buffer.isBuffer(
        file.buffer
      )
    ) {
      result =
        await uploadBufferToCloudinary(
          file.buffer,
          options
        );
    } else if (file.path) {
      /*
       * Caso actual:
       * multer.diskStorage()
       */

      result =
        await cloudinary
          .uploader
          .upload(
            file.path,
            options
          );
    } else {
      throw new Error(
        `No fue posible acceder al archivo ${
          file.originalname ||
          file.filename ||
          ''
        }.`
      );
    }

    if (
      !result?.secure_url ||
      !result?.public_id
    ) {
      throw new Error(
        'Cloudinary no devolvió una URL válida.'
      );
    }

    return {
      url:
        result.secure_url,

      publicId:
        result.public_id,

      resourceType:
        result.resource_type ||
        resourceType
    };
  } finally {
    /*
     * Si multer creó un archivo local temporal,
     * siempre intentamos borrarlo.
     */

    await removeTemporaryFile(
      file
    );
  }
}

/*
 * =========================================================
 * ELIMINAR ASSET DE CLOUDINARY
 * =========================================================
 *
 * Se utiliza si una subida múltiple falla parcialmente.
 *
 * Ejemplo:
 *
 * portada OK
 * pareja OK
 * galería 1 OK
 * galería 2 ERROR
 *
 * En ese caso retiramos los assets que acabábamos de subir
 * para no dejar archivos huérfanos.
 */

async function destroyCloudinaryAsset(
  asset
) {
  if (!asset?.publicId) {
    return;
  }

  try {
    await cloudinary
      .uploader
      .destroy(
        asset.publicId,
        {
          resource_type:
            asset.resourceType ||
            'image',

          invalidate: true
        }
      );
  } catch (error) {
    console.error(
      'No fue posible revertir un archivo de Cloudinary:',
      asset.publicId,
      error?.message
    );
  }
}

/*
 * =========================================================
 * SUBIDA SEGURA DE TODOS LOS ARCHIVOS
 * =========================================================
 */

async function uploadWeddingFiles({
  coverImageFile,
  coupleImageFile,
  backgroundMusicFile,
  galleryFiles
}) {
  const uploadTasks = [];

  if (coverImageFile) {
    uploadTasks.push({
      type: 'coverImage',

      file:
        coverImageFile,

      resourceType:
        'image',

      folder:
        CLOUDINARY_IMAGE_FOLDER
    });
  }

  if (coupleImageFile) {
    uploadTasks.push({
      type: 'coupleImage',

      file:
        coupleImageFile,

      resourceType:
        'image',

      folder:
        CLOUDINARY_IMAGE_FOLDER
    });
  }

  if (backgroundMusicFile) {
    uploadTasks.push({
      type:
        'backgroundMusic',

      file:
        backgroundMusicFile,

      /*
       * Cloudinary utiliza resource_type "video"
       * también para audio.
       */

      resourceType:
        'video',

      folder:
        CLOUDINARY_AUDIO_FOLDER
    });
  }

  galleryFiles.forEach(
    (file, index) => {
      uploadTasks.push({
        type: 'gallery',

        index,

        file,

        resourceType:
          'image',

        folder:
          CLOUDINARY_IMAGE_FOLDER
      });
    }
  );

  /*
   * Subimos en paralelo para que una galería completa
   * no tenga que esperar imagen por imagen.
   */

  const settledResults =
    await Promise.allSettled(
      uploadTasks.map(
        async (task) => {
          const uploadedAsset =
            await uploadFileToCloudinary(
              task.file,
              {
                resourceType:
                  task.resourceType,

                folder:
                  task.folder
              }
            );

          return {
            ...task,

            uploadedAsset
          };
        }
      )
    );

  const successfulUploads = [];
  const failedUploads = [];

  settledResults.forEach(
    (result) => {
      if (
        result.status ===
        'fulfilled'
      ) {
        successfulUploads.push(
          result.value
        );
      } else {
        failedUploads.push(
          result.reason
        );
      }
    }
  );

  /*
   * Si una sola subida falló, revertimos las que
   * ya se habían completado.
   */

  if (failedUploads.length) {
    await Promise.allSettled(
      successfulUploads.map(
        (item) =>
          destroyCloudinaryAsset(
            item.uploadedAsset
          )
      )
    );

    throw (
      failedUploads[0] ||
      new Error(
        'No fue posible subir todos los archivos.'
      )
    );
  }

  return successfulUploads;
}

/*
 * =========================================================
 * CONTROLLER
 * =========================================================
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
       * ===================================================
       * SUBIR A CLOUDINARY
       * ===================================================
       */

      const uploadedFiles =
        await uploadWeddingFiles({
          coverImageFile,

          coupleImageFile,

          backgroundMusicFile,

          galleryFiles
        });

      /*
       * ===================================================
       * RECONSTRUIR RESPUESTA
       * ===================================================
       */

      const coverUpload =
        uploadedFiles.find(
          (item) =>
            item.type ===
            'coverImage'
        );

      const coupleUpload =
        uploadedFiles.find(
          (item) =>
            item.type ===
            'coupleImage'
        );

      const musicUpload =
        uploadedFiles.find(
          (item) =>
            item.type ===
            'backgroundMusic'
        );

      const galleryUploads =
        uploadedFiles
          .filter(
            (item) =>
              item.type ===
              'gallery'
          )
          .sort(
            (a, b) =>
              a.index - b.index
          );

      const coverImage =
        coverUpload
          ?.uploadedAsset
          ?.url ||
        '';

      const coupleImage =
        coupleUpload
          ?.uploadedAsset
          ?.url ||
        '';

      const musicUrl =
        musicUpload
          ?.uploadedAsset
          ?.url ||
        '';

      const gallery =
        galleryUploads
          .map(
            (item) =>
              item.uploadedAsset
                ?.url ||
              ''
          )
          .filter(Boolean);

      /*
       * ===================================================
       * MISMO FORMATO QUE YA USA BODASYNC
       * ===================================================
       *
       * No cambiamos la estructura que consume
       * weddingService.js.
       */

      const media = {
        coverImage,

        coupleImage,

        /*
         * Campo utilizado por la invitación pública.
         */

        musicUrl,

        /*
         * Alias utilizado por el administrador
         * y versiones anteriores.
         */

        backgroundMusic:
          musicUrl,

        gallery
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
            process.env
              .NODE_ENV ===
            'development'
              ? error?.message ||
                'No fue posible subir los archivos.'
              : 'No fue posible subir los archivos.'
        });
    }
  };