import {
  useCallback,
  useMemo,
  useRef,
  useState
} from 'react';

import {
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

export default function useWeddingBuilder() {
  const initialSettingsRef = useRef(
    getInitialAdminSettings()
  );

  const submittingRef = useRef(false);

  const [
    activeSection,
    setActiveSection
  ] = useState('create');

  const [
    formTab,
    setFormTab
  ] = useState('general');

  const [
    error,
    setError
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage
  ] = useState('');

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const weddingForm = useWeddingForm(
    initialSettingsRef.current.defaultMessage
  );

  const handleDefaultMessageSaved =
    useCallback(
      (defaultMessage) => {
        weddingForm.setFormData(
          (currentForm) => ({
            ...currentForm,

            welcomeMessage:
              currentForm.welcomeMessage ||
              defaultMessage
          })
        );
      },
      [weddingForm.setFormData]
    );

  const adminSettings =
    useAdminSettings({
      setError,
      setSuccessMessage,
      onDefaultMessageSaved:
        handleDefaultMessageSaved
    });

  const itinerary =
    useItinerary({
      formData:
        weddingForm.formData,

      setFormData:
        weddingForm.setFormData
    });

  const weddingMedia =
    useWeddingMedia({
      setError,
      setSuccessMessage
    });

  const weddingEvents =
    useWeddingEvents({
      setError,
      setSuccessMessage,
      autoLoad: true
    });

  const previewDate =
    useMemo(() => {
      return formatPreviewDate(
        weddingForm.formData.eventDate
      );
    }, [
      weddingForm.formData.eventDate
    ]);

  const builderSummary =
    useMemo(() => {
      return {
        activeSections:
          weddingForm.activeSectionsCount,

        itineraryActivities:
          itinerary.completedActivitiesCount,

        selectedMedia:
          weddingMedia.selectedMediaCount,

        galleryImages:
          weddingMedia.galleryCount
      };
    }, [
      weddingForm.activeSectionsCount,
      itinerary.completedActivitiesCount,
      weddingMedia.selectedMediaCount,
      weddingMedia.galleryCount
    ]);

  function clearMessages() {
    setError('');
    setSuccessMessage('');
  }

  function changeSection(section) {
    const allowedSections = [
      'create',
      'events',
      'settings'
    ];

    if (
      !allowedSections.includes(section)
    ) {
      return;
    }

    setActiveSection(section);
    clearMessages();

    if (section === 'events') {
      void weddingEvents.loadEvents();
    }
  }

  function changeFormTab(tabName) {
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
      !allowedTabs.includes(tabName)
    ) {
      return;
    }

    setFormTab(tabName);
    setError('');
  }

  function resetBuilder() {
    if (submittingRef.current) {
      return;
    }

    weddingForm.resetForm(
      adminSettings.defaultMessage
    );

    weddingMedia.clearMedia();

    weddingEvents.clearGeneratedWedding();

    setFormTab('general');
    setError('');
    setSuccessMessage('');
  }

  function clearBuilderAfterCreation() {
    weddingForm.resetForm(
      adminSettings.defaultMessage
    );

    weddingMedia.clearMedia();

    /*
     * IMPORTANTE:
     *
     * NO limpiamos generatedWedding aquí.
     * Necesitamos conservarlo para mostrar
     * CreatedWeddingCard con el enlace recién
     * generado.
     */

    setFormTab('general');
  }

  async function handleSubmit(event) {
    event?.preventDefault();

    /*
     * Evita doble envío.
     *
     * El ref cambia inmediatamente, mientras
     * que el estado de React puede tardar un
     * render en actualizarse.
     */
    if (
      submittingRef.current ||
      weddingEvents.loading
    ) {
      return null;
    }

    clearMessages();

    const validation =
      validateWeddingForm({
        formData:
          weddingForm.formData,

        media:
          weddingMedia.media
      });

    if (!validation.valid) {
      setError(
        validation.message ||
          'Revisa los campos del formulario.'
      );

      if (validation.tab) {
        setFormTab(
          validation.tab
        );
      }

      /*
       * Esperamos un momento cuando se cambia
       * de pestaña para que React alcance a
       * renderizar el campo inválido.
       */
      if (validation.field) {
        window.setTimeout(() => {
          focusInvalidField(
            validation.field
          );
        }, 100);
      }

      return null;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      /*
       * PASO 1
       * SUBIR ARCHIVOS REALES
       *
       * Solo hacemos POST /api/uploads si
       * realmente existe al menos un archivo
       * seleccionado.
       */
      let uploadedMedia = {};

      if (
        weddingMedia.selectedMediaCount >
        0
      ) {
        setSuccessMessage(
          'Subiendo fotografías y música...'
        );

        uploadedMedia =
          await uploadWeddingMedia(
            weddingMedia.media
          );

        /*
         * uploadWeddingMedia() ya devuelve:
         *
         * {
         *   coverImage,
         *   coupleImage,
         *   backgroundMusic,
         *   gallery
         * }
         *
         * NO usamos:
         *
         * uploadResponse.media
         */
        if (
          !uploadedMedia ||
          typeof uploadedMedia !==
            'object'
        ) {
          throw new Error(
            'El servidor no devolvió correctamente los archivos subidos.'
          );
        }
      }

      /*
       * PASO 2
       * CREAR PAYLOAD
       *
       * Aquí las imágenes y música ya son URLs
       * del servidor y no File, blob: ni
       * C:\\fakepath.
       */
      const payload =
        createWeddingPayload({
          formData:
            weddingForm.formData,

          uploadedMedia
        });

      if (
        !payload ||
        typeof payload !== 'object'
      ) {
        throw new Error(
          'No fue posible preparar la información de la invitación.'
        );
      }

      /*
       * PASO 3
       * GUARDAR BODA EN MONGODB
       */
      setSuccessMessage(
        'Guardando invitación...'
      );

      const createdWedding =
        await weddingEvents.createEvent(
          payload
        );

      if (!createdWedding) {
        /*
         * createEvent ya coloca el error
         * correspondiente cuando falla.
         */
        return null;
      }

      /*
       * PASO 4
       * VALIDAR QUE EL BACKEND HAYA DEVUELTO
       * EL SLUG PÚBLICO.
       */
      if (!createdWedding.slug) {
        throw new Error(
          'La invitación fue creada, pero el servidor no devolvió el enlace público.'
        );
      }

      /*
       * PASO 5
       * LIMPIAR EL FORMULARIO.
       *
       * generatedWedding se conserva para que
       * CreatedWeddingCard pueda mostrar:
       *
       * /boda/:slug
       */
      clearBuilderAfterCreation();

      setSuccessMessage(
        'La invitación fue creada correctamente.'
      );

      /*
       * Subimos al inicio de la página para que
       * se vea inmediatamente la tarjeta con el
       * enlace generado.
       */
      if (
        typeof window !== 'undefined'
      ) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }

      return createdWedding;
    } catch (submitError) {
      console.error(
        'Error creando invitación:',
        submitError
      );

      setSuccessMessage('');

      setError(
        submitError?.message ||
          'No fue posible crear la invitación.'
      );

      return null;
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  async function handleDelete(eventId) {
    return weddingEvents.removeEvent(
      eventId
    );
  }

  function handleSaveSettings(event) {
    return adminSettings.saveSettings(
      event
    );
  }

  function applyDefaultMessage() {
    weddingForm.updateFormField(
      'welcomeMessage',
      adminSettings.defaultMessage
    );

    setError('');

    setSuccessMessage(
      'El mensaje predeterminado fue aplicado.'
    );
  }

  function openPreview() {
    setFormTab('preview');
    setError('');

    if (
      typeof window !== 'undefined'
    ) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  function goToGeneralInformation() {
    setFormTab('general');
    setError('');
  }

  return {
    activeSection,
    setActiveSection,
    changeSection,

    formTab,
    setFormTab,
    changeFormTab,
    openPreview,
    goToGeneralInformation,

    error,
    setError,

    successMessage,
    setSuccessMessage,

    clearMessages,

    formData:
      weddingForm.formData,

    setFormData:
      weddingForm.setFormData,

    activeSectionsCount:
      weddingForm.activeSectionsCount,

    coupleNames:
      weddingForm.coupleNames,

    handleChange:
      weddingForm.handleChange,

    handleNumberChange:
      weddingForm.handleNumberChange,

    handleThemeChange:
      weddingForm.handleThemeChange,

    handleSectionToggle:
      weddingForm.handleSectionToggle,

    setSectionEnabled:
      weddingForm.setSectionEnabled,

    activateAllSections:
      weddingForm.activateAllSections,

    deactivateAllSections:
      weddingForm.deactivateAllSections,

    updateFormField:
      weddingForm.updateFormField,

    updateNestedField:
      weddingForm.updateNestedField,

    loadFormData:
      weddingForm.loadFormData,

    itinerary:
      itinerary.itinerary,

    completedActivitiesCount:
      itinerary.completedActivitiesCount,

    hasValidActivity:
      itinerary.hasValidActivity,

    handleItineraryChange:
      itinerary.handleItineraryChange,

    addItineraryItem:
      itinerary.addItineraryItem,

    removeItineraryItem:
      itinerary.removeItineraryItem,

    duplicateItineraryItem:
      itinerary.duplicateItineraryItem,

    moveItineraryItem:
      itinerary.moveItineraryItem,

    moveItineraryItemUp:
      itinerary.moveItineraryItemUp,

    moveItineraryItemDown:
      itinerary.moveItineraryItemDown,

    sortItineraryByTime:
      itinerary.sortItineraryByTime,

    clearItinerary:
      itinerary.clearItinerary,

    replaceItinerary:
      itinerary.replaceItinerary,

    getCleanItinerary:
      itinerary.getCleanItinerary,

    media:
      weddingMedia.media,

    setMedia:
      weddingMedia.setMedia,

    galleryCount:
      weddingMedia.galleryCount,

    selectedMediaCount:
      weddingMedia.selectedMediaCount,

    hasCoverImage:
      weddingMedia.hasCoverImage,

    hasCoupleImage:
      weddingMedia.hasCoupleImage,

    hasBackgroundMusic:
      weddingMedia.hasBackgroundMusic,

    hasGalleryImages:
      weddingMedia.hasGalleryImages,

    mediaFileNames:
      weddingMedia.mediaFileNames,

    handleSingleMediaChange:
      weddingMedia.handleSingleMediaChange,

    handleCoverImageChange:
      weddingMedia.handleCoverImageChange,

    handleCoupleImageChange:
      weddingMedia.handleCoupleImageChange,

    handleBackgroundMusicChange:
      weddingMedia.handleBackgroundMusicChange,

    removeSingleMedia:
      weddingMedia.removeSingleMedia,

    removeCoverImage:
      weddingMedia.removeCoverImage,

    removeCoupleImage:
      weddingMedia.removeCoupleImage,

    removeBackgroundMusic:
      weddingMedia.removeBackgroundMusic,

    handleGalleryChange:
      weddingMedia.handleGalleryChange,

    removeGalleryImage:
      weddingMedia.removeGalleryImage,

    moveGalleryImage:
      weddingMedia.moveGalleryImage,

    moveGalleryImageUp:
      weddingMedia.moveGalleryImageUp,

    moveGalleryImageDown:
      weddingMedia.moveGalleryImageDown,

    clearGallery:
      weddingMedia.clearGallery,

    clearMedia:
      weddingMedia.clearMedia,

    events:
      weddingEvents.events,

    setEvents:
      weddingEvents.setEvents,

    generatedWedding:
      weddingEvents.generatedWedding,

    setGeneratedWedding:
      weddingEvents.setGeneratedWedding,

    generatedUrl:
      weddingEvents.generatedUrl,

    /*
     * El administrador se considera cargando
     * durante TODO el proceso:
     *
     * subida de archivos
     * +
     * creación de boda.
     */
    loading:
      submitting ||
      weddingEvents.loading,

    submitting,

    loadingEvents:
      weddingEvents.loadingEvents,

    deletingEventId:
      weddingEvents.deletingEventId,

    loadEvents:
      weddingEvents.loadEvents,

    createEvent:
      weddingEvents.createEvent,

    removeEvent:
      weddingEvents.removeEvent,

    getWeddingUrl:
      weddingEvents.getWeddingUrl,

    copyWeddingUrl:
      weddingEvents.copyWeddingUrl,

    copyGeneratedUrl:
      weddingEvents.copyGeneratedUrl,

    formatDate:
      weddingEvents.formatEventDate,

    findEventById:
      weddingEvents.findEventById,

    findEventBySlug:
      weddingEvents.findEventBySlug,

    settings:
      adminSettings.settings,

    setSettings:
      adminSettings.setSettings,

    businessName:
      adminSettings.businessName,

    defaultMessage:
      adminSettings.defaultMessage,

    hasUnsavedChanges:
      adminSettings.hasUnsavedChanges,

    updateSetting:
      adminSettings.updateSetting,

    handleSettingChange:
      adminSettings.handleSettingChange,

    handleBusinessNameChange:
      adminSettings.handleBusinessNameChange,

    handleDefaultMessageChange:
      adminSettings.handleDefaultMessageChange,

    saveSettings:
      adminSettings.saveSettings,

    resetSettings:
      adminSettings.resetSettings,

    reloadSettings:
      adminSettings.reloadSettings,

    applyDefaultMessage,

    handleSubmit,
    handleDelete,
    handleSaveSettings,

    resetBuilder,
    clearBuilderAfterCreation,

    previewDate,
    builderSummary
  };
}