import React, { useMemo } from 'react';

import { SECTION_OPTIONS } from '../config/adminConfig';

const SECTION_GROUPS = [
  {
    key: 'main',
    eyebrow: 'Esenciales',
    title: 'Información principal',
    description:
      'Los elementos básicos que ubican al invitado antes del gran día.',
    sections: ['countdown', 'calendar', 'parents']
  },
  {
    key: 'content',
    eyebrow: 'Historia',
    title: 'Contenido de la pareja',
    description:
      'Recuerdos, fotografías y momentos que hacen personal la invitación.',
    sections: ['story', 'gallery', 'itinerary']
  },
  {
    key: 'event',
    eyebrow: 'Evento',
    title: 'Detalles de la celebración',
    description:
      'Lugar, vestimenta y opciones importantes para asistir.',
    sections: ['location', 'dressCode', 'gifts']
  },
  {
    key: 'interaction',
    eyebrow: 'Experiencia',
    title: 'Experiencia de invitados',
    description:
      'Elementos interactivos para completar la experiencia de la boda.',
    sections: ['music', 'guestBook']
  }
];

const SECTION_META = {
  countdown: {
    label: 'Cuenta regresiva',
    shortDescription: 'Tiempo restante para el gran día.',
    icon: 'clock'
  },
  calendar: {
    label: 'Calendario',
    shortDescription: 'Permite guardar la fecha del evento.',
    icon: 'calendar'
  },
  parents: {
    label: 'Familias',
    shortDescription: 'Presenta a los padres de la pareja.',
    icon: 'family'
  },
  story: {
    label: 'Nuestra historia',
    shortDescription: 'Un espacio para contar su historia.',
    icon: 'heart'
  },
  gallery: {
    label: 'Galería',
    shortDescription: 'Fotografías y recuerdos especiales.',
    icon: 'gallery'
  },
  itinerary: {
    label: 'Itinerario',
    shortDescription: 'Horarios y actividades del evento.',
    icon: 'timeline'
  },
  location: {
    label: 'Ubicación',
    shortDescription: 'Lugar, dirección y acceso al mapa.',
    icon: 'location'
  },
  dressCode: {
    label: 'Código de vestimenta',
    shortDescription: 'Indicaciones para el estilo de los invitados.',
    icon: 'dress'
  },
  gifts: {
    label: 'Regalos',
    shortDescription: 'Información de regalos o datos bancarios.',
    icon: 'gift'
  },
  music: {
    label: 'Música',
    shortDescription: 'Canción ambiental de la invitación.',
    icon: 'music'
  },
  guestBook: {
    label: 'Libro de firmas',
    shortDescription: 'Mensajes y buenos deseos de los invitados.',
    icon: 'message'
  }
};

function SectionIcon({ type }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.7',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    width: 20,
    height: 20
  };

  switch (type) {
    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </svg>
      );

    case 'calendar':
      return (
        <svg {...commonProps}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );

    case 'family':
      return (
        <svg {...commonProps}>
          <circle cx="8" cy="9" r="3" />
          <circle cx="16.5" cy="8" r="2.5" />
          <path d="M3 19c.5-3.5 2.3-5.5 5-5.5s4.5 2 5 5.5" />
          <path d="M13 14c3.7-.8 6.2 1.1 7 4" />
        </svg>
      );

    case 'heart':
      return (
        <svg {...commonProps}>
          <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
        </svg>
      );

    case 'gallery':
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <circle cx="9" cy="9" r="1.5" />
          <path d="m5 17 4.5-4.5 3.2 3.2 2.2-2.2L19 17.5" />
        </svg>
      );

    case 'timeline':
      return (
        <svg {...commonProps}>
          <path d="M8 5h11M8 12h11M8 19h11" />
          <circle cx="4.5" cy="5" r="1.5" />
          <circle cx="4.5" cy="12" r="1.5" />
          <circle cx="4.5" cy="19" r="1.5" />
        </svg>
      );

    case 'location':
      return (
        <svg {...commonProps}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case 'dress':
      return (
        <svg {...commonProps}>
          <path d="M9 4h6l-1 5 4 10H6l4-10-1-5Z" />
          <path d="M10 9h4" />
        </svg>
      );

    case 'gift':
      return (
        <svg {...commonProps}>
          <path d="M4 10h16v10H4z" />
          <path d="M3 7h18v3H3zM12 7v13" />
          <path d="M12 7c-1-4-6-4-6-1 0 2 3 2 6 1Z" />
          <path d="M12 7c1-4 6-4 6-1 0 2-3 2-6 1Z" />
        </svg>
      );

    case 'music':
      return (
        <svg {...commonProps}>
          <path d="M9 18V6l10-2v12" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </svg>
      );

    case 'message':
      return (
        <svg {...commonProps}>
          <path d="M5 5h14v11H9l-4 4V5Z" />
          <path d="M8 9h8M8 12h6" />
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

function PowerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="15"
      height="15"
    >
      <path d="M12 3v9" />
      <path d="M7.5 5.8A8 8 0 1 0 16.5 5.8" />
    </svg>
  );
}

function SectionSwitch({
  section,
  enabled,
  onToggle
}) {
  const meta =
    SECTION_META[section.key] || {};

  const title =
    meta.label ||
    section.title ||
    section.label ||
    section.key;

  const description =
    meta.shortDescription ||
    section.description ||
    '';

  function handleToggle() {
    if (typeof onToggle === 'function') {
      onToggle(section.key);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={enabled}
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        minHeight: '145px',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        gap: '18px',
        overflow: 'hidden',
        border: enabled
          ? '1px solid color-mix(in srgb, var(--admin-accent) 40%, var(--admin-border))'
          : '1px solid var(--admin-border)',
        borderRadius: '18px',
        padding: '18px',
        background: enabled
          ? 'linear-gradient(145deg, color-mix(in srgb, var(--admin-accent) 5%, var(--admin-surface)), var(--admin-surface))'
          : 'var(--admin-surface)',
        color: 'var(--admin-text)',
        textAlign: 'left',
        cursor: 'pointer',
        opacity: enabled ? 1 : 0.68,
        boxShadow: enabled
          ? '0 12px 30px rgba(15, 23, 42, 0.055)'
          : 'none',
        transition:
          'border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease, background 180ms ease'
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform =
          'translateY(-2px)';

        event.currentTarget.style.boxShadow =
          '0 14px 34px rgba(15, 23, 42, 0.08)';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          'translateY(0)';

        event.currentTarget.style.boxShadow =
          enabled
            ? '0 12px 30px rgba(15, 23, 42, 0.055)'
            : 'none';
      }}
    >
      {enabled && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: '20px',
            right: '20px',
            height: '2px',
            borderRadius: '0 0 999px 999px',
            background:
              'linear-gradient(90deg, transparent, var(--admin-accent), transparent)'
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '14px'
        }}
      >
        <div
          style={{
            display: 'flex',
            minWidth: 0,
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'grid',
              width: '40px',
              height: '40px',
              flexShrink: 0,
              placeItems: 'center',
              border: enabled
                ? '1px solid color-mix(in srgb, var(--admin-accent) 26%, var(--admin-border))'
                : '1px solid var(--admin-border)',
              borderRadius: '12px',
              background: enabled
                ? 'var(--admin-accent-soft)'
                : 'var(--admin-surface-soft)',
              color: enabled
                ? 'var(--admin-accent-strong)'
                : 'var(--admin-text-muted)'
            }}
          >
            <SectionIcon
              type={meta.icon}
            />
          </span>

          <div
            style={{
              minWidth: 0
            }}
          >
            <span
              style={{
                display: 'block',
                marginBottom: '3px',
                color: enabled
                  ? 'var(--admin-accent-strong)'
                  : 'var(--admin-text-muted)',
                fontSize: '7px',
                fontWeight: 850,
                letterSpacing: '.12em',
                textTransform: 'uppercase'
              }}
            >
              {enabled ? 'Visible' : 'Oculta'}
            </span>

            <strong
              style={{
                display: 'block',
                color: 'var(--admin-text)',
                fontSize: '12px',
                fontWeight: 750,
                lineHeight: 1.25
              }}
            >
              {title}
            </strong>
          </div>
        </div>

        <span
          aria-hidden="true"
          style={{
            position: 'relative',
            width: '40px',
            height: '22px',
            flexShrink: 0,
            border: enabled
              ? '1px solid var(--admin-accent)'
              : '1px solid var(--admin-border-strong)',
            borderRadius: '999px',
            background: enabled
              ? 'var(--admin-accent)'
              : 'var(--admin-surface-muted)',
            transition:
              'background 180ms ease, border-color 180ms ease'
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '3px',
              left: enabled ? '20px' : '3px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: enabled
                ? '#ffffff'
                : 'var(--admin-text-muted)',
              boxShadow:
                '0 2px 5px rgba(0, 0, 0, 0.16)',
              transition: 'left 180ms ease'
            }}
          />
        </span>
      </div>

      <p
        style={{
          margin: 0,
          color: 'var(--admin-text-soft)',
          fontSize: '9px',
          lineHeight: 1.6
        }}
      >
        {description}
      </p>
    </button>
  );
}

function GroupSection({
  group,
  sections,
  onToggleSection
}) {
  const enabledInGroup =
    group.options.filter((section) =>
      Boolean(sections[section.key])
    ).length;

  return (
    <section
      style={{
        display: 'grid',
        gap: '16px',
        borderTop:
          '1px solid var(--admin-border)',
        paddingTop: '24px'
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '18px'
        }}
      >
        <div>
          <span
            style={{
              display: 'block',
              marginBottom: '5px',
              color: 'var(--admin-accent-strong)',
              fontSize: '7px',
              fontWeight: 900,
              letterSpacing: '.16em',
              textTransform: 'uppercase'
            }}
          >
            {group.eyebrow}
          </span>

          <h3
            style={{
              margin: 0,
              color: 'var(--admin-text)',
              fontSize: '14px',
              fontWeight: 760,
              letterSpacing: '-.015em'
            }}
          >
            {group.title}
          </h3>

          <p
            style={{
              maxWidth: '660px',
              margin: '5px 0 0',
              color: 'var(--admin-text-soft)',
              fontSize: '9px',
              lineHeight: 1.55
            }}
          >
            {group.description}
          </p>
        </div>

        <span
          style={{
            flexShrink: 0,
            border:
              '1px solid var(--admin-border)',
            borderRadius: '999px',
            padding: '6px 10px',
            background:
              'var(--admin-surface-soft)',
            color:
              enabledInGroup ===
              group.options.length
                ? 'var(--admin-accent-strong)'
                : 'var(--admin-text-muted)',
            fontSize: '7px',
            fontWeight: 800,
            whiteSpace: 'nowrap'
          }}
        >
          {enabledInGroup} / {group.options.length}
        </span>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '12px'
        }}
      >
        {group.options.map((section) => (
          <SectionSwitch
            key={section.key}
            section={section}
            enabled={Boolean(
              sections[section.key]
            )}
            onToggle={onToggleSection}
          />
        ))}
      </div>
    </section>
  );
}

export default function SectionsTab({
  formData,
  activeSectionsCount = 0,
  onToggleSection,
  activateAllSections,
  deactivateAllSections
}) {
  const sections =
    formData?.sections || {};

  const totalSections =
    SECTION_OPTIONS.length;

  const safeActiveSectionsCount =
    Math.min(
      Math.max(
        activeSectionsCount,
        0
      ),
      totalSections
    );

  const inactiveSectionsCount =
    totalSections -
    safeActiveSectionsCount;

  const completionPercentage =
    totalSections > 0
      ? Math.round(
          (safeActiveSectionsCount /
            totalSections) *
            100
        )
      : 0;

  const groupedSections =
    useMemo(() => {
      return SECTION_GROUPS.map(
        (group) => ({
          ...group,

          options:
            group.sections
              .map((sectionKey) =>
                SECTION_OPTIONS.find(
                  (option) =>
                    option.key ===
                    sectionKey
                )
              )
              .filter(Boolean)
        })
      ).filter(
        (group) =>
          group.options.length > 0
      );
    }, []);

  function handleActivateAll() {
    if (
      typeof activateAllSections ===
      'function'
    ) {
      activateAllSections();
    }
  }

  function handleDeactivateAll() {
    if (
      typeof deactivateAllSections ===
      'function'
    ) {
      deactivateAllSections();
    }
  }

  return (
    <div
      className="builder-tab sections-tab"
      style={{
        display: 'grid',
        gap: '28px'
      }}
    >
      {/*
       * =====================================================
       * CABECERA
       * =====================================================
       */}

      <header
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1fr) auto',
          alignItems: 'start',
          gap: '28px'
        }}
      >
        <div>
          <span
            className="section-eyebrow"
            style={{
              display: 'block',
              marginBottom: '7px'
            }}
          >
            Configuración de contenido
          </span>

          <h2
            style={{
              margin: 0,
              color: 'var(--admin-text)',
              fontSize: '24px',
              fontWeight: 790,
              letterSpacing: '-.035em',
              lineHeight: 1.08
            }}
          >
            Secciones de la invitación
          </h2>

          <p
            style={{
              maxWidth: '680px',
              margin: '9px 0 0',
              color: 'var(--admin-text-soft)',
              fontSize: '10px',
              lineHeight: 1.65
            }}
          >
            Decide qué experiencias estarán disponibles para
            los invitados. Puedes ocultarlas sin perder la
            información que ya hayas escrito.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            minWidth: '150px',
            alignItems: 'center',
            gap: '12px',
            border:
              '1px solid var(--admin-border)',
            borderRadius: '16px',
            padding: '12px 15px',
            background:
              'var(--admin-surface-soft)'
          }}
        >
          <strong
            style={{
              color:
                'var(--admin-accent-strong)',
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: 1
            }}
          >
            {safeActiveSectionsCount}
          </strong>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}
          >
            <span
              style={{
                color:
                  'var(--admin-text-muted)',
                fontSize: '7px',
                fontWeight: 750,
                letterSpacing: '.08em',
                textTransform: 'uppercase'
              }}
            >
              de {totalSections}
            </span>

            <span
              style={{
                color:
                  'var(--admin-text-secondary)',
                fontSize: '8px',
                fontWeight: 700
              }}
            >
              visibles
            </span>
          </div>
        </div>
      </header>

      {/*
       * =====================================================
       * CONTROL GENERAL
       * =====================================================
       */}

      <section
        style={{
          display: 'grid',
          gap: '16px',
          border:
            '1px solid var(--admin-border)',
          borderRadius: '20px',
          padding: '18px 20px',
          background:
            'linear-gradient(145deg, var(--admin-surface), var(--admin-surface-soft))',
          boxShadow:
            '0 14px 38px rgba(15, 23, 42, 0.045)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: '20px'
          }}
        >
          <div>
            <span
              style={{
                display: 'block',
                marginBottom: '4px',
                color:
                  'var(--admin-text-muted)',
                fontSize: '7px',
                fontWeight: 850,
                letterSpacing: '.13em',
                textTransform: 'uppercase'
              }}
            >
              Visibilidad general
            </span>

            <strong
              style={{
                color:
                  'var(--admin-text)',
                fontSize: '12px',
                fontWeight: 750
              }}
            >
              {safeActiveSectionsCount ===
              totalSections
                ? 'La experiencia está completa'
                : safeActiveSectionsCount ===
                    0
                  ? 'Todas las secciones están ocultas'
                  : `${safeActiveSectionsCount} secciones visibles`}
            </strong>

            <p
              style={{
                margin: '4px 0 0',
                color:
                  'var(--admin-text-soft)',
                fontSize: '8px'
              }}
            >
              {inactiveSectionsCount === 0
                ? 'Todas las secciones estarán disponibles para los invitados.'
                : `${inactiveSectionsCount} ${
                    inactiveSectionsCount ===
                    1
                      ? 'sección permanece oculta.'
                      : 'secciones permanecen ocultas.'
                  }`}
            </p>
          </div>

          <strong
            style={{
              color:
                'var(--admin-accent-strong)',
              fontSize: '18px',
              fontWeight: 700
            }}
          >
            {completionPercentage}%
          </strong>
        </div>

        <div
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={
            completionPercentage
          }
          aria-label="Porcentaje de secciones visibles"
          style={{
            position: 'relative',
            height: '5px',
            overflow: 'hidden',
            borderRadius: '999px',
            background:
              'var(--admin-surface-muted)'
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: '0 auto 0 0',
              width: `${completionPercentage}%`,
              borderRadius: '999px',
              background:
                'linear-gradient(90deg, var(--admin-accent), var(--admin-accent-bright))',
              transition:
                'width 260ms ease'
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <button
            type="button"
            onClick={
              handleActivateAll
            }
            disabled={
              safeActiveSectionsCount ===
              totalSections
            }
            style={{
              display: 'inline-flex',
              minHeight: '38px',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              border:
                '1px solid var(--admin-accent)',
              borderRadius: '10px',
              padding: '0 14px',
              background:
                safeActiveSectionsCount ===
                totalSections
                  ? 'var(--admin-surface-muted)'
                  : 'var(--admin-accent)',
              color:
                safeActiveSectionsCount ===
                totalSections
                  ? 'var(--admin-text-muted)'
                  : '#ffffff',
              fontSize: '8px',
              fontWeight: 800,
              cursor:
                safeActiveSectionsCount ===
                totalSections
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                safeActiveSectionsCount ===
                totalSections
                  ? 0.55
                  : 1
            }}
          >
            Activar todas
          </button>

          <button
            type="button"
            onClick={
              handleDeactivateAll
            }
            disabled={
              safeActiveSectionsCount ===
              0
            }
            style={{
              display: 'inline-flex',
              minHeight: '38px',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              border:
                '1px solid var(--admin-border)',
              borderRadius: '10px',
              padding: '0 14px',
              background:
                'var(--admin-surface)',
              color:
                safeActiveSectionsCount ===
                0
                  ? 'var(--admin-text-muted)'
                  : 'var(--admin-text-secondary)',
              fontSize: '8px',
              fontWeight: 800,
              cursor:
                safeActiveSectionsCount ===
                0
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                safeActiveSectionsCount ===
                0
                  ? 0.5
                  : 1
            }}
          >
            <PowerIcon />
            Ocultar todas
          </button>
        </div>
      </section>

      {safeActiveSectionsCount ===
        0 && (
        <div
          role="status"
          style={{
            border:
              '1px solid color-mix(in srgb, var(--admin-warning) 30%, var(--admin-border))',
            borderLeft:
              '3px solid var(--admin-warning)',
            borderRadius:
              '0 12px 12px 0',
            padding: '12px 15px',
            background:
              'color-mix(in srgb, var(--admin-warning) 5%, var(--admin-surface))'
          }}
        >
          <strong
            style={{
              display: 'block',
              color:
                'var(--admin-text)',
              fontSize: '9px',
              fontWeight: 750
            }}
          >
            La invitación quedará muy reducida
          </strong>

          <p
            style={{
              margin: '4px 0 0',
              color:
                'var(--admin-text-soft)',
              fontSize: '8px',
              lineHeight: 1.55
            }}
          >
            Todas las secciones están ocultas. Los datos
            permanecen guardados, pero no aparecerán en la
            experiencia pública.
          </p>
        </div>
      )}

      {/*
       * =====================================================
       * GRUPOS
       * =====================================================
       */}

      <div
        style={{
          display: 'grid',
          gap: '30px'
        }}
      >
        {groupedSections.map(
          (group) => (
            <GroupSection
              key={group.key}
              group={group}
              sections={sections}
              onToggleSection={
                onToggleSection
              }
            />
          )
        )}
      </div>

      {/*
       * =====================================================
       * NOTA FINAL
       * =====================================================
       *
       * Sin la "i" suelta.
       */}

      <div
        style={{
          borderTop:
            '1px solid var(--admin-border)',
          paddingTop: '18px'
        }}
      >
        <div
          style={{
            border:
              '1px solid var(--admin-border)',
            borderLeft:
              '3px solid var(--admin-accent)',
            borderRadius:
              '0 13px 13px 0',
            padding: '13px 15px',
            background:
              'var(--admin-surface-soft)'
          }}
        >
          <strong
            style={{
              display: 'block',
              color:
                'var(--admin-text)',
              fontSize: '9px',
              fontWeight: 780
            }}
          >
            Ocultar no significa eliminar
          </strong>

          <p
            style={{
              margin: '4px 0 0',
              color:
                'var(--admin-text-soft)',
              fontSize: '8px',
              lineHeight: 1.6
            }}
          >
            Si desactivas una sección, su información puede
            permanecer guardada. Puedes volver a mostrarla
            posteriormente sin tener que capturar los datos
            nuevamente.
          </p>
        </div>
      </div>
    </div>
  );
}