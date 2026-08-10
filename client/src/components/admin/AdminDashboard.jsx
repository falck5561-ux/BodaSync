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

    businessName,
    defaultMessage,
    hasUnsavedChanges,
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

  function renderActiveSection() {
    switch (activeSection) {
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
            onCreateNew={() => changeSection('create')}
          />
        );

      case 'settings':
        return (
          <SettingsSection
            businessName={businessName}
            defaultMessage={defaultMessage}
            hasUnsavedChanges={hasUnsavedChanges}
            handleBusinessNameChange={handleBusinessNameChange}
            handleDefaultMessageChange={handleDefaultMessageChange}
            handleSaveSettings={handleSaveSettings}
            resetSettings={resetSettings}
            reloadSettings={reloadSettings}
          />
        );

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
            businessName={businessName}
            applyDefaultMessage={applyDefaultMessage}
            loading={loading}
            handleSubmit={handleSubmit}
            resetBuilder={resetBuilder}
            goToGeneralInformation={goToGeneralInformation}
          />
        );
    }
  }

  return (
    <div className="admin-dashboard">
      <DashboardSidebar
        activeSection={activeSection}
        businessName={businessName}
        eventsCount={events.length}
        onSectionChange={changeSection}
      />

      <main className="dashboard-main">
        <div className="dashboard-alerts">
          <AlertMessage
            type="error"
            message={error}
            onClose={() => setError('')}
          />

          <AlertMessage
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        </div>

        <div className="dashboard-content">{renderActiveSection()}</div>
      </main>
    </div>
  );
}