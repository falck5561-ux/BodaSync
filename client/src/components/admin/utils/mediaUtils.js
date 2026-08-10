export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_AUDIO_SIZE = 12 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 8;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/x-aac',
  'audio/ogg',
  'application/ogg'
];

const ACCEPTED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp'
];

const ACCEPTED_AUDIO_EXTENSIONS = [
  'mp3',
  'wav',
  'm4a',
  'mp4',
  'aac',
  'ogg'
];

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeMimeType(value) {
  return cleanText(value).toLowerCase();
}

function getFileExtension(file) {
  const name = cleanText(file?.name);

  if (!name || !name.includes('.')) {
    return '';
  }

  return name
    .split('.')
    .pop()
    .trim()
    .toLowerCase();
}

function isBlobUrl(value) {
  return (
    typeof value === 'string' &&
    value.startsWith('blob:')
  );
}

function getMediaItemFile(mediaItem) {
  if (!mediaItem) {
    return null;
  }

  if (
    typeof File !== 'undefined' &&
    mediaItem instanceof File
  ) {
    return mediaItem;
  }

  if (
    typeof Blob !== 'undefined' &&
    mediaItem instanceof Blob
  ) {
    return mediaItem;
  }

  if (
    typeof File !== 'undefined' &&
    mediaItem.file instanceof File
  ) {
    return mediaItem.file;
  }

  if (
    typeof Blob !== 'undefined' &&
    mediaItem.file instanceof Blob
  ) {
    return mediaItem.file;
  }

  return null;
}

export function getMediaItemUrl(mediaItem) {
  if (!mediaItem) {
    return '';
  }

  if (typeof mediaItem === 'string') {
    return cleanText(mediaItem);
  }

  if (typeof mediaItem !== 'object') {
    return '';
  }

  return cleanText(
    mediaItem.previewUrl ||
      mediaItem.preview ||
      mediaItem.url ||
      mediaItem.secureUrl ||
      mediaItem.secure_url ||
      mediaItem.fileUrl ||
      mediaItem.path ||
      mediaItem.src ||
      ''
  );
}

/*
 * =========================================================
 * IDENTIFICADORES
 * =========================================================
 */

export function createMediaId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

/*
 * =========================================================
 * ESTADO VACÍO
 * =========================================================
 *
 * Dentro del constructor conservamos "backgroundMusic".
 *
 * Al publicar, weddingService + weddingPayload convierten
 * este valor también a "musicUrl".
 */

export function createEmptyMedia() {
  return {
    coverImage: null,
    coupleImage: null,
    backgroundMusic: null,
    gallery: []
  };
}

/*
 * =========================================================
 * FORMATO DE TAMAÑO
 * =========================================================
 */

export function formatFileSize(bytes) {
  if (
    typeof bytes !== 'number' ||
    Number.isNaN(bytes) ||
    bytes < 0
  ) {
    return 'Tamaño desconocido';
  }

  if (bytes === 0) {
    return '0 bytes';
  }

  const units = [
    'bytes',
    'KB',
    'MB',
    'GB'
  ];

  const unitIndex = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    ),
    units.length - 1
  );

  const value =
    bytes /
    1024 ** unitIndex;

  return `${value.toFixed(
    unitIndex === 0
      ? 0
      : 2
  )} ${units[unitIndex]}`;
}

/*
 * =========================================================
 * DETECCIÓN DE IMÁGENES
 * =========================================================
 *
 * Algunos navegadores pueden entregar file.type vacío.
 * Por eso comprobamos MIME y extensión.
 */

export function isImageFile(file) {
  if (!file) {
    return false;
  }

  const mimeType =
    normalizeMimeType(
      file.type
    );

  const extension =
    getFileExtension(file);

  if (
    mimeType &&
    ACCEPTED_IMAGE_TYPES.includes(
      mimeType
    )
  ) {
    return true;
  }

  return ACCEPTED_IMAGE_EXTENSIONS.includes(
    extension
  );
}

/*
 * =========================================================
 * DETECCIÓN DE AUDIO
 * =========================================================
 *
 * M4A es especialmente inconsistente entre navegadores.
 * Puede llegar como:
 *
 * audio/mp4
 * audio/m4a
 * audio/x-m4a
 * o incluso sin MIME.
 */

export function isAudioFile(file) {
  if (!file) {
    return false;
  }

  const mimeType =
    normalizeMimeType(
      file.type
    );

  const extension =
    getFileExtension(file);

  if (
    mimeType &&
    ACCEPTED_AUDIO_TYPES.includes(
      mimeType
    )
  ) {
    return true;
  }

  return ACCEPTED_AUDIO_EXTENSIONS.includes(
    extension
  );
}

/*
 * =========================================================
 * VALIDACIÓN
 * =========================================================
 */

export function validateMediaFile(
  file,
  acceptedType
) {
  if (!file) {
    return {
      valid: false,
      error:
        'No se seleccionó ningún archivo.'
    };
  }

  if (acceptedType === 'image') {
    if (!isImageFile(file)) {
      return {
        valid: false,
        error:
          'Selecciona una imagen JPG, JPEG, PNG o WebP.'
      };
    }

    if (file.size <= 0) {
      return {
        valid: false,
        error:
          'La imagen seleccionada está vacía.'
      };
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      return {
        valid: false,
        error:
          'La imagen no debe superar los 5 MB.'
      };
    }

    return {
      valid: true,
      error: ''
    };
  }

  if (acceptedType === 'audio') {
    if (!isAudioFile(file)) {
      return {
        valid: false,
        error:
          'Selecciona un archivo MP3, WAV, M4A, AAC u OGG.'
      };
    }

    if (file.size <= 0) {
      return {
        valid: false,
        error:
          'La canción seleccionada está vacía.'
      };
    }

    if (
      file.size >
      MAX_AUDIO_SIZE
    ) {
      return {
        valid: false,
        error:
          'La canción no debe superar los 12 MB.'
      };
    }

    return {
      valid: true,
      error: ''
    };
  }

  return {
    valid: false,
    error:
      'El tipo de archivo solicitado no es válido.'
  };
}

/*
 * =========================================================
 * PREVIEW LOCAL
 * =========================================================
 */

export function createPreviewUrl(file) {
  if (
    !file ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !==
      'function'
  ) {
    return '';
  }

  try {
    return URL.createObjectURL(
      file
    );
  } catch {
    return '';
  }
}

/*
 * =========================================================
 * CREAR ITEM MULTIMEDIA
 * =========================================================
 *
 * IMPORTANTE:
 *
 * Conservamos "file" completo.
 *
 * weddingService.js utiliza justamente item.file para mandar
 * el archivo real mediante FormData.
 */

export function createMediaItem(
  file,
  extraData = {}
) {
  if (!file) {
    return null;
  }

  const previewUrl =
    createPreviewUrl(file);

  return {
    id:
      createMediaId(),

    file,

    name:
      cleanText(file.name) ||
      'Archivo',

    type:
      normalizeMimeType(
        file.type
      ),

    size:
      Number.isFinite(
        file.size
      )
        ? file.size
        : 0,

    formattedSize:
      formatFileSize(
        Number.isFinite(
          file.size
        )
          ? file.size
          : 0
      ),

    previewUrl,

    /*
     * Alias útil para componentes que buscan "preview".
     */
    preview:
      previewUrl,

    /*
     * Marca que ayuda a diferenciar un File todavía local
     * de una URL que ya fue subida al servidor.
     */
    isLocal:
      true,

    ...extraData
  };
}

/*
 * =========================================================
 * REVOCAR PREVIEW
 * =========================================================
 */

export function revokeMediaUrl(
  mediaItem
) {
  if (
    !mediaItem ||
    typeof URL === 'undefined' ||
    typeof URL.revokeObjectURL !==
      'function'
  ) {
    return;
  }

  const previewUrl =
    typeof mediaItem === 'string'
      ? mediaItem
      : mediaItem.previewUrl ||
        mediaItem.preview ||
        '';

  /*
   * Nunca intentamos revocar una URL real del servidor.
   *
   * Solo URL.createObjectURL genera URLs blob:.
   */

  if (!isBlobUrl(previewUrl)) {
    return;
  }

  try {
    URL.revokeObjectURL(
      previewUrl
    );
  } catch {
    // No necesitamos bloquear el flujo
    // si el navegador ya liberó el recurso.
  }
}

/*
 * =========================================================
 * REVOCAR TODA LA MULTIMEDIA
 * =========================================================
 */

export function revokeAllMediaUrls(
  media
) {
  if (!media) {
    return;
  }

  revokeMediaUrl(
    media.coverImage
  );

  revokeMediaUrl(
    media.coupleImage
  );

  revokeMediaUrl(
    media.backgroundMusic ||
      media.musicUrl
  );

  if (
    Array.isArray(
      media.gallery
    )
  ) {
    media.gallery.forEach(
      revokeMediaUrl
    );
  }
}

/*
 * =========================================================
 * ELIMINAR FOTO DE GALERÍA
 * =========================================================
 */

export function removeGalleryItem(
  gallery,
  imageId
) {
  if (!Array.isArray(gallery)) {
    return [];
  }

  const selectedImage =
    gallery.find((image) => {
      if (!image) {
        return false;
      }

      if (
        typeof image ===
        'string'
      ) {
        return image === imageId;
      }

      return (
        image.id === imageId
      );
    });

  revokeMediaUrl(
    selectedImage
  );

  return gallery.filter(
    (image) => {
      if (!image) {
        return false;
      }

      if (
        typeof image ===
        'string'
      ) {
        return image !== imageId;
      }

      return (
        image.id !== imageId
      );
    }
  );
}

/*
 * =========================================================
 * ESPACIOS DE GALERÍA
 * =========================================================
 */

export function getAvailableGallerySpaces(
  gallery
) {
  const currentImages =
    Array.isArray(gallery)
      ? gallery.length
      : 0;

  return Math.max(
    MAX_GALLERY_IMAGES -
      currentImages,
    0
  );
}

/*
 * =========================================================
 * PREPARAR GALERÍA
 * =========================================================
 */

export function prepareGalleryFiles(
  files,
  currentGallery = []
) {
  const selectedFiles =
    Array.from(files || []);

  const availableSpaces =
    getAvailableGallerySpaces(
      currentGallery
    );

  if (availableSpaces === 0) {
    return {
      items: [],
      errors: [
        `La galería permite un máximo de ${MAX_GALLERY_IMAGES} imágenes.`
      ]
    };
  }

  const filesToProcess =
    selectedFiles.slice(
      0,
      availableSpaces
    );

  const items = [];
  const errors = [];

  /*
   * Evita seleccionar exactamente el mismo archivo varias
   * veces dentro de una sola carga.
   */

  const processedFiles =
    new Set();

  filesToProcess.forEach(
    (file) => {
      const signature = [
        file.name,
        file.size,
        file.lastModified
      ].join('-');

      if (
        processedFiles.has(
          signature
        )
      ) {
        errors.push(
          `${file.name}: la fotografía está repetida.`
        );

        return;
      }

      processedFiles.add(
        signature
      );

      const validation =
        validateMediaFile(
          file,
          'image'
        );

      if (!validation.valid) {
        errors.push(
          `${file.name}: ${validation.error}`
        );

        return;
      }

      const mediaItem =
        createMediaItem(
          file
        );

      if (mediaItem) {
        items.push(
          mediaItem
        );
      }
    }
  );

  if (
    selectedFiles.length >
    availableSpaces
  ) {
    errors.push(
      `Solo se agregaron hasta ${availableSpaces} imágenes porque el límite es ${MAX_GALLERY_IMAGES}.`
    );
  }

  return {
    items,
    errors
  };
}

/*
 * =========================================================
 * NOMBRE DE ITEM
 * =========================================================
 */

function getMediaItemName(
  mediaItem
) {
  if (!mediaItem) {
    return '';
  }

  if (
    typeof mediaItem ===
    'string'
  ) {
    try {
      const pathname =
        new URL(
          mediaItem,
          window?.location?.origin ||
            'http://localhost'
        ).pathname;

      return (
        pathname
          .split('/')
          .filter(Boolean)
          .pop() || ''
      );
    } catch {
      return mediaItem;
    }
  }

  if (
    typeof mediaItem ===
    'object'
  ) {
    if (
      cleanText(
        mediaItem.name
      )
    ) {
      return cleanText(
        mediaItem.name
      );
    }

    const file =
      getMediaItemFile(
        mediaItem
      );

    if (
      file &&
      cleanText(file.name)
    ) {
      return cleanText(
        file.name
      );
    }

    const url =
      getMediaItemUrl(
        mediaItem
      );

    if (url) {
      try {
        return (
          new URL(
            url,
            typeof window !==
              'undefined'
              ? window.location.origin
              : 'http://localhost'
          ).pathname
            .split('/')
            .filter(Boolean)
            .pop() || ''
        );
      } catch {
        return url;
      }
    }
  }

  return '';
}

/*
 * =========================================================
 * NOMBRES PARA EL ADMIN
 * =========================================================
 */

export function getMediaFileNames(
  media
) {
  const gallery =
    Array.isArray(
      media?.gallery
    )
      ? media.gallery
      : [];

  return {
    coverImageName:
      getMediaItemName(
        media?.coverImage
      ),

    coupleImageName:
      getMediaItemName(
        media?.coupleImage
      ),

    musicFileName:
      getMediaItemName(
        media?.backgroundMusic ||
          media?.musicUrl
      ),

    galleryFileNames:
      gallery
        .map(
          getMediaItemName
        )
        .filter(Boolean)
  };
}