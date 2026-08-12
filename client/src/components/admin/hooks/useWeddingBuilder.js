import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  updateWedding,
  uploadWeddingMedia
} from '../../../services/weddingService';

import useAdminSettings, {
  getInitialAdminSettings
} from './useAdminSettings';

import useItinerary from './useItinerary';
import useWeddingEvents from './useWeddingEvents';
import useWeddingForm from './useWeddingForm';
import useWeddingMedia from './useWeddingMedia';

import {
  formatPreviewDate
} from '../utils/dateUtils';

import {
  createWeddingPayload
} from '../utils/weddingPayload';

import {
  focusInvalidField,
  validateWeddingForm
} from '../utils/weddingValidation';

function canUseWindow() {
  return typeof window !== 'undefined';
}

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function buildPublicWeddingUrl(wedding) {
  if (!canUseWindow() || !wedding?.slug) {
    return '';
  }

  return `${window.location.origin}/boda/${encodeURIComponent(
    wedding.slug
  )}`;
}

/*
 * =========================================================
 * MULTIMEDIA GUARDADA
 * =========================================================
 */

function getStoredFileName(url, fallbackName) {
  const cleanUrl = cleanText(url);

  if (!cleanUrl) {
    return fallbackName;
  }

  try {
    const urlWithoutQuery =
      cleanUrl.split('?')[0];

    const lastSegment =
      urlWithoutQuery
        .split('/')
        .filter(Boolean)
        .pop();

    if (!lastSegment) {
      return fallbackName;
    }

    return decodeURIComponent(lastSegment);
  } catch {
    return fallbackName;
  }
}

function createStoredMediaItem(
  url,
  type,
  index = 0
) {
  const cleanUrl = cleanText(url);

  if (!cleanUrl) {
    return null;
  }

  const isAudio = type === 'audio';

  const fallbackName = isAudio
    ? 'Canción guardada'
    : index > 0
      ? `Fotografía ${index}`
      : 'Imagen guardada';

  return {
    id: `stored-${type}-${index}-${cleanUrl}`,
    file: null,
    name: getStoredFileName(
      cleanUrl,
      fallbackName
    ),
    type: isAudio
      ? 'audio'
      : 'image',
    size: 0,
    formattedSize: 'Guardado',
    previewUrl: cleanUrl,
    url: cleanUrl
  };
}

function hydrateWeddingMedia(media = {}) {
  const source =
    media &&
    typeof media === 'object' &&
    !Array.isArray(media)
      ? media
      : {};

  const musicUrl = cleanText(
    source.musicUrl ||
      source.backgroundMusic ||
      source.music
  );

  const gallery = Array.isArray(
    source.gallery
  )
    ? source.gallery
        .map((item, index) => {
          const url =
            typeof item === 'string'
              ? item
              : item?.url ||
                item?.path ||
                item?.src ||
                '';

          return createStoredMediaItem(
            url,
            'gallery',
            index + 1
          );
        })
        .filter(Boolean)
    : [];

  return {
    coverImage: createStoredMediaItem(
      source.coverImage ||
        source.coverImageUrl ||
        '',
      'cover',
      0
    ),

    coupleImage: createStoredMediaItem(
      source.coupleImage ||
        source.coupleImageUrl ||
        '',
      'couple',
      0
    ),

    backgroundMusic:
      createStoredMediaItem(
        musicUrl,
        'audio',
        0
      ),

    gallery
  };
}

function getPersistentMediaUrl(mediaItem) {
  if (!mediaItem) {
    return '';
  }

  if (typeof mediaItem === 'string') {
    return cleanText(mediaItem);
  }

  if (
    typeof mediaItem !== 'object'
  ) {
    return '';
  }

  /*
   * No usamos previewUrl porque los archivos nuevos
   * normalmente tienen una URL blob temporal.
   */

  return cleanText(
    mediaItem.url ||
      mediaItem.secureUrl ||
      mediaItem.secure_url ||
      mediaItem.fileUrl ||
      mediaItem.path ||
      mediaItem.src ||
      ''
  );
}

function hasMediaFile(mediaItem) {
  if (!mediaItem) {
    return false;
  }

  if (
    typeof File !== 'undefined' &&
    mediaItem instanceof File
  ) {
    return true;
  }

  if (
    typeof Blob !== 'undefined' &&
    mediaItem instanceof Blob
  ) {
    return true;
  }

  if (
    typeof File !== 'undefined' &&
    mediaItem.file instanceof File
  ) {
    return true;
  }

  if (
    typeof Blob !== 'undefined' &&
    mediaItem.file instanceof Blob
  ) {
    return true;
  }

  return false;
}

/*
 * =========================================================
 * ORDEN DE GALERÍA AL EDITAR
 * =========================================================
 */

function buildOrderedGallery(
  currentGallery,
  uploadedGallery
) {
  const gallery =
    Array.isArray(currentGallery)
      ? currentGallery
      : [];

  const uploadedUrls =
    Array.isArray(uploadedGallery)
      ? uploadedGallery
          .map((item) =>
            typeof item === 'string'
              ? cleanText(item)
              : getPersistentMediaUrl(item)
          )
          .filter(Boolean)
      : [];

  const existingUrls = gallery
    .map((item) =>
      getPersistentMediaUrl(item)
    )
    .filter(Boolean);

  const newFileCount = gallery.filter(
    (item) =>
      hasMediaFile(item)
  ).length;

  let freshUploadedUrls =
    uploadedUrls;

  if (
    newFileCount > 0 &&
    uploadedUrls.length >
      newFileCount
  ) {
    freshUploadedUrls =
      uploadedUrls
        .filter(
          (url) =>
            !existingUrls.includes(url)
        )
        .slice(0, newFileCount);
  }

  let uploadedIndex = 0;

  return gallery
    .map((item) => {
      const existingUrl =
        getPersistentMediaUrl(item);

      if (existingUrl) {
        return existingUrl;
      }

      if (hasMediaFile(item)) {
        const uploadedUrl =
          freshUploadedUrls[
            uploadedIndex
          ];

        uploadedIndex += 1;

        return uploadedUrl || '';
      }

      return '';
    })
    .filter(Boolean)
    .slice(0, 8);
}

/*
 * =========================================================
 * BORRADOR LOCAL / AUTOGUARDADO
 * =========================================================
 *
 * Este borrador vive únicamente en localStorage.
 *
 * NO publica.
 * NO actualiza MongoDB.
 * NO cambia el slug.
 * NO genera otra URL.
 */

const WEDDING_DRAFT_STORAGE_KEY =
  'bodasync:wedding-builder:draft:v1';

const WEDDING_DRAFT_VERSION = 1;

const WEDDING_DRAFT_AUTOSAVE_DELAY =
  1200;

const ALLOWED_DRAFT_TABS = [
  'general',
  'content',
  'sections',
  'itinerary',
  'media',
  'design',
  'preview'
];

function getDraftStorage() {
  if (!canUseWindow()) {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readStoredWeddingDraft() {
  const storage = getDraftStorage();

  if (!storage) {
    return null;
  }

  try {
    const rawDraft =
      storage.getItem(
        WEDDING_DRAFT_STORAGE_KEY
      );

    if (!rawDraft) {
      return null;
    }

    const parsedDraft =
      JSON.parse(rawDraft);

    if (
      !parsedDraft ||
      typeof parsedDraft !==
        'object' ||
      parsedDraft.version !==
        WEDDING_DRAFT_VERSION ||
      !parsedDraft.formData ||
      typeof parsedDraft.formData !==
        'object'
    ) {
      storage.removeItem(
        WEDDING_DRAFT_STORAGE_KEY
      );

      return null;
    }

    return parsedDraft;
  } catch {
    return null;
  }
}

function removeStoredWeddingDraft() {
  const storage = getDraftStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(
      WEDDING_DRAFT_STORAGE_KEY
    );

    return true;
  } catch {
    return false;
  }
}

function getDraftMediaUrl(mediaItem) {
  return getPersistentMediaUrl(
    mediaItem
  );
}

function serializeMediaForDraft(
  media = {}
) {
  const source =
    media &&
    typeof media === 'object' &&
    !Array.isArray(media)
      ? media
      : {};

  const gallery =
    Array.isArray(source.gallery)
      ? source.gallery
      : [];

  const coverImage =
    getDraftMediaUrl(
      source.coverImage
    );

  const coupleImage =
    getDraftMediaUrl(
      source.coupleImage
    );

  const backgroundMusic =
    getDraftMediaUrl(
      source.backgroundMusic ||
        source.musicUrl ||
        source.music
    );

  const galleryUrls =
    gallery
      .map((item) =>
        getDraftMediaUrl(item)
      )
      .filter(Boolean)
      .slice(0, 8);

  /*
   * Los archivos locales File/Blob no pueden
   * sobrevivir a una recarga mediante localStorage.
   */

  const hasUnrestorableFiles =
    hasMediaFile(
      source.coverImage
    ) ||
    hasMediaFile(
      source.coupleImage
    ) ||
    hasMediaFile(
      source.backgroundMusic ||
        source.musicUrl ||
        source.music
    ) ||
    gallery.some((item) =>
      hasMediaFile(item)
    );

  return {
    media: {
      coverImage,
      coupleImage,
      backgroundMusic,
      musicUrl:
        backgroundMusic,
      gallery:
        galleryUrls
    },

    hasUnrestorableFiles
  };
}

function getDraftEditingWedding(
  editingWedding
) {
  if (
    !editingWedding ||
    typeof editingWedding !==
      'object'
  ) {
    return null;
  }

  const weddingId =
    cleanText(
      String(
        editingWedding._id ||
          editingWedding.id ||
          ''
      )
    );

  if (!weddingId) {
    return null;
  }

  return {
    _id: weddingId,

    id:
      cleanText(
        String(
          editingWedding.id ||
            ''
        )
      ),

    slug:
      cleanText(
        editingWedding.slug
      ),

    groomName:
      cleanText(
        editingWedding.groomName
      ),

    brideName:
      cleanText(
        editingWedding.brideName
      ),

    updatedAt:
      editingWedding.updatedAt ||
      null
  };
}

function buildWeddingDraftSnapshot({
  formData,
  media,
  formTab,
  editingWedding
}) {
  const serializedMedia =
    serializeMediaForDraft(
      media
    );

  const editingContext =
    getDraftEditingWedding(
      editingWedding
    );

  return {
    version:
      WEDDING_DRAFT_VERSION,

    savedAt:
      new Date().toISOString(),

    mode:
      editingContext
        ? 'editing'
        : 'creating',

    formTab:
      ALLOWED_DRAFT_TABS.includes(
        formTab
      )
        ? formTab
        : 'general',

    formData:
      formData &&
      typeof formData ===
        'object'
        ? formData
        : {},

    media:
      serializedMedia.media,

    editingWedding:
      editingContext,

    hasUnrestorableFiles:
      serializedMedia
        .hasUnrestorableFiles
  };
}

function getWeddingDraftFingerprint(
  draft
) {
  if (
    !draft ||
    typeof draft !== 'object'
  ) {
    return '';
  }

  try {
    return JSON.stringify({
      mode: draft.mode,

      formTab:
        draft.formTab,

      formData:
        draft.formData,

      media:
        draft.media,

      editingWedding:
        draft.editingWedding
          ? {
              _id:
                draft
                  .editingWedding
                  ._id,

              slug:
                draft
                  .editingWedding
                  .slug
            }
          : null,

      hasUnrestorableFiles:
        Boolean(
          draft
            .hasUnrestorableFiles
        )
    });
  } catch {
    return '';
  }
}

function hasMeaningfulWeddingDraft(
  draft
) {
  if (
    !draft ||
    typeof draft !== 'object'
  ) {
    return false;
  }

  /*
   * Si estamos editando una boda publicada,
   * cualquier cambio puede ser importante.
   */

  if (draft.mode === 'editing') {
    return Boolean(
      draft.editingWedding?._id
    );
  }

  const formData =
    draft.formData &&
    typeof draft.formData ===
      'object'
      ? draft.formData
      : {};

  const media =
    draft.media &&
    typeof draft.media ===
      'object'
      ? draft.media
      : {};

  const location =
    formData.location &&
    typeof formData.location ===
      'object'
      ? formData.location
      : {};

  const story =
    formData.story &&
    typeof formData.story ===
      'object'
      ? formData.story
      : {};

  const parents =
    formData.parents &&
    typeof formData.parents ===
      'object'
      ? formData.parents
      : {};

  const dressCode =
    formData.dressCode &&
    typeof formData.dressCode ===
      'object'
      ? formData.dressCode
      : {};

  const gifts =
    formData.gifts &&
    typeof formData.gifts ===
      'object'
      ? formData.gifts
      : {};

  const itinerary =
    Array.isArray(
      formData.itinerary
    )
      ? formData.itinerary
      : [];

  const gallery =
    Array.isArray(media.gallery)
      ? media.gallery
      : [];

  const hasCoreInformation =
    Boolean(
      cleanText(
        formData.groomName
      ) ||
        cleanText(
          formData.brideName
        ) ||
        cleanText(
          formData.eventDate
        )
    );

  const hasContent =
    Boolean(
      Object.values({
        ...location,
        ...story,
        ...parents,
        ...dressCode,
        ...gifts
      }).some((value) =>
        typeof value === 'string'
          ? Boolean(
              cleanText(value)
            )
          : Boolean(value)
      )
    );

  const hasItinerary =
    itinerary.some((item) => {
      if (
        !item ||
        typeof item !== 'object'
      ) {
        return false;
      }

      return Object.values(
        item
      ).some((value) =>
        typeof value === 'string'
          ? Boolean(
              cleanText(value)
            )
          : Boolean(value)
      );
    });

  const hasMedia =
    Boolean(
      cleanText(
        media.coverImage
      ) ||
        cleanText(
          media.coupleImage
        ) ||
        cleanText(
          media.backgroundMusic
        ) ||
        gallery.length
    );

  const hasUnrestorableFiles =
    Boolean(
      draft.hasUnrestorableFiles
    );

  return Boolean(
    hasCoreInformation ||
      hasContent ||
      hasItinerary ||
      hasMedia ||
      hasUnrestorableFiles
  );
}

function writeStoredWeddingDraft(
  draft
) {
  const storage = getDraftStorage();

  if (
    !storage ||
    !hasMeaningfulWeddingDraft(
      draft
    )
  ) {
    return false;
  }

  try {
    storage.setItem(
      WEDDING_DRAFT_STORAGE_KEY,
      JSON.stringify(draft)
    );

    return true;
  } catch {
    return false;
  }
}

export default function useWeddingBuilder() {
  /*
   * =====================================================
   * AJUSTES INICIALES
   * =====================================================
   */

  const initialSettingsRef =
    useRef(
      getInitialAdminSettings()
    );

  /*
   * =====================================================
   * NAVEGACIÓN
   * =====================================================
   */

  const [
    activeSection,
    setActiveSection
  ] = useState('create');

  const [
    formTab,
    setFormTab
  ] = useState('general');

  /*
   * =====================================================
   * MENSAJES
   * =====================================================
   */

  const [
    error,
    setError
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage
  ] = useState('');

  /*
   * =====================================================
   * ENVÍO
   * =====================================================
   */

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const submittingRef =
    useRef(false);

  /*
   * =====================================================
   * MODO EDICIÓN
   * =====================================================
   */

  const [
    editingWedding,
    setEditingWedding
  ] = useState(null);

  const editingWeddingId =
    cleanText(
      String(
        editingWedding?._id ||
          editingWedding?.id ||
          ''
      )
    );

  const isEditing =
    Boolean(editingWeddingId);

  /*
   * =====================================================
   * BORRADOR LOCAL
   * =====================================================
   */

  const initialDraftRef =
    useRef(
      readStoredWeddingDraft()
    );

  const [
    recoverableDraft,
    setRecoverableDraft
  ] = useState(
    initialDraftRef.current
  );

  const [
    hasLocalDraft,
    setHasLocalDraft
  ] = useState(
    Boolean(
      initialDraftRef.current
    )
  );

  const [
    draftSavedAt,
    setDraftSavedAt
  ] = useState(
    initialDraftRef.current
      ?.savedAt ||
      ''
  );

  const [
    draftStatus,
    setDraftStatus
  ] = useState(
    initialDraftRef.current
      ? 'available'
      : 'idle'
  );

  const [
    draftHasUnrestorableFiles,
    setDraftHasUnrestorableFiles
  ] = useState(
    Boolean(
      initialDraftRef.current
        ?.hasUnrestorableFiles
    )
  );

  const autosaveTimerRef =
    useRef(null);

  const latestDraftRef =
    useRef(null);

  const draftBaselineFingerprintRef =
    useRef(null);

  const autosavePausedRef =
    useRef(false);

  /*
   * =====================================================
   * FORMULARIO
   * =====================================================
   */

  const weddingForm =
    useWeddingForm(
      initialSettingsRef.current
        .defaultMessage
    );

  const handleDefaultMessageSaved =
    useCallback(
      (defaultMessage) => {
        weddingForm.setFormData(
          (currentForm) => ({
            ...currentForm,

            welcomeMessage:
              currentForm
                .welcomeMessage ||
              defaultMessage
          })
        );
      },
      [
        weddingForm.setFormData
      ]
    );

  /*
   * =====================================================
   * AJUSTES
   * =====================================================
   */

  const adminSettings =
    useAdminSettings({
      setError,
      setSuccessMessage,

      onDefaultMessageSaved:
        handleDefaultMessageSaved
    });

  /*
   * =====================================================
   * ITINERARIO
   * =====================================================
   */

  const itinerary =
    useItinerary({
      formData:
        weddingForm.formData,

      setFormData:
        weddingForm.setFormData
    });

  /*
   * =====================================================
   * MULTIMEDIA
   * =====================================================
   */

  const weddingMedia =
    useWeddingMedia({
      setError,
      setSuccessMessage
    });

  /*
   * =====================================================
   * EVENTOS
   * =====================================================
   */

  const weddingEvents =
    useWeddingEvents({
      setError,
      setSuccessMessage,
      autoLoad: true
    });

  /*
   * =====================================================
   * DATOS CALCULADOS
   * =====================================================
   */

  const previewDate =
    useMemo(
      () =>
        formatPreviewDate(
          weddingForm
            .formData
            .eventDate
        ),
      [
        weddingForm
          .formData
          .eventDate
      ]
    );

  const builderSummary =
    useMemo(
      () => ({
        activeSections:
          weddingForm
            .activeSectionsCount,

        itineraryActivities:
          itinerary
            .completedActivitiesCount,

        selectedMedia:
          weddingMedia
            .selectedMediaCount,

        galleryImages:
          weddingMedia
            .galleryCount
      }),
      [
        weddingForm
          .activeSectionsCount,

        itinerary
          .completedActivitiesCount,

        weddingMedia
          .selectedMediaCount,

        weddingMedia
          .galleryCount
      ]
    );

  /*
   * =====================================================
   * AUTOGUARDADO
   * =====================================================
   */

  const currentDraftSnapshot =
    useMemo(
      () =>
        buildWeddingDraftSnapshot({
          formData:
            weddingForm.formData,

          media:
            weddingMedia.media,

          formTab,

          editingWedding
        }),
      [
        weddingForm.formData,
        weddingMedia.media,
        formTab,
        editingWedding
      ]
    );

  const currentDraftFingerprint =
    useMemo(
      () =>
        getWeddingDraftFingerprint(
          currentDraftSnapshot
        ),
      [
        currentDraftSnapshot
      ]
    );

  latestDraftRef.current =
    currentDraftSnapshot;

  const clearAutosaveTimer =
    useCallback(() => {
      if (
        !canUseWindow() ||
        !autosaveTimerRef.current
      ) {
        return;
      }

      window.clearTimeout(
        autosaveTimerRef.current
      );

      autosaveTimerRef.current =
        null;
    }, []);

  const clearDraftState =
    useCallback(
      (options = {}) => {
        const {
          resetBaseline = false
        } = options;

        clearAutosaveTimer();

        removeStoredWeddingDraft();

        setRecoverableDraft(null);

        setHasLocalDraft(false);

        setDraftSavedAt('');

        setDraftStatus('idle');

        setDraftHasUnrestorableFiles(
          false
        );

        if (resetBaseline) {
          draftBaselineFingerprintRef.current =
            latestDraftRef.current
              ? getWeddingDraftFingerprint(
                  latestDraftRef.current
                )
              : '';
        }
      },
      [
        clearAutosaveTimer
      ]
    );

  const pauseAutosaveUntilNextRender =
    useCallback(() => {
      autosavePausedRef.current =
        true;

      if (!canUseWindow()) {
        autosavePausedRef.current =
          false;

        return;
      }

      window.setTimeout(() => {
        draftBaselineFingerprintRef.current =
          latestDraftRef.current
            ? getWeddingDraftFingerprint(
                latestDraftRef.current
              )
            : '';

        autosavePausedRef.current =
          false;
      }, 0);
    }, []);

  const saveDraftSnapshot =
    useCallback(
      (
        draft =
          latestDraftRef.current
      ) => {
        if (
          !draft ||
          !hasMeaningfulWeddingDraft(
            draft
          )
        ) {
          return false;
        }

        setDraftStatus('saving');

        const saved =
          writeStoredWeddingDraft(
            draft
          );

        if (!saved) {
          setDraftStatus(
            'error'
          );

          return false;
        }

        /*
         * Una vez que ya estamos trabajando en esta
         * sesión, no queremos volver a mostrar el
         * cuadro de recuperación.
         */

        setRecoverableDraft(null);

        setHasLocalDraft(true);

        setDraftSavedAt(
          draft.savedAt
        );

        setDraftStatus('saved');

        setDraftHasUnrestorableFiles(
          Boolean(
            draft
              .hasUnrestorableFiles
          )
        );

        return true;
      },
      []
    );

  const flushDraftNow =
    useCallback(() => {
      if (
        recoverableDraft ||
        autosavePausedRef.current
      ) {
        return false;
      }

      return saveDraftSnapshot(
        buildWeddingDraftSnapshot({
          formData:
            weddingForm.formData,

          media:
            weddingMedia.media,

          formTab,

          editingWedding
        })
      );
    }, [
      editingWedding,
      formTab,
      recoverableDraft,
      saveDraftSnapshot,
      weddingForm.formData,
      weddingMedia.media
    ]);

  const restoreDraft =
    useCallback(() => {
      const draft =
        recoverableDraft ||
        readStoredWeddingDraft();

      if (
        !draft ||
        typeof draft !==
          'object'
      ) {
        setRecoverableDraft(null);
        setHasLocalDraft(false);
        setDraftStatus('idle');

        return false;
      }

      autosavePausedRef.current =
        true;

      weddingForm.loadFormData(
        draft.formData || {}
      );

      weddingMedia.setMedia(
        hydrateWeddingMedia(
          draft.media || {}
        )
      );

      const draftEditingWedding =
        draft.mode ===
          'editing' &&
        draft.editingWedding?._id
          ? {
              ...draft.editingWedding,

              media:
                draft.media || {}
            }
          : null;

      setEditingWedding(
        draftEditingWedding
      );

      const restoredTab =
        ALLOWED_DRAFT_TABS.includes(
          draft.formTab
        )
          ? draft.formTab
          : 'general';

      setFormTab(
        restoredTab
      );

      setActiveSection(
        'create'
      );

      setRecoverableDraft(null);

      setHasLocalDraft(true);

      setDraftSavedAt(
        draft.savedAt || ''
      );

      setDraftStatus(
        'restored'
      );

      setDraftHasUnrestorableFiles(
        Boolean(
          draft
            .hasUnrestorableFiles
        )
      );

      setError('');

      setSuccessMessage(
        draft.hasUnrestorableFiles
          ? 'El borrador fue recuperado. Algunos archivos locales deben seleccionarse nuevamente.'
          : 'El borrador fue recuperado correctamente.'
      );

      if (canUseWindow()) {
        window.setTimeout(
          () => {
            draftBaselineFingerprintRef.current =
              getWeddingDraftFingerprint(
                latestDraftRef.current
              );

            autosavePausedRef.current =
              false;
          },
          0
        );

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        autosavePausedRef.current =
          false;
      }

      return true;
    }, [
      recoverableDraft,
      weddingForm,
      weddingMedia
    ]);

  const discardDraft =
    useCallback(() => {
      clearDraftState({
        resetBaseline: true
      });

      setSuccessMessage(
        'El borrador guardado fue descartado.'
      );

      return true;
    }, [
      clearDraftState
    ]);

  /*
   * Establecer estado inicial para comparar cambios.
   */

  useEffect(() => {
    if (
      draftBaselineFingerprintRef
        .current === null
    ) {
      draftBaselineFingerprintRef.current =
        currentDraftFingerprint;
    }
  }, [
    currentDraftFingerprint
  ]);

  /*
   * Guardar después de 1.2 segundos sin cambios.
   */

  useEffect(() => {
    if (
      !canUseWindow() ||
      recoverableDraft ||
      autosavePausedRef.current ||
      currentDraftFingerprint ===
        draftBaselineFingerprintRef
          .current
    ) {
      return undefined;
    }

    if (
      !hasMeaningfulWeddingDraft(
        currentDraftSnapshot
      )
    ) {
      clearAutosaveTimer();

      return undefined;
    }

    clearAutosaveTimer();

    setDraftStatus(
      'pending'
    );

    autosaveTimerRef.current =
      window.setTimeout(
        () => {
          const freshDraft =
            buildWeddingDraftSnapshot({
              formData:
                weddingForm.formData,

              media:
                weddingMedia.media,

              formTab,

              editingWedding
            });

          saveDraftSnapshot(
            freshDraft
          );

          autosaveTimerRef.current =
            null;
        },
        WEDDING_DRAFT_AUTOSAVE_DELAY
      );

    return () => {
      clearAutosaveTimer();
    };
  }, [
    clearAutosaveTimer,
    currentDraftFingerprint,
    currentDraftSnapshot,
    editingWedding,
    formTab,
    recoverableDraft,
    saveDraftSnapshot,
    weddingForm.formData,
    weddingMedia.media
  ]);

  /*
   * Intentar guardar antes de cerrar o recargar.
   */

  useEffect(() => {
    if (!canUseWindow()) {
      return undefined;
    }

    function handleBeforeUnload() {
      if (
        recoverableDraft ||
        autosavePausedRef.current
      ) {
        return;
      }

      const latestDraft =
        latestDraftRef.current;

      if (
        !latestDraft ||
        !hasMeaningfulWeddingDraft(
          latestDraft
        )
      ) {
        return;
      }

      writeStoredWeddingDraft(
        latestDraft
      );
    }

    window.addEventListener(
      'beforeunload',
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        'beforeunload',
        handleBeforeUnload
      );
    };
  }, [
    recoverableDraft
  ]);

  /*
   * =====================================================
   * MENSAJES
   * =====================================================
   */

  function clearMessages() {
    setError('');
    setSuccessMessage('');
  }

  /*
   * =====================================================
   * NAVEGACIÓN PRINCIPAL
   * =====================================================
   */

  function changeSection(section) {
    const allowedSections = [
      'create',
      'events',
      'settings'
    ];

    if (
      !allowedSections.includes(
        section
      )
    ) {
      return;
    }

    setActiveSection(
      section
    );

    clearMessages();

    if (
      section === 'events'
    ) {
      weddingEvents.loadEvents();
    }
  }

  /*
   * =====================================================
   * PESTAÑAS
   * =====================================================
   */

  function changeFormTab(
    tabName
  ) {
    const allowedTabs = [
      'general',
      'content',
      'sections',
      'itinerary',
      'media',
      'design',
      'preview'
    ];

    if (
      !allowedTabs.includes(
        tabName
      )
    ) {
      return;
    }

    setFormTab(
      tabName
    );

    setError('');
  }

  /*
   * =====================================================
   * CARGAR INVITACIÓN PARA EDITAR
   * =====================================================
   */

  function startEditingWedding(
    weddingOrId
  ) {
    let wedding = null;

    if (
      weddingOrId &&
      typeof weddingOrId ===
        'object'
    ) {
      wedding =
        weddingOrId;
    } else {
      const weddingId =
        cleanText(
          String(
            weddingOrId || ''
          )
        );

      if (weddingId) {
        wedding =
          weddingEvents
            .findEventById?.(
              weddingId
            );
      }
    }

    if (!wedding) {
      setError(
        'No fue posible cargar la invitación para editar.'
      );

      return false;
    }

    const weddingId =
      cleanText(
        String(
          wedding._id ||
            wedding.id ||
            ''
        )
      );

    if (!weddingId) {
      setError(
        'La invitación no tiene un identificador válido.'
      );

      return false;
    }

    clearMessages();

    /*
     * Cuando elegimos explícitamente editar otra boda,
     * descartamos el borrador anterior.
     */

    autosavePausedRef.current =
      true;

    clearDraftState();

    weddingForm.loadFormData(
      wedding
    );

    weddingMedia.setMedia(
      hydrateWeddingMedia(
        wedding.media
      )
    );

    setEditingWedding(
      wedding
    );

    pauseAutosaveUntilNextRender();

    weddingEvents
      .clearGeneratedWedding?.();

    setActiveSection(
      'create'
    );

    setFormTab(
      'general'
    );

    setSuccessMessage(
      `Editando la invitación de ${cleanText(
        wedding.groomName
      ) || 'la pareja'}${
        cleanText(
          wedding.brideName
        )
          ? ` y ${cleanText(
              wedding.brideName
            )}`
          : ''
      }.`
    );

    if (canUseWindow()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    return true;
  }

  /*
   * =====================================================
   * CANCELAR EDICIÓN
   * =====================================================
   */

  function cancelEditing() {
    if (!isEditing) {
      return false;
    }

    autosavePausedRef.current =
      true;

    clearDraftState();

    setEditingWedding(
      null
    );

    weddingForm.resetForm(
      adminSettings.defaultMessage
    );

    weddingMedia.clearMedia();

    pauseAutosaveUntilNextRender();

    weddingEvents
      .clearGeneratedWedding?.();

    setFormTab(
      'general'
    );

    clearMessages();

    setSuccessMessage(
      'La edición fue cancelada.'
    );

    if (canUseWindow()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    return true;
  }

  /*
   * =====================================================
   * LIMPIAR CONSTRUCTOR
   * =====================================================
   */

  function resetBuilder(
    options = {}
  ) {
    const {
      force = false
    } = options;

    if (
      !force &&
      adminSettings
        .confirmBeforeReset &&
      canUseWindow()
    ) {
      const shouldReset =
        window.confirm(
          isEditing
            ? '¿Deseas cancelar la edición y limpiar el constructor? Los cambios que no hayas guardado se perderán.'
            : '¿Deseas limpiar la invitación actual? Los datos que no hayas guardado se perderán.'
        );

      if (!shouldReset) {
        return false;
      }
    }

    autosavePausedRef.current =
      true;

    clearDraftState();

    setEditingWedding(
      null
    );

    weddingForm.resetForm(
      adminSettings.defaultMessage
    );

    weddingMedia.clearMedia();

    pauseAutosaveUntilNextRender();

    weddingEvents
      .clearGeneratedWedding?.();

    setFormTab(
      'general'
    );

    setError('');

    setSuccessMessage(
      'El constructor fue limpiado.'
    );

    if (canUseWindow()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    return true;
  }

  /*
   * =====================================================
   * LIMPIAR DESPUÉS DE CREAR
   * =====================================================
   */

  function clearBuilderAfterCreation() {
    autosavePausedRef.current =
      true;

    clearDraftState();

    setEditingWedding(
      null
    );

    weddingForm.resetForm(
      adminSettings.defaultMessage
    );

    weddingMedia.clearMedia();

    setFormTab(
      'general'
    );

    pauseAutosaveUntilNextRender();
  }

  /*
   * =====================================================
   * ACTUALIZAR EVENTO EN MEMORIA
   * =====================================================
   */

  function replaceEventInList(
    updatedWedding
  ) {
    const updatedId =
      cleanText(
        String(
          updatedWedding?._id ||
            updatedWedding?.id ||
            ''
        )
      );

    if (!updatedId) {
      return;
    }

    weddingEvents.setEvents(
      (currentEvents) => {
        if (
          !Array.isArray(
            currentEvents
          )
        ) {
          return [
            updatedWedding
          ];
        }

        let found = false;

        const nextEvents =
          currentEvents.map(
            (event) => {
              const eventId =
                cleanText(
                  String(
                    event?._id ||
                      event?.id ||
                      ''
                  )
                );

              if (
                eventId ===
                updatedId
              ) {
                found = true;

                return updatedWedding;
              }

              return event;
            }
          );

        if (!found) {
          return [
            updatedWedding,
            ...nextEvents
          ];
        }

        return nextEvents;
      }
    );
  }

  /*
   * =====================================================
   * CREAR / ACTUALIZAR INVITACIÓN
   * =====================================================
   */

  async function handleSubmit(
    event
  ) {
    event?.preventDefault();

    if (
      submittingRef.current ||
      submitting ||
      weddingEvents.loading
    ) {
      return null;
    }

    clearMessages();

    /*
     * ===================================================
     * 1. VALIDAR
     * ===================================================
     */

    const validation =
      validateWeddingForm({
        formData:
          weddingForm.formData,

        media:
          weddingMedia.media
      });

    if (!validation.valid) {
      setError(
        validation.message
      );

      if (
        validation.tab
      ) {
        setFormTab(
          validation.tab
        );
      }

      if (canUseWindow()) {
        window.setTimeout(
          () => {
            focusInvalidField(
              validation.field
            );
          },
          80
        );
      }

      return null;
    }

    /*
     * ===================================================
     * 2. PREABRIR INVITACIÓN
     * ===================================================
     */

    let invitationWindow =
      null;

    if (
      adminSettings
        .openCreatedInvitation &&
      canUseWindow()
    ) {
      invitationWindow =
        window.open(
          '',
          '_blank'
        );

      if (
        invitationWindow
      ) {
        invitationWindow.opener =
          null;
      }
    }

    try {
      submittingRef.current =
        true;

      setSubmitting(true);

      /*
       * =================================================
       * 3. SUBIR MULTIMEDIA
       * =================================================
       */

      const uploadResponse =
        await uploadWeddingMedia(
          weddingMedia.media
        );

      const uploadedMedia =
        uploadResponse?.media ||
        {};

      /*
       * =================================================
       * 4. RECONSTRUIR GALERÍA
       * =================================================
       */

      const orderedGallery =
        buildOrderedGallery(
          weddingMedia.media
            ?.gallery,

          uploadedMedia.gallery
        );

      const finalUploadedMedia = {
        ...uploadedMedia,

        gallery:
          orderedGallery
      };

      /*
       * =================================================
       * 5. CREAR PAYLOAD
       * =================================================
       */

      const payload =
        createWeddingPayload({
          formData:
            weddingForm.formData,

          uploadedMedia:
            finalUploadedMedia
        });

      let savedWedding;

      /*
       * =================================================
       * 6A. ACTUALIZAR
       * =================================================
       */

      if (isEditing) {
        savedWedding =
          await updateWedding(
            editingWeddingId,
            payload
          );

        if (!savedWedding) {
          invitationWindow
            ?.close();

          return null;
        }

        replaceEventInList(
          savedWedding
        );

        setEditingWedding(
          savedWedding
        );

        weddingEvents
          .setGeneratedWedding?.(
            savedWedding
          );

        weddingForm.loadFormData(
          savedWedding
        );

        weddingMedia.setMedia(
          hydrateWeddingMedia(
            savedWedding.media
          )
        );
      } else {
        /*
         * ===============================================
         * 6B. CREAR
         * ===============================================
         */

        savedWedding =
          await weddingEvents
            .createEvent(
              payload
            );

        if (!savedWedding) {
          invitationWindow
            ?.close();

          return null;
        }
      }

      /*
       * =================================================
       * 7. VALIDAR SLUG
       * =================================================
       */

      if (!savedWedding.slug) {
        invitationWindow
          ?.close();

        throw new Error(
          isEditing
            ? 'Los cambios fueron guardados, pero el servidor no devolvió el enlace de la invitación.'
            : 'La invitación fue creada, pero el servidor no devolvió su enlace.'
        );
      }

      /*
       * =================================================
       * 8. ABRIR INVITACIÓN
       * =================================================
       */

      const publicUrl =
        buildPublicWeddingUrl(
          savedWedding
        );

      if (
        invitationWindow &&
        publicUrl
      ) {
        invitationWindow
          .location
          .href =
          publicUrl;
      }

      /*
       * =================================================
       * 9. BORRAR BORRADOR LOCAL
       * =================================================
       *
       * Ya fue guardada correctamente en el servidor.
       */

      autosavePausedRef.current =
        true;

      clearDraftState();

      /*
       * =================================================
       * 10. FINALIZAR
       * =================================================
       */

      if (isEditing) {
        setSuccessMessage(
          adminSettings
            .openCreatedInvitation
            ? 'Los cambios fueron guardados correctamente y la invitación se abrió en una nueva pestaña.'
            : 'Los cambios de la invitación fueron guardados correctamente.'
        );
      } else {
        clearBuilderAfterCreation();

        setSuccessMessage(
          adminSettings
            .openCreatedInvitation
            ? 'La invitación fue creada correctamente y se abrió en una nueva pestaña.'
            : 'La invitación fue creada correctamente.'
        );
      }

      pauseAutosaveUntilNextRender();

      if (canUseWindow()) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }

      return savedWedding;
    } catch (submitError) {
      invitationWindow
        ?.close();

      setError(
        submitError?.message ||
          (
            isEditing
              ? 'No fue posible guardar los cambios de la invitación.'
              : 'No fue posible crear la invitación.'
          )
      );

      return null;
    } finally {
      submittingRef.current =
        false;

      setSubmitting(false);
    }
  }

  /*
   * =====================================================
   * ELIMINAR EVENTO
   * =====================================================
   */

  async function handleDelete(
    eventId
  ) {
    if (!eventId) {
      return false;
    }

    if (
      adminSettings
        .confirmBeforeDelete &&
      canUseWindow()
    ) {
      const shouldDelete =
        window.confirm(
          '¿Estás seguro de que deseas eliminar esta invitación? Esta acción no se puede deshacer.'
        );

      if (!shouldDelete) {
        return false;
      }
    }

    try {
      clearMessages();

      await weddingEvents
        .removeEvent(
          eventId
        );

      const deletedId =
        cleanText(
          String(
            eventId || ''
          )
        );

      if (
        isEditing &&
        deletedId ===
          editingWeddingId
      ) {
        autosavePausedRef.current =
          true;

        clearDraftState();

        setEditingWedding(
          null
        );

        weddingForm.resetForm(
          adminSettings
            .defaultMessage
        );

        weddingMedia.clearMedia();

        setFormTab(
          'general'
        );

        pauseAutosaveUntilNextRender();
      }

      setSuccessMessage(
        'La invitación fue eliminada correctamente.'
      );

      return true;
    } catch (deleteError) {
      setError(
        deleteError?.message ||
          'No fue posible eliminar la invitación.'
      );

      return false;
    }
  }

  /*
   * =====================================================
   * GUARDAR AJUSTES
   * =====================================================
   */

  function handleSaveSettings(
    event
  ) {
    return adminSettings
      .saveSettings(
        event
      );
  }

  /*
   * =====================================================
   * MENSAJE PREDETERMINADO
   * =====================================================
   */

  function applyDefaultMessage() {
    weddingForm
      .updateFormField(
        'welcomeMessage',
        adminSettings
          .defaultMessage
      );

    setError('');

    setSuccessMessage(
      'El mensaje predeterminado fue aplicado.'
    );
  }

  /*
   * =====================================================
   * VISTA PREVIA
   * =====================================================
   */

  function openPreview() {
    setFormTab(
      'preview'
    );

    setError('');

    if (canUseWindow()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  function goToGeneralInformation() {
    setFormTab(
      'general'
    );

    setError('');
  }

  /*
   * =====================================================
   * RETORNO DEL BUILDER
   * =====================================================
   */

  return {
    /*
     * Navegación
     */

    activeSection,
    setActiveSection,
    changeSection,

    formTab,
    setFormTab,
    changeFormTab,

    openPreview,
    goToGeneralInformation,

    /*
     * Modo edición
     */

    isEditing,
    editingWedding,
    editingWeddingId,

    editingWeddingSlug:
      cleanText(
        editingWedding?.slug
      ),

    startEditingWedding,
    cancelEditing,

    /*
     * =================================================
     * BORRADOR / AUTOGUARDADO
     * =================================================
     */

    hasRecoverableDraft:
      Boolean(
        recoverableDraft
      ),

    hasLocalDraft,

    recoverableDraft,

    draftSavedAt,

    /*
     * Estados posibles:
     *
     * idle
     * available
     * pending
     * saving
     * saved
     * restored
     * error
     */

    draftStatus,

    draftHasUnrestorableFiles,

    restoreDraft,
    discardDraft,
    flushDraftNow,

    /*
     * Alertas
     */

    error,
    setError,

    successMessage,
    setSuccessMessage,

    clearMessages,

    /*
     * Formulario
     */

    formData:
      weddingForm.formData,

    setFormData:
      weddingForm.setFormData,

    activeSectionsCount:
      weddingForm
        .activeSectionsCount,

    coupleNames:
      weddingForm.coupleNames,

    handleChange:
      weddingForm.handleChange,

    handleNumberChange:
      weddingForm
        .handleNumberChange,

    handleThemeChange:
      weddingForm
        .handleThemeChange,

    handleSectionToggle:
      weddingForm
        .handleSectionToggle,

    setSectionEnabled:
      weddingForm
        .setSectionEnabled,

    activateAllSections:
      weddingForm
        .activateAllSections,

    deactivateAllSections:
      weddingForm
        .deactivateAllSections,

    updateFormField:
      weddingForm
        .updateFormField,

    updateNestedField:
      weddingForm
        .updateNestedField,

    loadFormData:
      weddingForm.loadFormData,

    /*
     * Itinerario
     */

    itinerary:
      itinerary.itinerary,

    completedActivitiesCount:
      itinerary
        .completedActivitiesCount,

    hasValidActivity:
      itinerary
        .hasValidActivity,

    handleItineraryChange:
      itinerary
        .handleItineraryChange,

    addItineraryItem:
      itinerary
        .addItineraryItem,

    removeItineraryItem:
      itinerary
        .removeItineraryItem,

    duplicateItineraryItem:
      itinerary
        .duplicateItineraryItem,

    moveItineraryItem:
      itinerary
        .moveItineraryItem,

    moveItineraryItemUp:
      itinerary
        .moveItineraryItemUp,

    moveItineraryItemDown:
      itinerary
        .moveItineraryItemDown,

    sortItineraryByTime:
      itinerary
        .sortItineraryByTime,

    clearItinerary:
      itinerary
        .clearItinerary,

    replaceItinerary:
      itinerary
        .replaceItinerary,

    getCleanItinerary:
      itinerary
        .getCleanItinerary,

    /*
     * Multimedia
     */

    media:
      weddingMedia.media,

    setMedia:
      weddingMedia.setMedia,

    galleryCount:
      weddingMedia.galleryCount,

    selectedMediaCount:
      weddingMedia
        .selectedMediaCount,

    hasCoverImage:
      weddingMedia
        .hasCoverImage,

    hasCoupleImage:
      weddingMedia
        .hasCoupleImage,

    hasBackgroundMusic:
      weddingMedia
        .hasBackgroundMusic,

    hasGalleryImages:
      weddingMedia
        .hasGalleryImages,

    mediaFileNames:
      weddingMedia
        .mediaFileNames,

    handleSingleMediaChange:
      weddingMedia
        .handleSingleMediaChange,

    handleCoverImageChange:
      weddingMedia
        .handleCoverImageChange,

    handleCoupleImageChange:
      weddingMedia
        .handleCoupleImageChange,

    handleBackgroundMusicChange:
      weddingMedia
        .handleBackgroundMusicChange,

    removeSingleMedia:
      weddingMedia
        .removeSingleMedia,

    removeCoverImage:
      weddingMedia
        .removeCoverImage,

    removeCoupleImage:
      weddingMedia
        .removeCoupleImage,

    removeBackgroundMusic:
      weddingMedia
        .removeBackgroundMusic,

    handleGalleryChange:
      weddingMedia
        .handleGalleryChange,

    removeGalleryImage:
      weddingMedia
        .removeGalleryImage,

    moveGalleryImage:
      weddingMedia
        .moveGalleryImage,

    moveGalleryImageUp:
      weddingMedia
        .moveGalleryImageUp,

    moveGalleryImageDown:
      weddingMedia
        .moveGalleryImageDown,

    clearGallery:
      weddingMedia
        .clearGallery,

    clearMedia:
      weddingMedia
        .clearMedia,

    /*
     * Eventos
     */

    events:
      weddingEvents.events,

    setEvents:
      weddingEvents.setEvents,

    generatedWedding:
      weddingEvents
        .generatedWedding,

    setGeneratedWedding:
      weddingEvents
        .setGeneratedWedding,

    generatedUrl:
      weddingEvents
        .generatedUrl,

    loading:
      submitting ||
      weddingEvents.loading,

    submitting,

    loadingEvents:
      weddingEvents
        .loadingEvents,

    deletingEventId:
      weddingEvents
        .deletingEventId,

    loadEvents:
      weddingEvents.loadEvents,

    createEvent:
      weddingEvents.createEvent,

    removeEvent:
      weddingEvents.removeEvent,

    getWeddingUrl:
      weddingEvents
        .getWeddingUrl,

    copyWeddingUrl:
      weddingEvents
        .copyWeddingUrl,

    copyGeneratedUrl:
      weddingEvents
        .copyGeneratedUrl,

    formatDate:
      weddingEvents
        .formatEventDate,

    findEventById:
      weddingEvents
        .findEventById,

    findEventBySlug:
      weddingEvents
        .findEventBySlug,

    /*
     * Ajustes
     */

    settings:
      adminSettings.settings,

    setSettings:
      adminSettings.setSettings,

    businessName:
      adminSettings.businessName,

    sidebarSubtitle:
      adminSettings
        .sidebarSubtitle,

    defaultMessage:
      adminSettings
        .defaultMessage,

    defaultGuestBookTitle:
      adminSettings
        .defaultGuestBookTitle,

    defaultThemeMode:
      adminSettings
        .defaultThemeMode,

    allowThemeToggle:
      adminSettings
        .allowThemeToggle,

    confirmBeforeDelete:
      adminSettings
        .confirmBeforeDelete,

    confirmBeforeReset:
      adminSettings
        .confirmBeforeReset,

    openCreatedInvitation:
      adminSettings
        .openCreatedInvitation,

    compactSidebar:
      adminSettings
        .compactSidebar,

    lastSavedAt:
      adminSettings
        .lastSavedAt,

    hasUnsavedChanges:
      adminSettings
        .hasUnsavedChanges,

    updateSetting:
      adminSettings
        .updateSetting,

    getSetting:
      adminSettings
        .getSetting,

    handleSettingChange:
      adminSettings
        .handleSettingChange,

    handleBusinessNameChange:
      adminSettings
        .handleBusinessNameChange,

    handleSidebarSubtitleChange:
      adminSettings
        .handleSidebarSubtitleChange,

    handleDefaultMessageChange:
      adminSettings
        .handleDefaultMessageChange,

    handleDefaultGuestBookTitleChange:
      adminSettings
        .handleDefaultGuestBookTitleChange,

    saveSettings:
      adminSettings
        .saveSettings,

    resetSettings:
      adminSettings
        .resetSettings,

    reloadSettings:
      adminSettings
        .reloadSettings,

    /*
     * Acciones principales
     */

    applyDefaultMessage,

    handleSubmit,
    handleDelete,
    handleSaveSettings,

    resetBuilder,
    clearBuilderAfterCreation,

    /*
     * Resumen
     */

    previewDate,
    builderSummary
  };
}