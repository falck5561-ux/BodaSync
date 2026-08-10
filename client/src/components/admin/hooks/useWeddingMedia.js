import { useEffect, useMemo, useRef, useState } from 'react';

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

function getMediaSource(nextMedia = {}) {
  if (
    nextMedia?.media &&
    typeof nextMedia.media === 'object' &&
    !Array.isArray(nextMedia.media)
  ) {
    return nextMedia.media;
  }

  return nextMedia || {};
}

function getIncomingMusic(source = {}) {
  return (
    source.backgroundMusic ||
    source.musicUrl ||
    source.music ||
    null
  );
}

function normalizeIncomingGallery(source = {}) {
  if (Array.isArray(source.gallery)) {
    return source.gallery.filter(Boolean).slice(0, 8);
  }

  if (Array.isArray(source.photos)) {
    return source.photos.filter(Boolean).slice(0, 8);
  }

  return [];
}

export default function useWeddingMedia({
  setError,
  setSuccessMessage
} = {}) {
  const [media, setMedia] = useState(createEmptyMedia);

  /*
   * =======================================================
   * REFERENCIA AL ESTADO MÁS RECIENTE
   * =======================================================
   *
   * La usamos sobre todo al añadir varias imágenes.
   * También la actualizamos dentro de cada setMedia para no
   * depender de que useEffect haya terminado de ejecutarse.
   */

  const latestMediaRef = useRef(media);

  useEffect(() => {
    latestMediaRef.current = media;
  }, [media]);

  /*
   * =======================================================
   * LIMPIEZA AL DESMONTAR
   * =======================================================
   *
   * Los previews creados con URL.createObjectURL deben
   * liberarse para evitar memoria retenida en el navegador.
   */

  useEffect(() => {
    return () => {
      revokeAllMediaUrls(latestMediaRef.current);
    };
  }, []);

  /*
   * =======================================================
   * CONTADORES
   * =======================================================
   */

  const galleryCount = Array.isArray(media.gallery)
    ? media.gallery.length
    : 0;

  const selectedMediaCount = useMemo(() => {
    let total = Array.isArray(media.gallery)
      ? media.gallery.length
      : 0;

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

  const hasCoverImage = Boolean(media.coverImage);

  const hasCoupleImage = Boolean(media.coupleImage);

  const hasBackgroundMusic = Boolean(media.backgroundMusic);

  const hasGalleryImages =
    Array.isArray(media.gallery) &&
    media.gallery.length > 0;

  /*
   * =======================================================
   * NOMBRES DE ARCHIVOS
   * =======================================================
   */

  const mediaFileNames = useMemo(() => {
    return getMediaFileNames(media);
  }, [media]);

  /*
   * =======================================================
   * MENSAJES
   * =======================================================
   */

  function clearMessages() {
    if (typeof setError === 'function') {
      setError('');
    }

    if (typeof setSuccessMessage === 'function') {
      setSuccessMessage('');
    }
  }

  function showError(message) {
    if (typeof setError === 'function') {
      setError(message);
    }
  }

  function showSuccess(message) {
    if (typeof setSuccessMessage === 'function') {
      setSuccessMessage(message);
    }
  }

  /*
   * =======================================================
   * ACTUALIZACIÓN SEGURA DEL ESTADO
   * =======================================================
   *
   * Mantiene latestMediaRef sincronizado inmediatamente.
   */

  function updateMedia(updater) {
    setMedia((currentMedia) => {
      const nextMedia =
        typeof updater === 'function'
          ? updater(currentMedia)
          : updater;

      latestMediaRef.current = nextMedia;

      return nextMedia;
    });
  }

  /*
   * =======================================================
   * ARCHIVO INDIVIDUAL
   * =======================================================
   */

  function handleSingleMediaChange(
    event,
    mediaKey,
    acceptedType
  ) {
    const input = event?.target;

    const file = input?.files?.[0];

    const allowedKeys = [
      'coverImage',
      'coupleImage',
      'backgroundMusic'
    ];

    if (!allowedKeys.includes(mediaKey)) {
      showError(
        'El tipo de archivo seleccionado no es válido.'
      );

      if (input) {
        input.value = '';
      }

      return;
    }

    const validation = validateMediaFile(
      file,
      acceptedType
    );

    if (!validation.valid) {
      showError(validation.error);

      if (input) {
        input.value = '';
      }

      return;
    }

    const mediaItem = createMediaItem(file);

    if (!mediaItem) {
      showError(
        'No fue posible preparar el archivo seleccionado.'
      );

      if (input) {
        input.value = '';
      }

      return;
    }

    updateMedia((currentMedia) => {
      /*
       * Revocamos únicamente el preview anterior.
       */
      revokeMediaUrl(currentMedia[mediaKey]);

      return {
        ...currentMedia,
        [mediaKey]: mediaItem
      };
    });

    clearMessages();

    showSuccess(
      acceptedType === 'audio'
        ? 'La canción fue seleccionada correctamente.'
        : 'La imagen fue seleccionada correctamente.'
    );

    if (input) {
      input.value = '';
    }
  }

  /*
   * =======================================================
   * PORTADA
   * =======================================================
   */

  function handleCoverImageChange(event) {
    handleSingleMediaChange(
      event,
      'coverImage',
      'image'
    );
  }

  /*
   * =======================================================
   * FOTO DE PAREJA
   * =======================================================
   */

  function handleCoupleImageChange(event) {
    handleSingleMediaChange(
      event,
      'coupleImage',
      'image'
    );
  }

  /*
   * =======================================================
   * MÚSICA
   * =======================================================
   */

  function handleBackgroundMusicChange(event) {
    handleSingleMediaChange(
      event,
      'backgroundMusic',
      'audio'
    );
  }

  /*
   * =======================================================
   * ELIMINAR ARCHIVO INDIVIDUAL
   * =======================================================
   */

  function removeSingleMedia(mediaKey) {
    const allowedKeys = [
      'coverImage',
      'coupleImage',
      'backgroundMusic'
    ];

    if (!allowedKeys.includes(mediaKey)) {
      return;
    }

    updateMedia((currentMedia) => {
      revokeMediaUrl(currentMedia[mediaKey]);

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
    removeSingleMedia('backgroundMusic');
  }

  /*
   * =======================================================
   * GALERÍA
   * =======================================================
   */

  function handleGalleryChange(event) {
    const input = event?.target;

    const files = input?.files;

    if (!files || files.length === 0) {
      return;
    }

    const currentGallery = Array.isArray(
      latestMediaRef.current?.gallery
    )
      ? latestMediaRef.current.gallery
      : [];

    const result = prepareGalleryFiles(
      files,
      currentGallery
    );

    if (result.items.length > 0) {
      updateMedia((currentMedia) => ({
        ...currentMedia,

        gallery: [
          ...(Array.isArray(currentMedia.gallery)
            ? currentMedia.gallery
            : []),

          ...result.items
        ].slice(0, 8)
      }));

      clearMessages();

      showSuccess(
        result.items.length === 1
          ? 'Se agregó una fotografía a la galería.'
          : `Se agregaron ${result.items.length} fotografías a la galería.`
      );
    }

    if (result.errors.length > 0) {
      showError(result.errors.join(' '));
    }

    if (input) {
      input.value = '';
    }
  }

  /*
   * =======================================================
   * ELIMINAR FOTO DE GALERÍA
   * =======================================================
   */

  function removeGalleryImage(imageId) {
    if (!imageId) {
      return;
    }

    updateMedia((currentMedia) => ({
      ...currentMedia,

      gallery: removeGalleryItem(
        Array.isArray(currentMedia.gallery)
          ? currentMedia.gallery
          : [],
        imageId
      )
    }));

    clearMessages();
  }

  /*
   * =======================================================
   * ORDEN DE GALERÍA
   * =======================================================
   */

  function moveGalleryImage(
    imageIndex,
    direction
  ) {
    updateMedia((currentMedia) => {
      const gallery = Array.isArray(
        currentMedia.gallery
      )
        ? currentMedia.gallery
        : [];

      const newIndex =
        imageIndex + direction;

      if (
        imageIndex < 0 ||
        imageIndex >= gallery.length ||
        newIndex < 0 ||
        newIndex >= gallery.length
      ) {
        return currentMedia;
      }

      const updatedGallery = [
        ...gallery
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

  function moveGalleryImageUp(imageIndex) {
    moveGalleryImage(
      imageIndex,
      -1
    );
  }

  function moveGalleryImageDown(imageIndex) {
    moveGalleryImage(
      imageIndex,
      1
    );
  }

  /*
   * =======================================================
   * LIMPIAR GALERÍA
   * =======================================================
   */

  function clearGallery() {
    updateMedia((currentMedia) => {
      const gallery = Array.isArray(
        currentMedia.gallery
      )
        ? currentMedia.gallery
        : [];

      gallery.forEach((item) => {
        revokeMediaUrl(item);
      });

      return {
        ...currentMedia,
        gallery: []
      };
    });

    clearMessages();
  }

  /*
   * =======================================================
   * LIMPIAR TODO
   * =======================================================
   */

  function clearMedia() {
    updateMedia((currentMedia) => {
      revokeAllMediaUrls(currentMedia);

      return createEmptyMedia();
    });

    clearMessages();
  }

  /*
   * =======================================================
   * REEMPLAZAR MULTIMEDIA
   * =======================================================
   *
   * IMPORTANTE:
   *
   * Antes solamente reconocíamos:
   *
   * backgroundMusic
   *
   * Ahora también aceptamos:
   *
   * musicUrl
   * music
   *
   * Así la música no desaparece si la información
   * viene del formato nuevo del backend.
   *
   * También aceptamos:
   *
   * {
   *   media: {...}
   * }
   *
   * además del objeto multimedia directo.
   */

  function replaceMedia(nextMedia = {}) {
    const source =
      getMediaSource(nextMedia);

    const incomingMedia = {
      coverImage:
        source.coverImage ||
        source.heroImage ||
        source.cover ||
        null,

      coupleImage:
        source.coupleImage ||
        source.storyImage ||
        source.couple ||
        null,

      backgroundMusic:
        getIncomingMusic(source),

      gallery:
        normalizeIncomingGallery(
          source
        )
    };

    updateMedia((currentMedia) => {
      revokeAllMediaUrls(currentMedia);

      return incomingMedia;
    });

    clearMessages();
  }

  /*
   * =======================================================
   * PAYLOAD AUXILIAR
   * =======================================================
   *
   * Este método se conserva por compatibilidad.
   *
   * La publicación real NO depende de este método.
   * useWeddingBuilder envía directamente media a
   * uploadWeddingMedia().
   */

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