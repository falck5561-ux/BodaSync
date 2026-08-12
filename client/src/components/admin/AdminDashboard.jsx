import React from 'react';

import './AdminDashboard.css';

import AlertMessage from './components/AlertMessage';
import DashboardSidebar from './components/DashboardSidebar';

import useWeddingBuilder from './hooks/useWeddingBuilder';

import CreateWeddingSection from './sections/CreateWeddingSection';
import EventsSection from './sections/EventsSection';
import SettingsSection from './sections/SettingsSection';

export default function AdminDashboard() {
  const {
    /*
     * =====================================================
     * NAVEGACIÓN
     * =====================================================
     */

    activeSection,
    changeSection,

    formTab,
    changeFormTab,

    /*
     * =====================================================
     * MODO EDICIÓN
     * =====================================================
     */

    isEditing,
    editingWedding,
    editingWeddingId,
    editingWeddingSlug,

    startEditingWedding,
    cancelEditing,

    /*
     * =====================================================
     * BORRADOR / AUTOGUARDADO
     * =====================================================
     */

    hasRecoverableDraft,
    hasLocalDraft,
    recoverableDraft,
    draftSavedAt,
    draftStatus,
    draftHasUnrestorableFiles,

    restoreDraft,
    discardDraft,
    flushDraftNow,

    /*
     * =====================================================
     * ALERTAS
     * =====================================================
     */

    error,
    setError,

    successMessage,
    setSuccessMessage,

    /*
     * =====================================================
     * FORMULARIO
     * =====================================================
     */

    formData,
    handleChange,
    handleThemeChange,
    handleSectionToggle,

    activeSectionsCount,
    activateAllSections,
    deactivateAllSections,

    /*
     * =====================================================
     * ITINERARIO
     * =====================================================
     */

    itinerary,
    completedActivitiesCount,
    hasValidActivity,

    handleItineraryChange,
    addItineraryItem,
    removeItineraryItem,
    duplicateItineraryItem,
    moveItineraryItemUp,
    moveItineraryItemDown,
    sortItineraryByTime,
    clearItinerary,

    /*
     * =====================================================
     * MULTIMEDIA
     * =====================================================
     */

    media,
    galleryCount,
    selectedMediaCount,

    handleCoverImageChange,
    handleCoupleImageChange,
    handleBackgroundMusicChange,
    handleGalleryChange,

    removeCoverImage,
    removeCoupleImage,
    removeBackgroundMusic,
    removeGalleryImage,

    moveGalleryImageUp,
    moveGalleryImageDown,

    clearGallery,
    clearMedia,

    /*
     * =====================================================
     * EVENTOS
     * =====================================================
     */

    events,

    generatedWedding,
    setGeneratedWedding,
    generatedUrl,

    loading,
    loadingEvents,
    deletingEventId,

    loadEvents,
    handleDelete,

    copyWeddingUrl,
    copyGeneratedUrl,

    getWeddingUrl,
    formatDate,

    /*
     * =====================================================
     * AJUSTES
     * =====================================================
     */

    settings,

    businessName,
    sidebarSubtitle,
    defaultMessage,

    adminThemeMode,
    defaultThemeMode,
    allowThemeToggle,

    confirmBeforeReset,
    compactSidebar,

    lastSavedAt,
    hasUnsavedChanges,

    updateSetting,
    handleSettingChange,
    handleBusinessNameChange,
    handleDefaultMessageChange,

    handleSaveSettings,
    resetSettings,
    reloadSettings,

    /*
     * =====================================================
     * ACCIONES
     * =====================================================
     */

    applyDefaultMessage,

    previewDate,
    builderSummary,

    handleSubmit,
    resetBuilder,
    goToGeneralInformation
  } = useWeddingBuilder();

  /*
   * =========================================================
   * AJUSTES RESUELTOS
   * =========================================================
   */

  const resolvedAdminThemeMode =
    settings?.adminThemeMode === 'dark'
      ? 'dark'
      : settings?.adminThemeMode === 'light'
        ? 'light'
        : adminThemeMode === 'dark'
          ? 'dark'
          : 'light';

  const resolvedDefaultThemeMode =
    settings?.defaultThemeMode === 'dark'
      ? 'dark'
      : settings?.defaultThemeMode === 'light'
        ? 'light'
        : defaultThemeMode === 'dark'
          ? 'dark'
          : 'light';

  const resolvedAllowThemeToggle =
    typeof settings?.allowThemeToggle === 'boolean'
      ? settings.allowThemeToggle
      : allowThemeToggle !== false;

  const resolvedConfirmBeforeReset =
    typeof settings?.confirmBeforeReset === 'boolean'
      ? settings.confirmBeforeReset
      : confirmBeforeReset !== false;

  const resolvedCompactSidebar =
    typeof settings?.compactSidebar === 'boolean'
      ? settings.compactSidebar
      : Boolean(compactSidebar);

  const resolvedBusinessName =
    typeof settings?.businessName === 'string' &&
    settings.businessName.trim()
      ? settings.businessName.trim()
      : businessName || 'BodaSync';

  const resolvedSidebarSubtitle =
    typeof settings?.sidebarSubtitle === 'string' &&
    settings.sidebarSubtitle.trim()
      ? settings.sidebarSubtitle.trim()
      : sidebarSubtitle || 'Gestión de invitaciones';

  const resolvedDefaultMessage =
    typeof settings?.defaultMessage === 'string'
      ? settings.defaultMessage
      : defaultMessage || '';

  /*
   * =========================================================
   * CREAR INVITACIÓN NUEVA
   * =========================================================
   */

  function handleCreateNew() {
    /*
     * Si actualmente estamos editando una boda publicada,
     * limpiamos ese modo antes de comenzar otra.
     *
     * Si únicamente existe un borrador recuperable,
     * NO lo eliminamos aquí. El constructor mostrará
     * las opciones:
     *
     * - Continuar borrador
     * - Descartar
     */

    if (isEditing) {
      resetBuilder({
        force: true
      });
    }

    changeSection('create');
    changeFormTab('general');
  }

  /*
   * =========================================================
   * EDITAR INVITACIÓN
   * =========================================================
   */

  function handleEditWedding(wedding) {
    const started =
      startEditingWedding?.(
        wedding
      );

    if (!started) {
      return;
    }

    changeSection('create');
  }

  /*
   * =========================================================
   * CANCELAR EDICIÓN
   * =========================================================
   */

  function handleCancelEditing() {
    const cancelled =
      cancelEditing?.();

    if (!cancelled) {
      return;
    }

    changeSection('create');
    changeFormTab('general');
  }

  /*
   * =========================================================
   * RECUPERAR BORRADOR
   * =========================================================
   */

  function handleRestoreDraft() {
    const restored =
      restoreDraft?.();

    if (!restored) {
      return;
    }

    changeSection('create');
  }

  /*
   * =========================================================
   * DESCARTAR BORRADOR
   * =========================================================
   */

  function handleDiscardDraft() {
    discardDraft?.();
  }

  /*
   * =========================================================
   * GUARDAR BORRADOR MANUALMENTE
   * =========================================================
   *
   * El autosave ya funciona automáticamente.
   *
   * Esta función queda disponible por si después queremos
   * añadir un botón "Guardar ahora".
   */

  function handleSaveDraftNow() {
    flushDraftNow?.();
  }

  /*
   * =========================================================
   * SECCIÓN ACTIVA
   * =========================================================
   */

  function renderActiveSection() {
    switch (activeSection) {
      /*
       * =====================================================
       * MIS EVENTOS
       * =====================================================
       */

      case 'events':
        return (
          <EventsSection
            events={events}
            loadingEvents={loadingEvents}
            deletingEventId={deletingEventId}
            loadEvents={loadEvents}
            handleDelete={handleDelete}
            copyWeddingUrl={copyWeddingUrl}
            getWeddingUrl={getWeddingUrl}
            formatDate={formatDate}
            onCreateNew={handleCreateNew}
            onEditWedding={handleEditWedding}
          />
        );

      /*
       * =====================================================
       * AJUSTES
       * =====================================================
       */

      case 'settings':
        return (
          <SettingsSection
            settings={settings}
            businessName={resolvedBusinessName}
            defaultMessage={resolvedDefaultMessage}
            adminThemeMode={resolvedAdminThemeMode}
            defaultThemeMode={resolvedDefaultThemeMode}
            allowThemeToggle={resolvedAllowThemeToggle}
            lastSavedAt={lastSavedAt}
            hasUnsavedChanges={hasUnsavedChanges}
            updateSetting={updateSetting}
            handleSettingChange={handleSettingChange}
            handleBusinessNameChange={
              handleBusinessNameChange
            }
            handleDefaultMessageChange={
              handleDefaultMessageChange
            }
            handleSaveSettings={handleSaveSettings}
            resetSettings={resetSettings}
            reloadSettings={reloadSettings}
          />
        );

      /*
       * =====================================================
       * CREAR / EDITAR INVITACIÓN
       * =====================================================
       */

      case 'create':
      default:
        return (
          <CreateWeddingSection
            /*
             * ===============================================
             * MODO EDICIÓN
             * ===============================================
             */

            isEditing={isEditing}
            editingWedding={editingWedding}
            editingWeddingId={editingWeddingId}
            editingWeddingSlug={editingWeddingSlug}
            cancelEditing={handleCancelEditing}

            /*
             * ===============================================
             * BORRADOR / AUTOGUARDADO
             * ===============================================
             */

            hasRecoverableDraft={
              hasRecoverableDraft
            }
            hasLocalDraft={
              hasLocalDraft
            }
            recoverableDraft={
              recoverableDraft
            }
            draftSavedAt={
              draftSavedAt
            }
            draftStatus={
              draftStatus
            }
            draftHasUnrestorableFiles={
              draftHasUnrestorableFiles
            }
            restoreDraft={
              handleRestoreDraft
            }
            discardDraft={
              handleDiscardDraft
            }
            flushDraftNow={
              handleSaveDraftNow
            }

            /*
             * ===============================================
             * NAVEGACIÓN
             * ===============================================
             */

            formTab={formTab}
            changeFormTab={changeFormTab}

            /*
             * ===============================================
             * FORMULARIO
             * ===============================================
             */

            formData={formData}
            handleChange={handleChange}
            handleThemeChange={handleThemeChange}
            handleSectionToggle={handleSectionToggle}

            activeSectionsCount={
              activeSectionsCount
            }
            activateAllSections={
              activateAllSections
            }
            deactivateAllSections={
              deactivateAllSections
            }

            /*
             * ===============================================
             * ITINERARIO
             * ===============================================
             */

            itinerary={itinerary}
            completedActivitiesCount={
              completedActivitiesCount
            }
            hasValidActivity={
              hasValidActivity
            }
            handleItineraryChange={
              handleItineraryChange
            }
            addItineraryItem={
              addItineraryItem
            }
            removeItineraryItem={
              removeItineraryItem
            }
            duplicateItineraryItem={
              duplicateItineraryItem
            }
            moveItineraryItemUp={
              moveItineraryItemUp
            }
            moveItineraryItemDown={
              moveItineraryItemDown
            }
            sortItineraryByTime={
              sortItineraryByTime
            }
            clearItinerary={
              clearItinerary
            }

            /*
             * ===============================================
             * MULTIMEDIA
             * ===============================================
             */

            media={media}
            galleryCount={galleryCount}
            selectedMediaCount={
              selectedMediaCount
            }
            handleCoverImageChange={
              handleCoverImageChange
            }
            handleCoupleImageChange={
              handleCoupleImageChange
            }
            handleBackgroundMusicChange={
              handleBackgroundMusicChange
            }
            handleGalleryChange={
              handleGalleryChange
            }
            removeCoverImage={
              removeCoverImage
            }
            removeCoupleImage={
              removeCoupleImage
            }
            removeBackgroundMusic={
              removeBackgroundMusic
            }
            removeGalleryImage={
              removeGalleryImage
            }
            moveGalleryImageUp={
              moveGalleryImageUp
            }
            moveGalleryImageDown={
              moveGalleryImageDown
            }
            clearGallery={
              clearGallery
            }
            clearMedia={
              clearMedia
            }

            /*
             * ===============================================
             * INVITACIÓN GUARDADA
             * ===============================================
             */

            generatedWedding={
              generatedWedding
            }
            generatedUrl={
              generatedUrl
            }
            copyGeneratedUrl={
              copyGeneratedUrl
            }
            setGeneratedWedding={
              setGeneratedWedding
            }

            /*
             * ===============================================
             * VISTA PREVIA
             * ===============================================
             */

            previewDate={
              previewDate
            }
            builderSummary={
              builderSummary
            }

            /*
             * ===============================================
             * NEGOCIO
             * ===============================================
             */

            businessName={
              resolvedBusinessName
            }
            applyDefaultMessage={
              applyDefaultMessage
            }

            /*
             * ===============================================
             * ACCIONES
             * ===============================================
             */

            loading={loading}
            confirmBeforeReset={
              resolvedConfirmBeforeReset
            }
            handleSubmit={
              handleSubmit
            }
            resetBuilder={
              resetBuilder
            }
            goToGeneralInformation={
              goToGeneralInformation
            }
          />
        );
    }
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      className="admin-dashboard"
      data-admin-theme={
        resolvedAdminThemeMode
      }
      data-builder-mode={
        isEditing
          ? 'editing'
          : 'creating'
      }
      data-draft-status={
        draftStatus || 'idle'
      }
      data-has-draft={
        hasLocalDraft
          ? 'true'
          : 'false'
      }
      style={{
        '--admin-sidebar-width':
          resolvedCompactSidebar
            ? '104px'
            : '248px'
      }}
    >
      <DashboardSidebar
        activeSection={
          activeSection
        }
        businessName={
          resolvedBusinessName
        }
        sidebarSubtitle={
          resolvedSidebarSubtitle
        }
        eventsCount={
          Array.isArray(events)
            ? events.length
            : 0
        }
        compactSidebar={
          resolvedCompactSidebar
        }
        hasUnsavedChanges={
          hasUnsavedChanges
        }
        onSectionChange={
          changeSection
        }
      />

      <main className="dashboard-main">
        <div
          className="dashboard-alerts"
          aria-label="Notificaciones del administrador"
        >
          <AlertMessage
            type="error"
            message={error}
            duration={5500}
            onClose={() => {
              setError('');
            }}
          />

          <AlertMessage
            type="success"
            message={
              successMessage
            }
            duration={3800}
            onClose={() => {
              setSuccessMessage('');
            }}
          />
        </div>

        <div className="dashboard-content">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
}