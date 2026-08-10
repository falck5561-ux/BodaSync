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

function canUseWindow() {
  return typeof window !== 'undefined';
}

function buildPublicWeddingUrl(wedding) {
  if (
    !canUseWindow() ||
    !wedding?.slug
  ) {
    return '';
  }

  return `${window.location.origin}/boda/${encodeURIComponent(
    wedding.slug
  )}`;
}

export default function useWeddingBuilder() {
  /*
   * Tomamos los ajustes guardados antes de
   * crear el formulario inicial.
   */
  const initialSettingsRef = useRef(
    getInitialAdminSettings()
  );

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

  /*
   * Evita envíos dobles incluso si React todavía
   * no ha actualizado submitting.
   */
  const submittingRef =
    useRef(false);

  /*
   * =====================================================
   * FORMULARIO
   * =====================================================
   */
  const weddingForm =
    useWeddingForm(
      initialSettingsRef.current.defaultMessage
    );

  /*
   * Cuando se guarda un nuevo mensaje predeterminado,
   * solo lo aplicamos al formulario actual si todavía
   * no existe un mensaje.
   */
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
          weddingForm.formData
            .eventDate
        ),
      [
        weddingForm.formData
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
          weddingMedia.galleryCount
      }),
      [
        weddingForm
          .activeSectionsCount,

        itinerary
          .completedActivitiesCount,

        weddingMedia
          .selectedMediaCount,

        weddingMedia.galleryCount
      ]
    );

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

    setActiveSection(section);

    clearMessages();

    if (section === 'events') {
      weddingEvents.loadEvents();
    }
  }

  /*
   * =====================================================
   * PESTAÑAS DEL CONSTRUCTOR
   * =====================================================
   */
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
      !allowedTabs.includes(
        tabName
      )
    ) {
      return;
    }

    setFormTab(tabName);

    setError('');
  }

  /*
   * =====================================================
   * LIMPIAR CONSTRUCTOR
   * =====================================================
   *
   * Ahora respeta:
   *
   * settings.confirmBeforeReset
   */
  function resetBuilder(options = {}) {
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
          '¿Deseas limpiar la invitación actual? Los datos que no hayas guardado se perderán.'
        );

      if (!shouldReset) {
        return false;
      }
    }

    weddingForm.resetForm(
      adminSettings.defaultMessage
    );

    weddingMedia.clearMedia();

    weddingEvents
      .clearGeneratedWedding?.();

    setFormTab('general');

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
   *
   * Aquí NO pedimos confirmación.
   *
   * La boda ya fue guardada correctamente.
   */
  function clearBuilderAfterCreation() {
    weddingForm.resetForm(
      adminSettings.defaultMessage
    );

    weddingMedia.clearMedia();

    setFormTab('general');
  }

  /*
   * =====================================================
   * CREAR INVITACIÓN
   * =====================================================
   */
  async function handleSubmit(event) {
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
     * Validamos primero.
     *
     * No abrimos pestañas ni subimos archivos
     * si el formulario todavía contiene errores.
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

      if (validation.tab) {
        setFormTab(
          validation.tab
        );
      }

      /*
       * Esperamos a que React muestre
       * la pestaña correcta.
       */
      window.setTimeout(
        () => {
          focusInvalidField(
            validation.field
          );
        },
        80
      );

      return null;
    }

    /*
     * Si el administrador eligió:
     *
     * "Abrir automáticamente después de crear"
     *
     * abrimos la pestaña AHORA, antes del await.
     *
     * Esto reduce el riesgo de que el navegador
     * bloquee la pestaña como popup.
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

      if (invitationWindow) {
        invitationWindow.opener =
          null;
      }
    }

    try {
      submittingRef.current =
        true;

      setSubmitting(true);

      /*
       * ==============================================
       * 1. SUBIR ARCHIVOS REALES
       * ==============================================
       */
      const uploadResponse =
        await uploadWeddingMedia(
          weddingMedia.media
        );

      /*
       * ==============================================
       * 2. CREAR PAYLOAD
       * ==============================================
       */
      const payload =
        createWeddingPayload({
          formData:
            weddingForm.formData,

          uploadedMedia:
            uploadResponse?.media ||
            {}
        });

      /*
       * ==============================================
       * 3. GUARDAR EN MONGODB
       * ==============================================
       */
      const createdWedding =
        await weddingEvents
          .createEvent(
            payload
          );

      if (!createdWedding) {
        invitationWindow?.close();

        return null;
      }

      if (!createdWedding.slug) {
        invitationWindow?.close();

        throw new Error(
          'La invitación fue creada, pero el servidor no devolvió su enlace.'
        );
      }

      /*
       * ==============================================
       * 4. ABRIR INVITACIÓN SI ESTÁ CONFIGURADO
       * ==============================================
       */
      const createdUrl =
        buildPublicWeddingUrl(
          createdWedding
        );

      if (
        invitationWindow &&
        createdUrl
      ) {
        invitationWindow.location.href =
          createdUrl;
      }

      /*
       * ==============================================
       * 5. LIMPIAR CONSTRUCTOR
       * ==============================================
       */
      clearBuilderAfterCreation();

      setSuccessMessage(
        adminSettings
          .openCreatedInvitation
          ? 'La invitación fue creada correctamente y se abrió en una nueva pestaña.'
          : 'La invitación fue creada correctamente.'
      );

      if (canUseWindow()) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }

      return createdWedding;
    } catch (submitError) {
      invitationWindow?.close();

      setError(
        submitError?.message ||
          'No fue posible crear la invitación.'
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
   *
   * Ahora respeta:
   *
   * settings.confirmBeforeDelete
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
   * APLICAR MENSAJE PREDETERMINADO
   * =====================================================
   */
  function applyDefaultMessage() {
    weddingForm
      .updateFormField(
        'welcomeMessage',
        adminSettings.defaultMessage
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
    setFormTab('preview');

    setError('');

    if (canUseWindow()) {
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
      weddingMedia.clearGallery,

    clearMedia:
      weddingMedia.clearMedia,

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
      weddingEvents.generatedUrl,

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
     * =================================================
     * AJUSTES
     * =================================================
     *
     * Dejamos TODOS disponibles para que en el
     * siguiente paso podamos conectar el sidebar
     * y mejorar visualmente el admin.
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
      adminSettings.defaultMessage,

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
      adminSettings.lastSavedAt,

    hasUnsavedChanges:
      adminSettings
        .hasUnsavedChanges,

    updateSetting:
      adminSettings
        .updateSetting,

    getSetting:
      adminSettings.getSetting,

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
      adminSettings.saveSettings,

    resetSettings:
      adminSettings.resetSettings,

    reloadSettings:
      adminSettings.reloadSettings,

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