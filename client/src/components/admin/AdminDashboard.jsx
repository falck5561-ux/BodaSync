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
    activeSection,
    changeSection,

    formTab,
    changeFormTab,

    error,
    setError,
    successMessage,
    setSuccessMessage,

    formData,
    handleChange,
    handleThemeChange,
    handleSectionToggle,

    activeSectionsCount,
    activateAllSections,
    deactivateAllSections,

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

    applyDefaultMessage,

    previewDate,
    builderSummary,

    handleSubmit,
    resetBuilder,
    goToGeneralInformation
  } = useWeddingBuilder();

  /*
   * ========================================================
   * AJUSTES RESUELTOS
   * ========================================================
   *
   * La fuente principal es "settings".
   *
   * Los valores individuales solamente funcionan como
   * respaldo por compatibilidad.
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
   * ========================================================
   * SECCIÓN ACTIVA
   * ========================================================
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
            onCreateNew={() => {
              changeSection('create');
            }}
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
            handleBusinessNameChange={handleBusinessNameChange}
            handleDefaultMessageChange={handleDefaultMessageChange}
            handleSaveSettings={handleSaveSettings}
            resetSettings={resetSettings}
            reloadSettings={reloadSettings}
          />
        );

      /*
       * =====================================================
       * CREAR INVITACIÓN
       * =====================================================
       */

      case 'create':
      default:
        return (
          <CreateWeddingSection
            formTab={formTab}
            changeFormTab={changeFormTab}
            formData={formData}
            handleChange={handleChange}
            handleThemeChange={handleThemeChange}
            handleSectionToggle={handleSectionToggle}
            activeSectionsCount={activeSectionsCount}
            activateAllSections={activateAllSections}
            deactivateAllSections={deactivateAllSections}
            itinerary={itinerary}
            completedActivitiesCount={completedActivitiesCount}
            hasValidActivity={hasValidActivity}
            handleItineraryChange={handleItineraryChange}
            addItineraryItem={addItineraryItem}
            removeItineraryItem={removeItineraryItem}
            duplicateItineraryItem={duplicateItineraryItem}
            moveItineraryItemUp={moveItineraryItemUp}
            moveItineraryItemDown={moveItineraryItemDown}
            sortItineraryByTime={sortItineraryByTime}
            clearItinerary={clearItinerary}
            media={media}
            galleryCount={galleryCount}
            selectedMediaCount={selectedMediaCount}
            handleCoverImageChange={handleCoverImageChange}
            handleCoupleImageChange={handleCoupleImageChange}
            handleBackgroundMusicChange={handleBackgroundMusicChange}
            handleGalleryChange={handleGalleryChange}
            removeCoverImage={removeCoverImage}
            removeCoupleImage={removeCoupleImage}
            removeBackgroundMusic={removeBackgroundMusic}
            removeGalleryImage={removeGalleryImage}
            moveGalleryImageUp={moveGalleryImageUp}
            moveGalleryImageDown={moveGalleryImageDown}
            clearGallery={clearGallery}
            clearMedia={clearMedia}
            generatedWedding={generatedWedding}
            generatedUrl={generatedUrl}
            copyGeneratedUrl={copyGeneratedUrl}
            setGeneratedWedding={setGeneratedWedding}
            previewDate={previewDate}
            builderSummary={builderSummary}
            businessName={resolvedBusinessName}
            applyDefaultMessage={applyDefaultMessage}
            loading={loading}
            confirmBeforeReset={resolvedConfirmBeforeReset}
            handleSubmit={handleSubmit}
            resetBuilder={resetBuilder}
            goToGeneralInformation={goToGeneralInformation}
          />
        );
    }
  }

  /*
   * ========================================================
   * RENDER
   * ========================================================
   */

  return (
    <div
      className="admin-dashboard"
      data-admin-theme={resolvedAdminThemeMode}
      style={{
        '--admin-sidebar-width': resolvedCompactSidebar
          ? '104px'
          : '248px'
      }}
    >
      <DashboardSidebar
        activeSection={activeSection}
        businessName={resolvedBusinessName}
        sidebarSubtitle={resolvedSidebarSubtitle}
        eventsCount={
          Array.isArray(events)
            ? events.length
            : 0
        }
        compactSidebar={resolvedCompactSidebar}
        hasUnsavedChanges={hasUnsavedChanges}
        onSectionChange={changeSection}
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
            message={successMessage}
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