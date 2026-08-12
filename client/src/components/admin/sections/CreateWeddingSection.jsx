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
    description:
      'Pareja, fecha, bienvenida y ubicación.'
  },

  content: {
    label: 'Contenido',
    title: 'Contenido de la invitación',
    description:
      'Familias, historia, vestimenta, regalos y textos.'
  },

  sections: {
    label: 'Secciones',
    title: 'Secciones de la invitación',
    description:
      'Decide qué elementos estarán visibles para los invitados.'
  },

  itinerary: {
    label: 'Itinerario',
    title: 'Itinerario del evento',
    description:
      'Organiza horarios, actividades y momentos importantes.'
  },

  media: {
    label: 'Multimedia',
    title: 'Fotografías y música',
    description:
      'Portada, fotografía de pareja, galería y música.'
  },

  design: {
    label: 'Diseño',
    title: 'Diseño y apariencia',
    description:
      'Define la paleta y personalidad visual de la invitación.'
  },

  preview: {
    label: 'Vista previa',
    title: 'Revisión final',
    description:
      'Comprueba toda la invitación antes de publicarla.'
  }
};

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function getTabKey(tab = {}) {
  return tab.key || tab.id || '';
}

function getTabLabel(tab = {}) {
  const key = getTabKey(tab);

  return (
    TAB_META[key]?.label ||
    tab.label ||
    tab.title ||
    key
  );
}

function formatDraftSavedAt(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const difference =
    Date.now() - date.getTime();

  const seconds = Math.max(
    0,
    Math.round(
      difference / 1000
    )
  );

  if (seconds < 45) {
    return 'hace unos segundos';
  }

  const minutes =
    Math.round(
      seconds / 60
    );

  if (minutes < 60) {
    return `hace ${minutes} ${
      minutes === 1
        ? 'minuto'
        : 'minutos'
    }`;
  }

  const hours =
    Math.round(
      minutes / 60
    );

  if (hours < 24) {
    return `hace ${hours} ${
      hours === 1
        ? 'hora'
        : 'horas'
    }`;
  }

  const days =
    Math.round(
      hours / 24
    );

  if (days <= 6) {
    return `hace ${days} ${
      days === 1
        ? 'día'
        : 'días'
    }`;
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }
  ).format(date);
}

function getDraftCoupleName(draft) {
  const formData =
    draft?.formData &&
    typeof draft.formData === 'object'
      ? draft.formData
      : {};

  const groom =
    cleanText(
      formData.groomName
    );

  const bride =
    cleanText(
      formData.brideName
    );

  if (groom && bride) {
    return `${groom} & ${bride}`;
  }

  return (
    groom ||
    bride ||
    'Invitación sin terminar'
  );
}

function countDraftSections(draft) {
  const sections =
    draft?.formData?.sections;

  if (
    !sections ||
    typeof sections !== 'object' ||
    Array.isArray(sections)
  ) {
    return 0;
  }

  return Object.values(
    sections
  ).filter(Boolean).length;
}

function countDraftActivities(draft) {
  const itinerary =
    Array.isArray(
      draft?.formData?.itinerary
    )
      ? draft.formData.itinerary
      : [];

  return itinerary.filter(
    (item) => {
      if (
        !item ||
        typeof item !== 'object'
      ) {
        return false;
      }

      return Object.values(
        item
      ).some((value) => {
        if (
          typeof value === 'string'
        ) {
          return Boolean(
            cleanText(value)
          );
        }

        return Boolean(value);
      });
    }
  ).length;
}

function getDraftSummary(draft) {
  const media =
    draft?.media &&
    typeof draft.media === 'object'
      ? draft.media
      : {};

  const gallery =
    Array.isArray(media.gallery)
      ? media.gallery.filter(Boolean)
      : [];

  const standaloneMedia = [
    media.coverImage,
    media.coupleImage,
    media.backgroundMusic ||
      media.musicUrl
  ].filter(Boolean).length;

  return {
    sections:
      countDraftSections(draft),

    activities:
      countDraftActivities(draft),

    media:
      standaloneMedia +
      gallery.length,

    gallery:
      gallery.length
  };
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
          <rect
            x="4"
            y="4"
            width="6"
            height="6"
            rx="1.4"
          />

          <rect
            x="14"
            y="4"
            width="6"
            height="6"
            rx="1.4"
          />

          <rect
            x="4"
            y="14"
            width="6"
            height="6"
            rx="1.4"
          />

          <rect
            x="14"
            y="14"
            width="6"
            height="6"
            rx="1.4"
          />
        </svg>
      );

    case 'itinerary':
      return (
        <svg {...commonProps}>
          <circle
            cx="6"
            cy="6"
            r="1.3"
          />

          <circle
            cx="6"
            cy="12"
            r="1.3"
          />

          <circle
            cx="6"
            cy="18"
            r="1.3"
          />

          <path d="M10 6h8" />
          <path d="M10 12h8" />
          <path d="M10 18h8" />
        </svg>
      );

    case 'media':
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="2"
          />

          <circle
            cx="9"
            cy="9"
            r="2"
          />

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

          <circle
            cx="12"
            cy="12"
            r="2.5"
          />
        </svg>
      );

    case 'general':
    default:
      return (
        <svg {...commonProps}>
          <circle
            cx="12"
            cy="8"
            r="3"
          />

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

function EditIcon() {
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
      <path d="M12 20h9" />

      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function LinkIcon() {
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
      <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />

      <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
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

function DraftIcon() {
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
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

function SaveIcon({
  status = 'saved'
}) {
  if (
    status === 'pending' ||
    status === 'saving'
  ) {
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
        <circle
          cx="12"
          cy="12"
          r="8"
        />

        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (status === 'error') {
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
        <circle
          cx="12"
          cy="12"
          r="9"
        />

        <path d="M12 7v6" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

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
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="m8 12 2.5 2.5L16 9" />
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
        <circle
          cx="12"
          cy="12"
          r="8"
        />

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
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
        />

        <path d="m7 16 4-4 3 3 3-3" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
      />
    </svg>
  );
}

function ProgressRing({
  progress,
  currentStep,
  totalSteps
}) {
  const safeProgress = Math.max(
    0,
    Math.min(
      100,
      progress
    )
  );

  const progressAngle =
    `${safeProgress * 3.6}deg`;

  return (
    <div className="studio-progress-featured">
      <div
        className="studio-progress-ring"
        style={{
          '--studio-progress-angle':
            progressAngle
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

/*
 * =========================================================
 * AUTOGUARDADO COMPACTO
 * =========================================================
 *
 * En lugar de otra tarjeta, se muestra como un chip discreto
 * junto al botón de limpiar.
 */

function AutosaveStatus({
  status,
  savedAt,
  onSaveNow
}) {
  const configuration =
    useMemo(() => {
      if (status === 'pending') {
        return {
          label:
            'Cambios pendientes',
          tone:
            'var(--admin-text-muted)',
          iconStatus:
            'pending'
        };
      }

      if (status === 'saving') {
        return {
          label:
            'Guardando...',
          tone:
            'var(--admin-accent)',
          iconStatus:
            'saving'
        };
      }

      if (status === 'saved') {
        return {
          label:
            `Guardado ${
              formatDraftSavedAt(
                savedAt
              ) || ''
            }`.trim(),
          tone:
            'var(--admin-success)',
          iconStatus:
            'saved'
        };
      }

      if (status === 'restored') {
        return {
          label:
            'Borrador recuperado',
          tone:
            'var(--admin-success)',
          iconStatus:
            'saved'
        };
      }

      if (status === 'error') {
        return {
          label:
            'Error al guardar',
          tone:
            'var(--admin-danger)',
          iconStatus:
            'error'
        };
      }

      return null;
    }, [
      savedAt,
      status
    ]);

  if (!configuration) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={
        status === 'error' &&
        typeof onSaveNow === 'function'
          ? onSaveNow
          : undefined
      }
      disabled={
        status !== 'error'
      }
      aria-live="polite"
      title={
        status === 'error'
          ? 'Intentar guardar nuevamente'
          : configuration.label
      }
      style={{
        display: 'inline-flex',
        minHeight: '34px',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
        border:
          '1px solid var(--admin-border)',
        borderRadius: '999px',
        padding: '0 10px',
        background:
          'var(--admin-surface)',
        color:
          configuration.tone,
        fontSize: '7px',
        fontWeight: 780,
        cursor:
          status === 'error'
            ? 'pointer'
            : 'default',
        whiteSpace: 'nowrap',
        opacity: 1
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          width: '13px',
          height: '13px'
        }}
      >
        <SaveIcon
          status={
            configuration.iconStatus
          }
        />
      </span>

      {configuration.label}
    </button>
  );
}

function ContextBadge({
  children,
  tone = 'neutral'
}) {
  const styles =
    tone === 'accent'
      ? {
          border:
            '1px solid color-mix(in srgb, var(--admin-accent) 30%, var(--admin-border))',
          background:
            'color-mix(in srgb, var(--admin-accent) 8%, var(--admin-surface))',
          color:
            'var(--admin-accent)'
        }
      : tone === 'success'
        ? {
            border:
              '1px solid color-mix(in srgb, var(--admin-success) 25%, var(--admin-border))',
            background:
              'color-mix(in srgb, var(--admin-success) 7%, var(--admin-surface))',
            color:
              'var(--admin-success)'
          }
        : {
            border:
              '1px solid var(--admin-border)',
            background:
              'var(--admin-surface)',
            color:
              'var(--admin-text-muted)'
          };

  return (
    <span
      style={{
        display: 'inline-flex',
        minHeight: '21px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '999px',
        padding: '0 7px',
        fontSize: '6px',
        fontWeight: 850,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        ...styles
      }}
    >
      {children}
    </span>
  );
}

function CompactAction({
  children,
  onClick,
  disabled = false,
  primary = false,
  danger = false
}) {
  const color =
    danger
      ? 'var(--admin-danger)'
      : primary
        ? '#ffffff'
        : 'var(--admin-text-secondary)';

  const background =
    danger
      ? 'transparent'
      : primary
        ? 'var(--admin-accent)'
        : 'var(--admin-surface)';

  const border =
    danger
      ? '1px solid color-mix(in srgb, var(--admin-danger) 25%, var(--admin-border))'
      : primary
        ? '1px solid var(--admin-accent)'
        : '1px solid var(--admin-border)';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        minHeight: '33px',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        border,
        borderRadius: '9px',
        padding: '0 11px',
        background,
        color,
        fontSize: '7px',
        fontWeight: 800,
        cursor:
          disabled
            ? 'not-allowed'
            : 'pointer',
        opacity:
          disabled
            ? 0.55
            : 1,
        whiteSpace: 'nowrap'
      }}
    >
      {children}
    </button>
  );
}

/*
 * =========================================================
 * MODAL DE LIMPIEZA
 * =========================================================
 */

function ResetConfirmationDialog({
  open,
  onCancel,
  onConfirm,
  loading = false,
  isEditing = false
}) {
  const cancelButtonRef =
    useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style
        .overflow;

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
      window.setTimeout(
        () => {
          cancelButtonRef
            .current
            ?.focus();
        },
        40
      );

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
            {isEditing
              ? '¿Descartar estos cambios?'
              : '¿Limpiar esta invitación?'}
          </h2>

          <p id="reset-dialog-description">
            {isEditing
              ? 'Se cerrará el modo de edición y se perderán los cambios que todavía no hayas guardado.'
              : 'Se eliminará la información que todavía no hayas publicado, incluyendo textos, actividades y archivos seleccionados en el constructor.'}
          </p>
        </div>

        <div
          className="admin-confirm-note"
          style={{
            alignItems: 'flex-start'
          }}
        >
          <p
            style={{
              margin: 0
            }}
          >
            {isEditing
              ? 'La invitación publicada no se eliminará y conservará su última versión guardada.'
              : 'Las invitaciones que ya fueron publicadas no se eliminarán.'}
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

                Procesando...
              </>
            ) : (
              <>
                <ResetIcon />

                {isEditing
                  ? 'Descartar cambios'
                  : 'Sí, limpiar'}
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function CreateWeddingSection({
  /*
   * =====================================================
   * MODO EDICIÓN
   * =====================================================
   */

  isEditing = false,
  editingWedding = null,
  editingWeddingId = '',
  editingWeddingSlug = '',
  cancelEditing,

  /*
   * =====================================================
   * BORRADOR / AUTOGUARDADO
   * =====================================================
   */

  hasRecoverableDraft = false,
  hasLocalDraft = false,
  recoverableDraft = null,
  draftSavedAt = '',
  draftStatus = 'idle',
  draftHasUnrestorableFiles = false,

  restoreDraft,
  discardDraft,
  flushDraftNow,

  /*
   * =====================================================
   * NAVEGACIÓN
   * =====================================================
   */

  formTab = 'general',
  changeFormTab,

  /*
   * =====================================================
   * FORMULARIO
   * =====================================================
   */

  formData = {},
  handleChange,
  handleThemeChange,
  handleSectionToggle,

  activeSectionsCount = 0,
  activateAllSections,
  deactivateAllSections,

  /*
   * =====================================================
   * ITINERARIO
   * =====================================================
   */

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

  /*
   * =====================================================
   * MULTIMEDIA
   * =====================================================
   */

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

  /*
   * =====================================================
   * INVITACIÓN GUARDADA
   * =====================================================
   */

  generatedWedding,
  generatedUrl = '',
  copyGeneratedUrl,
  setGeneratedWedding,

  /*
   * =====================================================
   * PREVIEW / RESUMEN
   * =====================================================
   */

  previewDate = '',
  builderSummary = {},

  /*
   * =====================================================
   * CONFIGURACIÓN
   * =====================================================
   */

  businessName = 'BodaSync',
  applyDefaultMessage,

  loading = false,
  confirmBeforeReset = true,

  /*
   * =====================================================
   * ACCIONES
   * =====================================================
   */

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
    getTabKey(
      currentTab
    );

  const currentMeta =
    TAB_META[currentKey] || {
      label:
        getTabLabel(
          currentTab
        ),

      title:
        getTabLabel(
          currentTab
        ),

      description: ''
    };

  const currentDescription =
    currentKey === 'preview'
      ? isEditing
        ? 'Comprueba toda la invitación antes de guardar los cambios.'
        : 'Comprueba toda la invitación antes de publicarla.'
      : currentMeta.description;

  const previousTab =
    currentTabIndex > 0
      ? tabs[
          currentTabIndex - 1
        ]
      : null;

  const nextTab =
    currentTabIndex <
    tabs.length - 1
      ? tabs[
          currentTabIndex + 1
        ]
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

      return isEditing
        ? 'Invitación publicada'
        : 'Nueva invitación';
    }, [
      formData.brideName,
      formData.groomName,
      isEditing
    ]);

  const summary = {
    sections:
      builderSummary
        .activeSections ??
      activeSectionsCount,

    activities:
      builderSummary
        .itineraryActivities ??
      completedActivitiesCount,

    media:
      builderSummary
        .selectedMedia ??
      selectedMediaCount,

    gallery:
      builderSummary
        .galleryImages ??
      galleryCount
  };

  const completedSteps =
    Math.max(
      0,
      currentTabIndex
    );

  const resolvedEditingSlug =
    cleanText(
      editingWeddingSlug ||
        editingWedding?.slug ||
        ''
    );

  /*
   * =====================================================
   * CONTEXTO DEL BORRADOR
   * =====================================================
   */

  const draftTabIndex =
    useMemo(() => {
      if (
        !hasRecoverableDraft ||
        !recoverableDraft
      ) {
        return -1;
      }

      const index =
        tabs.findIndex(
          (tab) =>
            getTabKey(tab) ===
            recoverableDraft.formTab
        );

      return index >= 0
        ? index
        : 0;
    }, [
      hasRecoverableDraft,
      recoverableDraft,
      tabs
    ]);

  const draftSummary =
    useMemo(
      () =>
        getDraftSummary(
          recoverableDraft
        ),
      [
        recoverableDraft
      ]
    );

  const contextTabIndex =
    hasRecoverableDraft &&
    draftTabIndex >= 0
      ? draftTabIndex
      : currentTabIndex;

  const contextProgress =
    Math.round(
      ((contextTabIndex + 1) /
        tabs.length) *
        100
    );

  const contextTab =
    tabs[
      contextTabIndex
    ] || currentTab;

  const contextTabLabel =
    getTabLabel(
      contextTab
    );

  const contextCoupleName =
    hasRecoverableDraft &&
    recoverableDraft
      ? getDraftCoupleName(
          recoverableDraft
        )
      : coupleName;

  const contextSummary =
    hasRecoverableDraft
      ? draftSummary
      : summary;

  const draftIsEditing =
    recoverableDraft?.mode ===
      'editing';

  const draftSlug =
    cleanText(
      recoverableDraft
        ?.editingWedding
        ?.slug
    );

  const draftSavedLabel =
    formatDraftSavedAt(
      recoverableDraft
        ?.savedAt
    );

  const showRecoveredFilesWarning =
    !hasRecoverableDraft &&
    draftHasUnrestorableFiles &&
    (
      draftStatus ===
        'restored' ||
      draftStatus ===
        'pending' ||
      draftStatus ===
        'saving' ||
      draftStatus ===
        'saved'
    );

  const showContextUtilityRow =
    hasRecoverableDraft ||
    isEditing ||
    showRecoveredFilesWarning;

  /*
   * =====================================================
   * NAVEGACIÓN
   * =====================================================
   */

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

    changeFormTab(
      tabKey
    );

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
      goToTab(
        previousTab
      );
    }
  }

  function handleNext() {
    if (nextTab) {
      goToTab(
        nextTab
      );
    }
  }

  /*
   * =====================================================
   * RESET
   * =====================================================
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

    setResetDialogOpen(
      true
    );
  }

  function handleCancelReset() {
    if (loading) {
      return;
    }

    setResetDialogOpen(
      false
    );
  }

  function handleConfirmReset() {
    if (
      loading ||
      typeof resetBuilder !==
        'function'
    ) {
      return;
    }

    resetBuilder({
      force: true
    });

    setResetDialogOpen(
      false
    );
  }

  /*
   * =====================================================
   * INVITACIÓN CREADA
   * =====================================================
   */

  function handleCloseCreatedWedding() {
    if (
      typeof setGeneratedWedding ===
        'function'
    ) {
      setGeneratedWedding(
        null
      );
    }
  }

  /*
   * =====================================================
   * BORRADOR
   * =====================================================
   */

  function handleRestoreDraft() {
    if (
      loading ||
      typeof restoreDraft !==
        'function'
    ) {
      return;
    }

    restoreDraft();
  }

  function handleDiscardDraft() {
    if (
      loading ||
      typeof discardDraft !==
        'function'
    ) {
      return;
    }

    discardDraft();
  }

  function handleSaveDraftNow() {
    if (
      loading ||
      typeof flushDraftNow !==
        'function'
    ) {
      return;
    }

    flushDraftNow();
  }

  /*
   * =====================================================
   * TABS
   * =====================================================
   */

  function renderActiveTab() {
    switch (formTab) {
      case 'content':
        return (
          <ContentTab
            formData={
              formData
            }
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
            formData={
              formData
            }
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
            formData={
              formData
            }
            itinerary={
              itinerary
            }
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
            formData={
              formData
            }
            media={
              media
            }
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
            formData={
              formData
            }
            handleThemeChange={
              handleThemeChange
            }
          />
        );

      case 'preview':
        return (
          <PreviewTab
            formData={
              formData
            }
            media={
              media
            }
            itinerary={
              itinerary
            }
            previewDate={
              previewDate
            }
            builderSummary={
              builderSummary
            }
            loading={
              loading
            }
            isEditing={
              isEditing
            }
            editingWedding={
              editingWedding
            }
            editingWeddingSlug={
              resolvedEditingSlug
            }
            onEdit={
              goToGeneralInformation
            }
            onCreateInvitation={
              handleSubmit
            }
            onSaveChanges={
              handleSubmit
            }
          />
        );

      case 'general':
      default:
        return (
          <GeneralTab
            formData={
              formData
            }
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
    <section
      className="wedding-studio"
      data-mode={
        isEditing
          ? 'editing'
          : 'creating'
      }
      data-draft-status={
        draftStatus
      }
    >
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
            {isEditing
              ? 'Editar invitación'
              : 'Constructor de invitaciones'}
          </h1>

          <p>
            {isEditing
              ? 'Actualiza textos, fotografías, secciones y diseño sin cambiar el enlace público de la invitación.'
              : 'Diseña, organiza y revisa cada detalle de la invitación desde un espacio de trabajo claro y elegante.'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent:
              'flex-end',
            gap: '8px'
          }}
        >
          {!hasRecoverableDraft && (
            <AutosaveStatus
              status={
                draftStatus
              }
              savedAt={
                draftSavedAt
              }
              onSaveNow={
                handleSaveDraftNow
              }
            />
          )}

          <button
            type="button"
            className="studio-reset-button"
            onClick={
              handleReset
            }
            disabled={
              loading
            }
          >
            <ResetIcon />

            <span>
              {isEditing
                ? 'Descartar cambios'
                : 'Limpiar formulario'}
            </span>
          </button>
        </div>
      </header>

      {/*
       * =====================================================
       * INVITACIÓN GUARDADA
       * =====================================================
       */}

      {!isEditing &&
        generatedWedding && (
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
       * CONTEXTO ÚNICO
       * =====================================================
       *
       * AQUÍ integramos:
       *
       * - invitación actual
       * - borrador
       * - edición
       * - slug
       * - cancelar edición
       * - recuperar borrador
       * - advertencia de archivos
       *
       * Ya no existen tarjetas grandes separadas.
       */}

      <section
        className="studio-context-card"
        style={{
          overflow: 'hidden'
        }}
      >
        <div className="studio-context-main">
          <div
            className="studio-context-identity"
            style={{
              minWidth: 0
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '7px',
                marginBottom: '5px'
              }}
            >
              <span className="studio-context-eyebrow">
                {hasRecoverableDraft
                  ? 'Borrador disponible'
                  : isEditing
                    ? 'Editando invitación'
                    : 'Invitación actual'}
              </span>

              {hasRecoverableDraft && (
                <ContextBadge
                  tone="accent"
                >
                  {draftIsEditing
                    ? 'Edición pendiente'
                    : 'Sin publicar'}
                </ContextBadge>
              )}

              {!hasRecoverableDraft &&
                isEditing && (
                  <ContextBadge
                    tone="success"
                  >
                    Publicada
                  </ContextBadge>
                )}
            </div>

            <strong
              title={
                contextCoupleName
              }
            >
              {contextCoupleName}
            </strong>

            <span className="studio-context-step">
              {contextTabLabel}

              {' · '}

              Paso {contextTabIndex + 1} de {tabs.length}
            </span>

            {hasRecoverableDraft &&
              draftSavedLabel && (
                <span
                  style={{
                    display: 'block',
                    marginTop: '6px',
                    color:
                      'var(--admin-text-muted)',
                    fontSize: '7px',
                    lineHeight: 1.45
                  }}
                >
                  Borrador guardado {draftSavedLabel}
                </span>
              )}

            {!hasRecoverableDraft &&
              isEditing &&
              resolvedEditingSlug && (
                <span
                  style={{
                    display:
                      'inline-flex',
                    maxWidth: '100%',
                    alignItems:
                      'center',
                    gap: '5px',
                    marginTop: '6px',
                    color:
                      'var(--admin-text-muted)',
                    fontSize: '7px',
                    fontWeight: 680,
                    lineHeight: 1.4
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display:
                        'inline-flex',
                      width: '12px',
                      height: '12px',
                      flexShrink: 0,
                      color:
                        'var(--admin-accent)'
                    }}
                  >
                    <LinkIcon />
                  </span>

                  <span
                    style={{
                      overflowWrap:
                        'anywhere'
                    }}
                  >
                    /boda/{resolvedEditingSlug}
                  </span>
                </span>
              )}
          </div>

          <ProgressRing
            progress={
              contextProgress
            }
            currentStep={
              contextTabIndex + 1
            }
            totalSteps={
              tabs.length
            }
          />
        </div>

        {/*
         * ===================================================
         * FILA INTEGRADA DE ESTADO / ACCIONES
         * ===================================================
         */}

        {showContextUtilityRow && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent:
                'space-between',
              gap: '10px',
              borderTop:
                '1px solid var(--admin-border)',
              padding:
                '10px 18px',
              background:
                'color-mix(in srgb, var(--admin-surface-soft) 64%, transparent)'
            }}
          >
            {hasRecoverableDraft ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    minWidth:
                      'min(100%, 260px)',
                    flex:
                      '1 1 360px',
                    alignItems:
                      'center',
                    gap: '9px'
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'grid',
                      width: '28px',
                      height: '28px',
                      flexShrink: 0,
                      placeItems:
                        'center',
                      borderRadius:
                        '8px',
                      background:
                        'color-mix(in srgb, var(--admin-accent) 8%, var(--admin-surface))',
                      color:
                        'var(--admin-accent)'
                    }}
                  >
                    <span
                      style={{
                        display:
                          'inline-flex',
                        width: '14px',
                        height: '14px'
                      }}
                    >
                      <DraftIcon />
                    </span>
                  </span>

                  <div
                    style={{
                      minWidth: 0
                    }}
                  >
                    <strong
                      style={{
                        display:
                          'block',
                        color:
                          'var(--admin-text)',
                        fontSize:
                          '8px',
                        fontWeight:
                          780
                      }}
                    >
                      Tienes trabajo sin terminar
                    </strong>

                    <span
                      style={{
                        display:
                          'block',
                        marginTop:
                          '2px',
                        color:
                          'var(--admin-text-muted)',
                        fontSize:
                          '7px',
                        lineHeight:
                          1.45
                      }}
                    >
                      Continúa desde donde lo dejaste o descarta este borrador.
                    </span>

                    {draftSlug && (
                      <span
                        style={{
                          display:
                            'block',
                          marginTop:
                            '3px',
                          color:
                            'var(--admin-text-secondary)',
                          fontSize:
                            '6px',
                          fontWeight:
                            700,
                          overflowWrap:
                            'anywhere'
                        }}
                      >
                        /boda/{draftSlug}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems:
                      'center',
                    gap: '7px'
                  }}
                >
                  <CompactAction
                    onClick={
                      handleDiscardDraft
                    }
                    disabled={
                      loading
                    }
                  >
                    Descartar
                  </CompactAction>

                  <CompactAction
                    onClick={
                      handleRestoreDraft
                    }
                    disabled={
                      loading
                    }
                    primary
                  >
                    <span
                      style={{
                        display:
                          'inline-flex',
                        width: '12px',
                        height: '12px'
                      }}
                    >
                      <DraftIcon />
                    </span>

                    Continuar borrador
                  </CompactAction>
                </div>
              </>
            ) : isEditing ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    minWidth:
                      'min(100%, 260px)',
                    flex:
                      '1 1 360px',
                    alignItems:
                      'center',
                    gap: '9px'
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'grid',
                      width: '28px',
                      height: '28px',
                      flexShrink: 0,
                      placeItems:
                        'center',
                      borderRadius:
                        '8px',
                      background:
                        'color-mix(in srgb, var(--admin-accent) 8%, var(--admin-surface))',
                      color:
                        'var(--admin-accent)'
                    }}
                  >
                    <span
                      style={{
                        display:
                          'inline-flex',
                        width: '14px',
                        height: '14px'
                      }}
                    >
                      <EditIcon />
                    </span>
                  </span>

                  <div
                    style={{
                      minWidth: 0
                    }}
                  >
                    <strong
                      style={{
                        display:
                          'block',
                        color:
                          'var(--admin-text)',
                        fontSize:
                          '8px',
                        fontWeight:
                          780
                      }}
                    >
                      Modificando una invitación publicada
                    </strong>

                    <span
                      style={{
                        display:
                          'block',
                        marginTop:
                          '2px',
                        color:
                          'var(--admin-text-muted)',
                        fontSize:
                          '7px',
                        lineHeight:
                          1.45
                      }}
                    >
                      Los cambios se guardarán sobre esta misma invitación y conservarán su enlace.
                    </span>
                  </div>
                </div>

                {typeof cancelEditing ===
                  'function' && (
                  <CompactAction
                    onClick={
                      cancelEditing
                    }
                    disabled={
                      loading
                    }
                  >
                    <span
                      style={{
                        display:
                          'inline-flex',
                        width: '11px',
                        height: '11px'
                      }}
                    >
                      <CloseIcon />
                    </span>

                    Cancelar edición
                  </CompactAction>
                )}
              </>
            ) : null}

            {showRecoveredFilesWarning && (
              <div
                style={{
                  display: 'flex',
                  width:
                    hasRecoverableDraft ||
                    isEditing
                      ? '100%'
                      : 'auto',
                  flex:
                    '1 1 100%',
                  alignItems:
                    'flex-start',
                  gap: '8px',
                  borderTop:
                    hasRecoverableDraft ||
                    isEditing
                      ? '1px dashed var(--admin-border)'
                      : 0,
                  paddingTop:
                    hasRecoverableDraft ||
                    isEditing
                      ? '9px'
                      : 0
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display:
                      'inline-flex',
                    width: '14px',
                    height: '14px',
                    flexShrink: 0,
                    marginTop: '1px',
                    color:
                      'var(--admin-warning)'
                  }}
                >
                  <WarningIcon />
                </span>

                <span
                  style={{
                    color:
                      'var(--admin-text-muted)',
                    fontSize: '7px',
                    lineHeight: 1.5
                  }}
                >
                  Algunos archivos nuevos no pueden recuperarse después de recargar la página. Tus textos y configuración sí fueron restaurados; vuelve a seleccionar esas fotografías o canciones antes de publicar.
                </span>
              </div>
            )}
          </div>
        )}

        {/*
         * ===================================================
         * RESUMEN
         * ===================================================
         */}

        <div className="studio-summary">
          <SummaryItem
            icon="sections"
            value={
              contextSummary.sections
            }
            label="Secciones activas"
          />

          <span className="studio-summary-divider" />

          <SummaryItem
            icon="activities"
            value={
              contextSummary.activities
            }
            label="Actividades"
          />

          <span className="studio-summary-divider" />

          <SummaryItem
            icon="media"
            value={
              contextSummary.media
            }
            label="Archivos"
          />

          <span className="studio-summary-divider" />

          <SummaryItem
            icon="gallery"
            value={
              contextSummary.gallery
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
                    goToTab(
                      key
                    )
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
                        type={
                          key
                        }
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
                          ? isEditing
                            ? 'Modificando'
                            : 'Editando'
                          : `Paso ${index + 1}`}
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
        onSubmit={
          handleSubmit
        }
        noValidate
      >
        <header className="studio-editor-header">
          <div className="studio-editor-number">
            {currentTabIndex + 1}
          </div>

          <div className="studio-editor-heading">
            <span>
              {isEditing
                ? 'Modificando'
                : 'Paso actual'}
            </span>

            <h2>
              {currentMeta.title}
            </h2>

            <p>
              {currentDescription}
            </p>
          </div>

          <div className="studio-editor-status">
            <span className="studio-editor-status-dot" />

            <span>
              {formTab ===
              'preview'
                ? isEditing
                  ? 'Listo para guardar'
                  : 'Listo para revisar'
                : completedSteps === 0
                  ? isEditing
                    ? 'Edición iniciada'
                    : 'Comenzando'
                  : completedSteps === 1
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

              {isEditing
                ? 'Descartar'
                : 'Restablecer'}
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
                  ) === 'preview'
                    ? isEditing
                      ? 'Revisar cambios'
                      : 'Revisar invitación'
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
       * MODAL
       * =====================================================
       */}

      <ResetConfirmationDialog
        open={
          resetDialogOpen
        }
        loading={
          loading
        }
        isEditing={
          isEditing
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