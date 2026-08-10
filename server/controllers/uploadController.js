function normalizeBaseUrl(value) {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '');
}

function getServerBaseUrl(req) {
  const configuredUrl = normalizeBaseUrl(
    process.env.PUBLIC_SERVER_URL
  );

  if (configuredUrl) {
    return configuredUrl;
  }

  const forwardedProtocol = req.get(
    'x-forwarded-proto'
  );

  const protocol = forwardedProtocol
    ? forwardedProtocol.split(',')[0].trim()
    : req.protocol;

  return `${protocol}://${req.get('host')}`;
}

function getFileUrl(req, file) {
  if (!file?.filename) {
    return '';
  }

  const baseUrl = getServerBaseUrl(req);

  const folder =
    file.fieldname === 'backgroundMusic'
      ? 'audio'
      : 'images';

  return `${baseUrl}/uploads/${folder}/${encodeURIComponent(
    file.filename
  )}`;
}

function getFirstFile(files, fieldName) {
  const fieldFiles = files?.[fieldName];

  if (
    !Array.isArray(fieldFiles) ||
    fieldFiles.length === 0
  ) {
    return null;
  }

  return fieldFiles[0];
}

exports.uploadWeddingMedia = async (
  req,
  res
) => {
  try {
    const files = req.files || {};

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
      Array.isArray(files.gallery)
        ? files.gallery
        : [];

    const hasFiles = Boolean(
      coverImageFile ||
        coupleImageFile ||
        backgroundMusicFile ||
        galleryFiles.length
    );

    if (!hasFiles) {
      return res.status(400).json({
        message:
          'No se recibió ningún archivo para subir.'
      });
    }

    const coverImage =
      getFileUrl(
        req,
        coverImageFile
      );

    const coupleImage =
      getFileUrl(
        req,
        coupleImageFile
      );

    const musicUrl =
      getFileUrl(
        req,
        backgroundMusicFile
      );

    const gallery =
      galleryFiles
        .map((file) =>
          getFileUrl(req, file)
        )
        .filter(Boolean);

    const media = {
      coverImage,
      coupleImage,

      /*
       * Campo principal que usa actualmente
       * la invitación pública.
       */
      musicUrl,

      /*
       * Compatibilidad con el administrador
       * y versiones anteriores.
       */
      backgroundMusic: musicUrl,

      gallery
    };

    return res.status(201).json({
      message:
        'Archivos subidos correctamente.',

      media
    });
  } catch (error) {
    console.error(
      'Error al procesar archivos subidos:',
      error
    );

    return res.status(500).json({
      message:
        'No fue posible procesar los archivos subidos.'
    });
  }
};