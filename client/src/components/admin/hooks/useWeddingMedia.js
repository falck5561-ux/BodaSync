import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  createEmptyMedia,
  createMediaItem,
  getMediaFileNames,
  prepareGalleryFiles,
  removeGalleryItem,
  revokeAllMediaUrls,
  revokeMediaUrl,
  validateMediaFile
} from '../utils/mediaUtils';

export default function useWeddingMedia({
  setError,
  setSuccessMessage
} = {}) {
  const [media, setMedia] = useState(
    createEmptyMedia
  );

  const latestMediaRef = useRef(media);

  useEffect(() => {
    latestMediaRef.current = media;
  }, [media]);

  useEffect(() => {
    return () => {
      revokeAllMediaUrls(
        latestMediaRef.current
      );
    };
  }, []);

  const galleryCount = media.gallery.length;

  const selectedMediaCount = useMemo(() => {
    let total = media.gallery.length;

    if (media.coverImage) {
      total += 1;
    }

    if (media.coupleImage) {
      total += 1;
    }

    if (media.backgroundMusic) {
      total += 1;
    }

    return total;
  }, [media]);

  const hasCoverImage =
    Boolean(media.coverImage);

  const hasCoupleImage =
    Boolean(media.coupleImage);

  const hasBackgroundMusic =
    Boolean(media.backgroundMusic);

  const hasGalleryImages =
    media.gallery.length > 0;

  const mediaFileNames = useMemo(() => {
    return getMediaFileNames(media);
  }, [media]);

  function clearMessages() {
    if (typeof setError === 'function') {
      setError('');
    }

    if (
      typeof setSuccessMessage ===
      'function'
    ) {
      setSuccessMessage('');
    }
  }

  function showError(message) {
    if (typeof setError === 'function') {
      setError(message);
    }
  }

  function showSuccess(message) {
    if (
      typeof setSuccessMessage ===
      'function'
    ) {
      setSuccessMessage(message);
    }
  }

  function handleSingleMediaChange(
    event,
    mediaKey,
    acceptedType
  ) {
    const file =
      event.target.files?.[0];

    const allowedKeys = [
      'coverImage',
      'coupleImage',
      'backgroundMusic'
    ];

    if (!allowedKeys.includes(mediaKey)) {
      showError(
        'El tipo de archivo seleccionado no es válido.'
      );

      event.target.value = '';
      return;
    }

    const validation =
      validateMediaFile(
        file,
        acceptedType
      );

    if (!validation.valid) {
      showError(validation.error);

      event.target.value = '';
      return;
    }

    const mediaItem =
      createMediaItem(file);

    if (!mediaItem) {
      showError(
        'No fue posible preparar el archivo.'
      );

      event.target.value = '';
      return;
    }

    setMedia((currentMedia) => {
      revokeMediaUrl(
        currentMedia[mediaKey]
      );

      return {
        ...currentMedia,
        [mediaKey]: mediaItem
      };
    });

    clearMessages();

    showSuccess(
      acceptedType === 'audio'
        ? 'La canción fue seleccionada.'
        : 'La imagen fue seleccionada.'
    );

    event.target.value = '';
  }

  function handleCoverImageChange(event) {
    handleSingleMediaChange(
      event,
      'coverImage',
      'image'
    );
  }

  function handleCoupleImageChange(event) {
    handleSingleMediaChange(
      event,
      'coupleImage',
      'image'
    );
  }

  function handleBackgroundMusicChange(
    event
  ) {
    handleSingleMediaChange(
      event,
      'backgroundMusic',
      'audio'
    );
  }

  function removeSingleMedia(mediaKey) {
    const allowedKeys = [
      'coverImage',
      'coupleImage',
      'backgroundMusic'
    ];

    if (!allowedKeys.includes(mediaKey)) {
      return;
    }

    setMedia((currentMedia) => {
      revokeMediaUrl(
        currentMedia[mediaKey]
      );

      return {
        ...currentMedia,
        [mediaKey]: null
      };
    });

    clearMessages();
  }

  function removeCoverImage() {
    removeSingleMedia('coverImage');
  }

  function removeCoupleImage() {
    removeSingleMedia('coupleImage');
  }

  function removeBackgroundMusic() {
    removeSingleMedia(
      'backgroundMusic'
    );
  }

  function handleGalleryChange(event) {
    const files =
      event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const currentGallery =
      latestMediaRef.current.gallery;

    const result =
      prepareGalleryFiles(
        files,
        currentGallery
      );

    if (result.items.length > 0) {
      setMedia((currentMedia) => ({
        ...currentMedia,

        gallery: [
          ...currentMedia.gallery,
          ...result.items
        ]
      }));

      clearMessages();

      showSuccess(
        result.items.length === 1
          ? 'Se agregó una fotografía a la galería.'
          : `Se agregaron ${result.items.length} fotografías a la galería.`
      );
    }

    if (result.errors.length > 0) {
      showError(
        result.errors.join(' ')
      );
    }

    event.target.value = '';
  }

  function removeGalleryImage(imageId) {
    if (!imageId) {
      return;
    }

    setMedia((currentMedia) => ({
      ...currentMedia,

      gallery: removeGalleryItem(
        currentMedia.gallery,
        imageId
      )
    }));

    clearMessages();
  }

  function moveGalleryImage(
    imageIndex,
    direction
  ) {
    setMedia((currentMedia) => {
      const newIndex =
        imageIndex + direction;

      if (
        imageIndex < 0 ||
        imageIndex >=
          currentMedia.gallery.length ||
        newIndex < 0 ||
        newIndex >=
          currentMedia.gallery.length
      ) {
        return currentMedia;
      }

      const updatedGallery = [
        ...currentMedia.gallery
      ];

      const selectedImage =
        updatedGallery[imageIndex];

      updatedGallery[imageIndex] =
        updatedGallery[newIndex];

      updatedGallery[newIndex] =
        selectedImage;

      return {
        ...currentMedia,
        gallery: updatedGallery
      };
    });
  }

  function moveGalleryImageUp(
    imageIndex
  ) {
    moveGalleryImage(
      imageIndex,
      -1
    );
  }

  function moveGalleryImageDown(
    imageIndex
  ) {
    moveGalleryImage(
      imageIndex,
      1
    );
  }

  function clearGallery() {
    setMedia((currentMedia) => {
      currentMedia.gallery.forEach(
        revokeMediaUrl
      );

      return {
        ...currentMedia,
        gallery: []
      };
    });

    clearMessages();
  }

  function clearMedia() {
    setMedia((currentMedia) => {
      revokeAllMediaUrls(
        currentMedia
      );

      return createEmptyMedia();
    });

    clearMessages();
  }

  function replaceMedia(
    nextMedia = {}
  ) {
    setMedia((currentMedia) => {
      revokeAllMediaUrls(
        currentMedia
      );

      return {
        coverImage:
          nextMedia.coverImage || null,

        coupleImage:
          nextMedia.coupleImage || null,

        backgroundMusic:
          nextMedia.backgroundMusic ||
          null,

        gallery:
          Array.isArray(
            nextMedia.gallery
          )
            ? nextMedia.gallery
            : []
      };
    });
  }

  function getMediaPayload() {
    return getMediaFileNames(media);
  }

  return {
    media,
    setMedia,

    galleryCount,
    selectedMediaCount,

    hasCoverImage,
    hasCoupleImage,
    hasBackgroundMusic,
    hasGalleryImages,

    mediaFileNames,

    handleSingleMediaChange,

    handleCoverImageChange,
    handleCoupleImageChange,
    handleBackgroundMusicChange,

    removeSingleMedia,

    removeCoverImage,
    removeCoupleImage,
    removeBackgroundMusic,

    handleGalleryChange,
    removeGalleryImage,

    moveGalleryImage,
    moveGalleryImageUp,
    moveGalleryImageDown,

    clearGallery,
    clearMedia,
    replaceMedia,

    getMediaPayload
  };
}