import React, { useMemo } from 'react';

import { SECTION_OPTIONS } from '../config/adminConfig';

const SECTION_GROUPS = [
  {
    key: 'main',
    title: 'Información principal',
    description:
      'Secciones relacionadas con la fecha y presentación del evento.',
    sections: ['countdown', 'calendar', 'parents']
  },
  {
    key: 'content',
    title: 'Contenido de la pareja',
    description:
      'Historia, fotografías y actividades personalizadas.',
    sections: ['story', 'gallery', 'itinerary']
  },
  {
    key: 'event',
    title: 'Información del evento',
    description:
      'Lugar, código de vestimenta y opciones de regalos.',
    sections: ['location', 'dressCode', 'gifts']
  },
  {
    key: 'interaction',
    title: 'Experiencia de los invitados',
    description:
      'Música de fondo y libro de firmas para los novios.',
    sections: ['music', 'guestBook']
  }
];

function SectionSwitch({ section, enabled, onToggle }) {
  function handleToggle() {
    if (typeof onToggle === 'function') {
      onToggle(section.key);
    }
  }

  return (
    <button
      type="button"
      className={`section-switch-card ${
        enabled ? 'enabled' : 'disabled'
      }`}
      onClick={handleToggle}
      aria-pressed={enabled}
    >
      <div className="section-switch-information">
        <div className="section-switch-title-row">
          <strong>{section.title}</strong>

          <span
            className={
              enabled
                ? 'status-badge enabled'
                : 'status-badge disabled'
            }
          >
            {enabled ? 'Activa' : 'Desactivada'}
          </span>
        </div>

        <p>{section.description}</p>
      </div>

      <span
        className={`switch-control ${enabled ? 'active' : ''}`}
        aria-hidden="true"
      >
        <span />
      </span>
    </button>
  );
}

export default function SectionsTab({
  formData,
  activeSectionsCount = 0,
  onToggleSection,
  activateAllSections,
  deactivateAllSections
}) {
  const sections = formData?.sections || {};

  const totalSections = SECTION_OPTIONS.length;

  const safeActiveSectionsCount = Math.min(
    Math.max(activeSectionsCount, 0),
    totalSections
  );

  const inactiveSectionsCount =
    totalSections - safeActiveSectionsCount;

  const completionPercentage =
    totalSections > 0
      ? Math.round(
          (safeActiveSectionsCount / totalSections) * 100
        )
      : 0;

  const groupedSections = useMemo(() => {
    return SECTION_GROUPS.map((group) => ({
      ...group,
      options: group.sections
        .map((sectionKey) =>
          SECTION_OPTIONS.find(
            (option) => option.key === sectionKey
          )
        )
        .filter(Boolean)
    })).filter((group) => group.options.length > 0);
  }, []);

  function handleActivateAll() {
    if (typeof activateAllSections === 'function') {
      activateAllSections();
    }
  }

  function handleDeactivateAll() {
    if (typeof deactivateAllSections === 'function') {
      deactivateAllSections();
    }
  }

  return (
    <div className="builder-tab sections-tab">
      <div className="tab-heading section-header-row">
        <div>
          <span className="section-eyebrow">
            Configuración de contenido
          </span>

          <h2>Secciones de la invitación</h2>

          <p>
            Activa únicamente las partes que deseas mostrar. Las
            secciones desactivadas no aparecerán en la invitación
            pública.
          </p>
        </div>

        <div className="sections-summary-card">
          <div className="sections-summary-number">
            <strong>{safeActiveSectionsCount}</strong>

            <span>de {totalSections}</span>
          </div>

          <p>secciones activas</p>
        </div>
      </div>

      <div className="sections-progress">
        <div className="sections-progress-header">
          <div>
            <strong>Configuración actual</strong>

            <span>
              {safeActiveSectionsCount} activas y{' '}
              {inactiveSectionsCount} desactivadas
            </span>
          </div>

          <strong>{completionPercentage}%</strong>
        </div>

        <div
          className="sections-progress-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={completionPercentage}
          aria-label="Porcentaje de secciones activas"
        >
          <span
            style={{
              width: `${completionPercentage}%`
            }}
          />
        </div>
      </div>

      <div className="bulk-actions">
        <button
          type="button"
          className="primary-button compact-button"
          onClick={handleActivateAll}
          disabled={safeActiveSectionsCount === totalSections}
        >
          Activar todas
        </button>

        <button
          type="button"
          className="secondary-button compact-button"
          onClick={handleDeactivateAll}
          disabled={safeActiveSectionsCount === 0}
        >
          Desactivar todas
        </button>
      </div>

      {safeActiveSectionsCount === 0 && (
        <div className="inline-notice warning-notice">
          Todas las secciones están desactivadas. La invitación
          solamente mostrará la portada y el contenido principal.
        </div>
      )}

      <div className="section-groups">
        {groupedSections.map((group) => {
          const enabledInGroup = group.options.filter((section) =>
            Boolean(sections[section.key])
          ).length;

          return (
            <section
              className="section-group"
              key={group.key}
            >
              <div className="section-group-header">
                <div>
                  <h3>{group.title}</h3>

                  <p>{group.description}</p>
                </div>

                <span className="section-group-counter">
                  {enabledInGroup}/{group.options.length} activas
                </span>
              </div>

              <div className="section-switches">
                {group.options.map((section) => (
                  <SectionSwitch
                    key={section.key}
                    section={section}
                    enabled={Boolean(sections[section.key])}
                    onToggle={onToggleSection}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="sections-help-card">
        <div className="sections-help-icon">i</div>

        <div>
          <strong>
            ¿Qué sucede al desactivar una sección?
          </strong>

          <p>
            La información puede permanecer guardada en el formulario,
            pero no se mostrará en la invitación mientras la sección
            esté desactivada.
          </p>
        </div>
      </div>
    </div>
  );
}