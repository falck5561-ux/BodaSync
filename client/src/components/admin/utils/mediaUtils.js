export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_AUDIO_SIZE = 12 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 8;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

export const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg'
];

export function createMediaId() {
  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export function createEmptyMedia() {
  return {
    coverImage: null,
    coupleImage: null,
    backgroundMusic: null,
    gallery: []
  };
}

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
    unitIndex === 0 ? 0 : 2
  )} ${units[unitIndex]}`;
}

export function isImageFile(file) {
  if (!file) {
    return false;
  }

  return (
    file.type.startsWith('image/') &&
    ACCEPTED_IMAGE_TYPES.includes(
      file.type
    )
  );
}

export function isAudioFile(file) {
  if (!file) {
    return false;
  }

  return (
    file.type.startsWith('audio/') &&
    ACCEPTED_AUDIO_TYPES.includes(
      file.type
    )
  );
}

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
          'Selecciona una imagen JPG, PNG o WebP.'
      };
    }

    if (file.size > MAX_IMAGE_SIZE) {
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

    if (file.size > MAX_AUDIO_SIZE) {
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

export function createPreviewUrl(file) {
  if (
    !file ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !==
      'function'
  ) {
    return '';
  }

  return URL.createObjectURL(file);
}

export function createMediaItem(
  file,
  extraData = {}
) {
  if (!file) {
    return null;
  }

  return {
    id: createMediaId(),
    file,
    name: file.name || 'Archivo',
    type: file.type || '',
    size: file.size || 0,
    formattedSize:
      formatFileSize(file.size || 0),
    previewUrl:
      createPreviewUrl(file),
    ...extraData
  };
}

export function revokeMediaUrl(
  mediaItem
) {
  if (
    !mediaItem?.previewUrl ||
    typeof URL === 'undefined' ||
    typeof URL.revokeObjectURL !==
      'function'
  ) {
    return;
  }

  URL.revokeObjectURL(
    mediaItem.previewUrl
  );
}

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
    media.backgroundMusic
  );

  if (Array.isArray(media.gallery)) {
    media.gallery.forEach(
      revokeMediaUrl
    );
  }
}

export function removeGalleryItem(
  gallery,
  imageId
) {
  if (!Array.isArray(gallery)) {
    return [];
  }

  const selectedImage =
    gallery.find(
      (image) =>
        image.id === imageId
    );

  revokeMediaUrl(selectedImage);

  return gallery.filter(
    (image) =>
      image.id !== imageId
  );
}

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

  filesToProcess.forEach((file) => {
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
      createMediaItem(file);

    if (mediaItem) {
      items.push(mediaItem);
    }
  });

  if (
    selectedFiles.length >
    availableSpaces
  ) {
    errors.push(
      `Solo se agregaron ${availableSpaces} imágenes porque el límite es ${MAX_GALLERY_IMAGES}.`
    );
  }

  return {
    items,
    errors
  };
}

export function getMediaFileNames(
  media
) {
  return {
    coverImageName:
      media?.coverImage?.name || '',

    coupleImageName:
      media?.coupleImage?.name || '',

    musicFileName:
      media?.backgroundMusic?.name ||
      '',

    galleryFileNames:
      Array.isArray(media?.gallery)
        ? media.gallery.map(
            (image) => image.name
          )
        : []
  };
}