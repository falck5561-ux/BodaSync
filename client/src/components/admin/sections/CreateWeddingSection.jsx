import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import CreatedWeddingCard from '../components/CreatedWeddingCard';

import { FORM_TABS } from '../config/adminConfig';

import ContentTab from '../tabs/ContentTab';
import DesignTab from '../tabs/DesignTab';
import GeneralTab from '../tabs/GeneralTab';
import ItineraryTab from '../tabs/ItineraryTab';
import MediaTab from '../tabs/MediaTab';
import PreviewTab from '../tabs/PreviewTab';
import SectionsTab from '../tabs/SectionsTab';

const FALLBACK_TABS = [
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

const TAB_META = {
  general: {
    label: 'General',
    title: 'Información general',
    description: 'Pareja, fecha, bienvenida y ubicación.'
  },

  content: {
    label: 'Contenido',
    title: 'Contenido de la invitación',
    description: 'Familias, historia, vestimenta, regalos y textos.'
  },

  sections: {
    label: 'Secciones',
    title: 'Secciones de la invitación',
    description: 'Decide qué elementos estarán visibles para los invitados.'
  },

  itinerary: {
    label: 'Itinerario',
    title: 'Itinerario del evento',
    description: 'Organiza horarios, actividades y momentos importantes.'
  },

  media: {
    label: 'Multimedia',
    title: 'Fotografías y música',
    description: 'Portada, fotografía de pareja, galería y música.'
  },

  design: {
    label: 'Diseño',
    title: 'Diseño y apariencia',
    description: 'Define la paleta y personalidad visual de la invitación.'
  },

  preview: {
    label: 'Vista previa',
    title: 'Revisión final',
    description: 'Comprueba toda la invitación antes de publicarla.'
  }
};

function getTabKey(tab = {}) {
  return tab.key || tab.id || '';
}

function getTabLabel(tab = {}) {
  const key = getTabKey(tab);

  return TAB_META[key]?.label || tab.label || tab.title || key;
}

function StepIcon({ type }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  switch (type) {
    case 'content':
      return (
        <svg {...commonProps}>
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      );

    case 'sections':
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="6" height="6" rx="1.4" />
          <rect x="14" y="4" width="6" height="6" rx="1.4" />
          <rect x="4" y="14" width="6" height="6" rx="1.4" />
          <rect x="14" y="14" width="6" height="6" rx="1.4" />
        </svg>
      );

    case 'itinerary':
      return (
        <svg {...commonProps}>
          <circle cx="6" cy="6" r="1.3" />
          <circle cx="6" cy="12" r="1.3" />
          <circle cx="6" cy="18" r="1.3" />

          <path d="M10 6h8" />
          <path d="M10 12h8" />
          <path d="M10 18h8" />
        </svg>
      );

    case 'media':
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m5 18 5-5 3 3 2-2 4 4" />
        </svg>
      );

    case 'design':
      return (
        <svg {...commonProps}>
          <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 0-14Z" />

          <circle
            cx="7.5"
            cy="10"
            r=".8"
            fill="currentColor"
          />

          <circle
            cx="9.5"
            cy="6.8"
            r=".8"
            fill="currentColor"
          />

          <circle
            cx="14"
            cy="6.5"
            r=".8"
            fill="currentColor"
          />
        </svg>
      );

    case 'preview':
      return (
        <svg {...commonProps}>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case 'general':
    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 20c.8-4.2 3.2-6 7-6s6.2 1.8 7 6" />
        </svg>
      );
  }
}

function ArrowIcon({
  direction = 'right'
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === 'left' ? (
        <>
          <path d="M16 10H4" />
          <path d="m8 6-4 4 4 4" />
        </>
      ) : (
        <>
          <path d="M4 10h12" />
          <path d="m12 6 4 4-4 4" />
        </>
      )}
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4v6h6" />
      <path d="M5.5 15a7.5 7.5 0 1 0 .4-7.1L4 10" />
    </svg>
  );
}

function SummaryIcon({
  type
}) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.7',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  if (type === 'activities') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (type === 'media') {
    return (
      <svg {...commonProps}>
        <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
        <path d="m7 16 3-3 2 2 2-2 3 3" />
      </svg>
    );
  }

  if (type === 'gallery') {
    return (
      <svg {...commonProps}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="m7 16 4-4 3 3 3-3" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 2.8 20h18.4L12 3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 6 8 8" />
      <path d="m14 6-8 8" />
    </svg>
  );
}

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function ProgressRing({
  progress,
  currentStep,
  totalSteps
}) {
  const safeProgress = Math.max(
    0,
    Math.min(100, progress)
  );

  const progressAngle = `${safeProgress * 3.6}deg`;

  return (
    <div className="studio-progress-featured">
      <div
        className="studio-progress-ring"
        style={{
          '--studio-progress-angle': progressAngle
        }}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={safeProgress}
        aria-label={`${safeProgress}% del flujo completado`}
      >
        <div className="studio-progress-ring-core">
          <strong>
            {safeProgress}%
          </strong>

          <span>
            Progreso
          </span>
        </div>
      </div>

      <div className="studio-progress-information">
        <div className="studio-progress-information-header">
          <div>
            <span>
              Avance del flujo
            </span>

            <strong>
              Paso {currentStep} de {totalSteps}
            </strong>
          </div>

          <span className="studio-progress-status">
            {safeProgress === 100
              ? 'Completo'
              : 'En progreso'}
          </span>
        </div>

        <div className="studio-progress-track">
          <span
            className="studio-progress-value"
            style={{
              width: `${safeProgress}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  icon,
  value,
  label
}) {
  return (
    <div className="studio-summary-item">
      <span className="studio-summary-icon">
        <SummaryIcon type={icon} />
      </span>

      <div className="studio-summary-copy">
        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   MODAL DE CONFIRMACIÓN
   Reemplaza el window.confirm del navegador.
========================================================= */

function ResetConfirmationDialog({
  open,
  onCancel,
  onConfirm,
  loading = false
}) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    function handleKeyDown(event) {
      if (
        event.key === 'Escape' &&
        !loading
      ) {
        onCancel?.();
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    const focusTimeout =
      window.setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 40);

    return () => {
      window.clearTimeout(
        focusTimeout
      );

      document.removeEventListener(
        'keydown',
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    loading,
    onCancel,
    open
  ]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="admin-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !loading
        ) {
          onCancel?.();
        }
      }}
    >
      <section
        className="admin-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <button
          type="button"
          className="admin-confirm-close"
          onClick={onCancel}
          disabled={loading}
          aria-label="Cerrar confirmación"
        >
          <CloseIcon />
        </button>

        <div className="admin-confirm-icon">
          <WarningIcon />
        </div>

        <div className="admin-confirm-copy">
          <span className="admin-confirm-eyebrow">
            Confirmar acción
          </span>

          <h2 id="reset-dialog-title">
            ¿Limpiar esta invitación?
          </h2>

          <p id="reset-dialog-description">
            Se eliminará la información que todavía no hayas
            publicado, incluyendo textos, actividades y archivos
            seleccionados en el constructor.
          </p>
        </div>

        <div className="admin-confirm-note">
          <span
            className="admin-confirm-note-icon"
            aria-hidden="true"
          >
            i
          </span>

          <p>
            Las invitaciones que ya fueron publicadas no se
            eliminarán.
          </p>
        </div>

        <div className="admin-confirm-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="admin-confirm-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Mantener cambios
          </button>

          <button
            type="button"
            className="admin-confirm-accept"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="admin-confirm-spinner" />
                Limpiando...
              </>
            ) : (
              <>
                <ResetIcon />
                Sí, limpiar
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function CreateWeddingSection({
  formTab = 'general',
  changeFormTab,

  formData = {},
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

  media = {},
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
  confirmBeforeReset = true,

  handleSubmit,
  resetBuilder,
  goToGeneralInformation
}) {
  const [
    resetDialogOpen,
    setResetDialogOpen
  ] = useState(false);

  const tabs = useMemo(() => {
    if (
      Array.isArray(FORM_TABS) &&
      FORM_TABS.length > 0
    ) {
      return FORM_TABS;
    }

    return FALLBACK_TABS;
  }, []);

  const currentTabIndex =
    useMemo(() => {
      const index =
        tabs.findIndex(
          (tab) =>
            getTabKey(tab) ===
            formTab
        );

      return index >= 0
        ? index
        : 0;
    }, [
      formTab,
      tabs
    ]);

  const currentTab =
    tabs[currentTabIndex] ||
    tabs[0];

  const currentKey =
    getTabKey(currentTab);

  const currentMeta =
    TAB_META[currentKey] || {
      label:
        getTabLabel(currentTab),

      title:
        getTabLabel(currentTab),

      description: ''
    };

  const previousTab =
    currentTabIndex > 0
      ? tabs[currentTabIndex - 1]
      : null;

  const nextTab =
    currentTabIndex <
    tabs.length - 1
      ? tabs[currentTabIndex + 1]
      : null;

  const progress =
    Math.round(
      ((currentTabIndex + 1) /
        tabs.length) *
        100
    );

  const coupleName =
    useMemo(() => {
      const groom =
        cleanText(
          formData.groomName
        );

      const bride =
        cleanText(
          formData.brideName
        );

      if (
        groom &&
        bride
      ) {
        return `${groom} & ${bride}`;
      }

      if (groom) {
        return groom;
      }

      if (bride) {
        return bride;
      }

      return 'Nueva invitación';
    }, [
      formData.brideName,
      formData.groomName
    ]);

  const summary = {
    sections:
      builderSummary.activeSections ??
      activeSectionsCount,

    activities:
      builderSummary.itineraryActivities ??
      completedActivitiesCount,

    media:
      builderSummary.selectedMedia ??
      selectedMediaCount,

    gallery:
      builderSummary.galleryImages ??
      galleryCount
  };

  const completedSteps =
    Math.max(
      0,
      currentTabIndex
    );

  function goToTab(tab) {
    const tabKey =
      typeof tab === 'string'
        ? tab
        : getTabKey(tab);

    if (
      !tabKey ||
      typeof changeFormTab !==
        'function'
    ) {
      return;
    }

    changeFormTab(tabKey);

    if (
      typeof window !==
      'undefined'
    ) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  function handlePrevious() {
    if (previousTab) {
      goToTab(previousTab);
    }
  }

  function handleNext() {
    if (nextTab) {
      goToTab(nextTab);
    }
  }

  /*
   * =======================================================
   * RESET
   *
   * Ya NO ejecutamos resetBuilder() directamente
   * cuando la confirmación está activa.
   *
   * Primero abrimos nuestro modal.
   * =======================================================
   */
  function handleReset() {
    if (
      loading ||
      typeof resetBuilder !==
        'function'
    ) {
      return;
    }

    if (!confirmBeforeReset) {
      resetBuilder({
        force: true
      });

      return;
    }

    setResetDialogOpen(true);
  }

  function handleCancelReset() {
    if (loading) {
      return;
    }

    setResetDialogOpen(false);
  }

  function handleConfirmReset() {
    if (
      loading ||
      typeof resetBuilder !==
        'function'
    ) {
      return;
    }

    /*
     * force: true evita que el hook
     * vuelva a lanzar window.confirm().
     */
    resetBuilder({
      force: true
    });

    setResetDialogOpen(false);
  }

  function handleCloseCreatedWedding() {
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
            handleChange={handleChange}
            onToggleSection={handleSectionToggle}
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
            clearMedia={
              clearMedia
            }
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
    <section className="wedding-studio">
      {/*
       * =====================================================
       * HEADER
       * =====================================================
       */}
      <header className="studio-header">
        <div className="studio-header-copy">
          <div className="studio-brand-row">
            <span className="studio-brand-chip">
              <span className="studio-brand-dot" />

              {businessName}
            </span>

            <span className="studio-type-label">
              Wedding Studio
            </span>
          </div>

          <h1>
            Constructor de invitaciones
          </h1>

          <p>
            Diseña, organiza y revisa cada detalle de la
            invitación desde un espacio de trabajo claro y
            elegante.
          </p>
        </div>

        <button
          type="button"
          className="studio-reset-button"
          onClick={handleReset}
          disabled={loading}
        >
          <ResetIcon />

          <span>
            Limpiar formulario
          </span>
        </button>
      </header>

      {/*
       * =====================================================
       * INVITACIÓN CREADA
       * =====================================================
       */}
      {generatedWedding && (
        <div className="studio-created-wrapper">
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
              handleCloseCreatedWedding
            }
          />
        </div>
      )}

      {/*
       * =====================================================
       * CONTEXTO + PROGRESO
       * =====================================================
       */}
      <section className="studio-context-card">
        <div className="studio-context-main">
          <div className="studio-context-identity">
            <span className="studio-context-eyebrow">
              Invitación actual
            </span>

            <strong>
              {coupleName}
            </strong>

            <span className="studio-context-step">
              {currentMeta.label}
              {' · '}
              Paso {currentTabIndex + 1} de {tabs.length}
            </span>
          </div>

          <ProgressRing
            progress={progress}
            currentStep={
              currentTabIndex + 1
            }
            totalSteps={
              tabs.length
            }
          />
        </div>

        <div className="studio-summary">
          <SummaryItem
            icon="sections"
            value={
              summary.sections
            }
            label="Secciones activas"
          />

          <span className="studio-summary-divider" />

          <SummaryItem
            icon="activities"
            value={
              summary.activities
            }
            label="Actividades"
          />

          <span className="studio-summary-divider" />

          <SummaryItem
            icon="media"
            value={
              summary.media
            }
            label="Archivos"
          />

          <span className="studio-summary-divider" />

          <SummaryItem
            icon="gallery"
            value={
              summary.gallery
            }
            label="Fotografías"
          />
        </div>
      </section>

      {/*
       * =====================================================
       * STEPPER
       * =====================================================
       */}
      <nav
        className="studio-stepper"
        aria-label="Pasos del constructor"
      >
        <div className="studio-stepper-scroll">
          {tabs.map(
            (
              tab,
              index
            ) => {
              const key =
                getTabKey(tab);

              const active =
                key ===
                formTab;

              const completed =
                index <
                currentTabIndex;

              return (
                <button
                  key={key}
                  type="button"
                  className={`studio-step ${
                    active
                      ? 'active'
                      : ''
                  } ${
                    completed
                      ? 'completed'
                      : ''
                  }`}
                  onClick={() =>
                    goToTab(key)
                  }
                  aria-current={
                    active
                      ? 'step'
                      : undefined
                  }
                >
                  <span className="studio-step-icon">
                    {completed ? (
                      <span className="studio-check">
                        ✓
                      </span>
                    ) : (
                      <StepIcon
                        type={key}
                      />
                    )}
                  </span>

                  <span className="studio-step-copy">
                    <strong>
                      {getTabLabel(
                        tab
                      )}
                    </strong>

                    <small>
                      {completed
                        ? 'Completado'
                        : active
                          ? 'Editando'
                          : `Paso ${
                              index +
                              1
                            }`}
                    </small>
                  </span>
                </button>
              );
            }
          )}
        </div>
      </nav>

      {/*
       * =====================================================
       * EDITOR
       * =====================================================
       */}
      <form
        className="studio-editor"
        onSubmit={handleSubmit}
        noValidate
      >
        <header className="studio-editor-header">
          <div className="studio-editor-number">
            {currentTabIndex + 1}
          </div>

          <div className="studio-editor-heading">
            <span>
              Paso actual
            </span>

            <h2>
              {currentMeta.title}
            </h2>

            <p>
              {currentMeta.description}
            </p>
          </div>

          <div className="studio-editor-status">
            <span className="studio-editor-status-dot" />

            <span>
              {formTab === 'preview'
                ? 'Listo para revisar'
                : completedSteps ===
                    0
                  ? 'Comenzando'
                  : completedSteps ===
                      1
                    ? '1 paso completado'
                    : `${completedSteps} pasos completados`}
            </span>
          </div>
        </header>

        <div className="studio-editor-content">
          {renderActiveTab()}
        </div>

        {formTab !== 'preview' && (
          <footer className="studio-editor-footer">
            <button
              type="button"
              className="studio-footer-reset"
              onClick={
                handleReset
              }
              disabled={
                loading
              }
            >
              <ResetIcon />

              Restablecer
            </button>

            <div className="studio-footer-navigation">
              {previousTab && (
                <button
                  type="button"
                  className="studio-button studio-button-secondary"
                  onClick={
                    handlePrevious
                  }
                  disabled={
                    loading
                  }
                >
                  <ArrowIcon direction="left" />

                  Anterior
                </button>
              )}

              {nextTab && (
                <button
                  type="button"
                  className="studio-button studio-button-primary"
                  onClick={
                    handleNext
                  }
                  disabled={
                    loading
                  }
                >
                  {getTabKey(
                    nextTab
                  ) ===
                  'preview'
                    ? 'Revisar invitación'
                    : 'Continuar'}

                  <ArrowIcon />
                </button>
              )}
            </div>
          </footer>
        )}
      </form>

      {/*
       * =====================================================
       * MODAL PERSONALIZADO
       * =====================================================
       */}
      <ResetConfirmationDialog
        open={
          resetDialogOpen
        }
        loading={
          loading
        }
        onCancel={
          handleCancelReset
        }
        onConfirm={
          handleConfirmReset
        }
      />
    </section>
  );
}