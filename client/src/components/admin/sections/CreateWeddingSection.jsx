import React, { useMemo } from 'react';

import CreatedWeddingCard from '../components/CreatedWeddingCard';

import {
  FORM_TABS
} from '../config/adminConfig';

import ContentTab from '../tabs/ContentTab';
import DesignTab from '../tabs/DesignTab';
import GeneralTab from '../tabs/GeneralTab';
import ItineraryTab from '../tabs/ItineraryTab';
import MediaTab from '../tabs/MediaTab';
import PreviewTab from '../tabs/PreviewTab';
import SectionsTab from '../tabs/SectionsTab';

function getTabKey(tab) {
  return tab?.key || tab?.id || '';
}

function getTabLabel(tab) {
  return (
    tab?.label ||
    tab?.title ||
    getTabKey(tab)
  );
}

function getTabDescription(tab) {
  return tab?.description || '';
}

function BuilderStatistic({
  label,
  value,
  description
}) {
  return (
    <article className="builder-statistic-card">
      <span>{label}</span>

      <strong>{value}</strong>

      {description && (
        <small>{description}</small>
      )}
    </article>
  );
}

export default function CreateWeddingSection({
  formTab = 'general',
  changeFormTab,

  formData,
  handleChange,
  handleThemeChange,
  handleSectionToggle,

  activeSectionsCount = 0,
  activateAllSections,
  deactivateAllSections,

  itinerary = [],
  completedActivitiesCount = 0,
  hasValidActivity = false,
  handleItineraryChange,
  addItineraryItem,
  removeItineraryItem,
  duplicateItineraryItem,
  moveItineraryItemUp,
  moveItineraryItemDown,
  sortItineraryByTime,
  clearItinerary,

  media,
  galleryCount = 0,
  selectedMediaCount = 0,
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

  generatedWedding,
  generatedUrl = '',
  copyGeneratedUrl,
  setGeneratedWedding,

  previewDate = '',
  builderSummary = {},

  businessName = 'BodaSync',
  applyDefaultMessage,

  loading = false,

  handleSubmit,
  resetBuilder,
  goToGeneralInformation
}) {
  const normalizedTabs = useMemo(() => {
    if (
      !Array.isArray(FORM_TABS) ||
      FORM_TABS.length === 0
    ) {
      return [
        {
          key: 'general',
          label: 'General'
        },
        {
          key: 'content',
          label: 'Contenido'
        },
        {
          key: 'sections',
          label: 'Secciones'
        },
        {
          key: 'itinerary',
          label: 'Itinerario'
        },
        {
          key: 'media',
          label: 'Multimedia'
        },
        {
          key: 'design',
          label: 'Diseño'
        },
        {
          key: 'preview',
          label: 'Vista previa'
        }
      ];
    }

    return FORM_TABS;
  }, []);

  const currentTabIndex = useMemo(() => {
    const index =
      normalizedTabs.findIndex(
        (tab) =>
          getTabKey(tab) === formTab
      );

    return index >= 0 ? index : 0;
  }, [
    normalizedTabs,
    formTab
  ]);

  const currentTab =
    normalizedTabs[currentTabIndex];

  const previousTab =
    currentTabIndex > 0
      ? normalizedTabs[
          currentTabIndex - 1
        ]
      : null;

  const nextTab =
    currentTabIndex <
    normalizedTabs.length - 1
      ? normalizedTabs[
          currentTabIndex + 1
        ]
      : null;

  const completionPercentage =
    normalizedTabs.length > 1
      ? Math.round(
          (currentTabIndex /
            (normalizedTabs.length - 1)) *
            100
        )
      : 100;

  const coupleTitle = useMemo(() => {
    const groomName =
      formData?.groomName?.trim();

    const brideName =
      formData?.brideName?.trim();

    if (groomName && brideName) {
      return `${groomName} y ${brideName}`;
    }

    if (groomName) {
      return groomName;
    }

    if (brideName) {
      return brideName;
    }

    return 'Nueva invitación';
  }, [
    formData?.groomName,
    formData?.brideName
  ]);

  function handleTabChange(tabKey) {
    if (
      typeof changeFormTab ===
      'function'
    ) {
      changeFormTab(tabKey);
    }
  }

  function handlePreviousTab() {
    if (!previousTab) {
      return;
    }

    handleTabChange(
      getTabKey(previousTab)
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function handleNextTab() {
    if (!nextTab) {
      return;
    }

    handleTabChange(
      getTabKey(nextTab)
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function handleResetBuilder() {
    if (
      typeof resetBuilder !==
      'function'
    ) {
      return;
    }

    const shouldReset =
      window.confirm(
        '¿Deseas borrar toda la información capturada en esta invitación?'
      );

    if (shouldReset) {
      resetBuilder();
    }
  }

  function closeCreatedWedding() {
    if (
      typeof setGeneratedWedding ===
      'function'
    ) {
      setGeneratedWedding(null);
    }
  }

  function renderActiveTab() {
    switch (formTab) {
      case 'content':
        return (
          <ContentTab
            formData={formData}
            handleChange={
              handleChange
            }
            onToggleSection={
              handleSectionToggle
            }
          />
        );

      case 'sections':
        return (
          <SectionsTab
            formData={formData}
            activeSectionsCount={
              activeSectionsCount
            }
            onToggleSection={
              handleSectionToggle
            }
            activateAllSections={
              activateAllSections
            }
            deactivateAllSections={
              deactivateAllSections
            }
          />
        );

      case 'itinerary':
        return (
          <ItineraryTab
            formData={formData}
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
            onToggleSection={
              handleSectionToggle
            }
          />
        );

      case 'media':
        return (
          <MediaTab
            formData={formData}
            media={media}
            galleryCount={
              galleryCount
            }
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
            clearMedia={clearMedia}
            onToggleSection={
              handleSectionToggle
            }
          />
        );

      case 'design':
        return (
          <DesignTab
            formData={formData}
            handleThemeChange={
              handleThemeChange
            }
          />
        );

      case 'preview':
        return (
          <PreviewTab
            formData={formData}
            media={media}
            itinerary={itinerary}
            previewDate={
              previewDate
            }
            builderSummary={
              builderSummary
            }
            loading={loading}
            onEdit={
              goToGeneralInformation
            }
            onCreateInvitation={
              handleSubmit
            }
          />
        );

      case 'general':
      default:
        return (
          <GeneralTab
            formData={formData}
            handleChange={
              handleChange
            }
            applyDefaultMessage={
              applyDefaultMessage
            }
            onToggleSection={
              handleSectionToggle
            }
          />
        );
    }
  }

  return (
    <section className="dashboard-section create-wedding-section">
      <div className="dashboard-page-header">
        <div>
          <span className="section-eyebrow">
            {businessName}
          </span>

          <h1>
            Constructor de invitaciones
          </h1>

          <p>
            Configura la información, el contenido,
            las fotografías y el diseño de cada boda.
          </p>
        </div>

        <div className="dashboard-page-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={
              handleResetBuilder
            }
            disabled={loading}
          >
            Limpiar formulario
          </button>
        </div>
      </div>

      {generatedWedding && (
        <CreatedWeddingCard
          wedding={
            generatedWedding
          }
          generatedUrl={
            generatedUrl
          }
          onCopyUrl={
            copyGeneratedUrl
          }
          onClose={
            closeCreatedWedding
          }
        />
      )}

      <div className="builder-overview">
        <div className="builder-overview-heading">
          <div>
            <span>
              Invitación actual
            </span>

            <strong>
              {coupleTitle}
            </strong>
          </div>

          <div className="builder-progress-label">
            <span>
              Paso {currentTabIndex + 1} de{' '}
              {normalizedTabs.length}
            </span>

            <strong>
              {completionPercentage}%
            </strong>
          </div>
        </div>

        <div
          className="builder-progress-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={
            completionPercentage
          }
          aria-label="Progreso del constructor"
        >
          <span
            style={{
              width: `${completionPercentage}%`
            }}
          />
        </div>

        <div className="builder-statistics-grid">
          <BuilderStatistic
            label="Secciones"
            value={
              activeSectionsCount
            }
            description="activas"
          />

          <BuilderStatistic
            label="Actividades"
            value={
              completedActivitiesCount
            }
            description="completas"
          />

          <BuilderStatistic
            label="Archivos"
            value={
              selectedMediaCount
            }
            description="seleccionados"
          />

          <BuilderStatistic
            label="Galería"
            value={galleryCount}
            description="fotografías"
          />
        </div>
      </div>

      <div className="wedding-builder">
        <nav
          className="builder-tabs"
          aria-label="Pasos para crear la invitación"
        >
          {normalizedTabs.map(
            (tab, index) => {
              const tabKey =
                getTabKey(tab);

              const isActive =
                tabKey === formTab;

              const isCompleted =
                index <
                currentTabIndex;

              return (
                <button
                  key={tabKey}
                  type="button"
                  className={`builder-tab-button ${
                    isActive
                      ? 'active'
                      : ''
                  } ${
                    isCompleted
                      ? 'completed'
                      : ''
                  }`}
                  onClick={() =>
                    handleTabChange(
                      tabKey
                    )
                  }
                  aria-current={
                    isActive
                      ? 'step'
                      : undefined
                  }
                >
                  <span className="builder-tab-number">
                    {isCompleted
                      ? '✓'
                      : index + 1}
                  </span>

                  <span className="builder-tab-information">
                    <strong>
                      {getTabLabel(
                        tab
                      )}
                    </strong>

                    {getTabDescription(
                      tab
                    ) && (
                      <small>
                        {getTabDescription(
                          tab
                        )}
                      </small>
                    )}
                  </span>
                </button>
              );
            }
          )}
        </nav>

        <form
          className="wedding-builder-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="builder-current-step">
            <span>
              Paso {currentTabIndex + 1}
            </span>

            <strong>
              {getTabLabel(
                currentTab
              )}
            </strong>
          </div>

          <div className="builder-tab-content">
            {renderActiveTab()}
          </div>

          {formTab !== 'preview' && (
            <div className="builder-navigation-footer">
              <div className="builder-navigation-left">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    handleResetBuilder
                  }
                  disabled={loading}
                >
                  Restablecer
                </button>
              </div>

              <div className="builder-navigation-right">
                {previousTab && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      handlePreviousTab
                    }
                    disabled={loading}
                  >
                    ← Anterior
                  </button>
                )}

                {nextTab && (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={
                      handleNextTab
                    }
                    disabled={loading}
                  >
                    {getTabKey(
                      nextTab
                    ) === 'preview'
                      ? 'Revisar invitación'
                      : 'Siguiente'}

                    <span aria-hidden="true">
                      →
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}