import React from 'react';

function SectionStatus({ enabled }) {
  return (
    <span
      className={
        enabled
          ? 'status-badge enabled'
          : 'status-badge disabled'
      }
    >
      {enabled
        ? 'Sección activa'
        : 'Sección desactivada'}
    </span>
  );
}

function ItineraryActivity({
  item,
  index,
  totalItems,
  onChange,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  disabled
}) {
  const activityName =
    item.title?.trim() ||
    `Actividad ${index + 1}`;

  function updateField(field, value) {
    if (typeof onChange === 'function') {
      onChange(item.id, field, value);
    }
  }

  return (
    <article
      className={`itinerary-editor-card ${
        disabled ? 'disabled' : ''
      }`}
    >
      <div className="itinerary-editor-header">
        <div className="itinerary-editor-title">
          <span>
            Actividad {index + 1}
          </span>

          <strong>
            {activityName}
          </strong>
        </div>

        <div className="itinerary-order-actions">
          <button
            type="button"
            className="icon-action-button"
            onClick={() => onMoveUp(index)}
            disabled={
              disabled || index === 0
            }
            aria-label={`Subir ${activityName}`}
            title="Mover hacia arriba"
          >
            ↑
          </button>

          <button
            type="button"
            className="icon-action-button"
            onClick={() => onMoveDown(index)}
            disabled={
              disabled ||
              index === totalItems - 1
            }
            aria-label={`Bajar ${activityName}`}
            title="Mover hacia abajo"
          >
            ↓
          </button>

          <button
            type="button"
            className="secondary-button compact-button"
            onClick={() =>
              onDuplicate(item.id)
            }
            disabled={disabled}
          >
            Duplicar
          </button>

          <button
            type="button"
            className="danger-button compact-button"
            onClick={() =>
              onRemove(item.id)
            }
            disabled={disabled}
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor={`time-${item.id}`}>
            Hora
            {!disabled && (
              <span
                className="required-mark"
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>

          <input
            id={`time-${item.id}`}
            type="time"
            value={item.time || ''}
            onChange={(event) =>
              updateField(
                'time',
                event.target.value
              )
            }
            disabled={disabled}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`title-${item.id}`}>
            Nombre de la actividad
            {!disabled && (
              <span
                className="required-mark"
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>

          <input
            id={`title-${item.id}`}
            type="text"
            value={item.title || ''}
            onChange={(event) =>
              updateField(
                'title',
                event.target.value
              )
            }
            placeholder="Ceremonia, recepción, cena..."
            maxLength="120"
            disabled={disabled}
          />
        </div>

        <div className="form-field form-field-full">
          <label
            htmlFor={`description-${item.id}`}
          >
            Descripción
          </label>

          <textarea
            id={`description-${item.id}`}
            rows="4"
            value={item.description || ''}
            onChange={(event) =>
              updateField(
                'description',
                event.target.value
              )
            }
            placeholder="Describe brevemente lo que sucederá en esta actividad."
            maxLength="500"
            disabled={disabled}
          />

          <div className="field-counter">
            <small>
              Esta descripción es opcional.
            </small>

            <span>
              {(item.description || '').length}
              /500
            </span>
          </div>
        </div>

        <div className="form-field form-field-full">
          <label
            htmlFor={`location-${item.id}`}
          >
            Lugar específico
          </label>

          <input
            id={`location-${item.id}`}
            type="text"
            value={item.location || ''}
            onChange={(event) =>
              updateField(
                'location',
                event.target.value
              )
            }
            placeholder="Ejemplo: Capilla principal, jardín o salón"
            maxLength="180"
            disabled={disabled}
          />
        </div>
      </div>
    </article>
  );
}

export default function ItineraryTab({
  formData,
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
  onToggleSection
}) {
  const itineraryEnabled =
    Boolean(
      formData?.sections?.itinerary
    );

  const totalActivities =
    itinerary.length;

  function handleToggleItinerary() {
    if (
      typeof onToggleSection ===
      'function'
    ) {
      onToggleSection('itinerary');
    }
  }

  function handleAddActivity() {
    if (
      typeof addItineraryItem ===
      'function'
    ) {
      addItineraryItem();
    }
  }

  function handleClearItinerary() {
    if (
      typeof clearItinerary !==
      'function'
    ) {
      return;
    }

    const shouldClear =
      window.confirm(
        '¿Deseas borrar todas las actividades del itinerario?'
      );

    if (shouldClear) {
      clearItinerary();
    }
  }

  return (
    <div className="builder-tab itinerary-tab">
      <div className="tab-heading section-header-row">
        <div>
          <span className="section-eyebrow">
            Programa del evento
          </span>

          <h2>
            Itinerario personalizado
          </h2>

          <p>
            Agrega las actividades de la boda,
            establece sus horarios y cambia el
            orden en que aparecerán.
          </p>
        </div>

        <div className="itinerary-summary-card">
          <strong>
            {completedActivitiesCount}
          </strong>

          <span>
            actividades completas
          </span>
        </div>
      </div>

      <section className="builder-subsection">
        <div className="subsection-header">
          <div>
            <h3>
              Configuración del itinerario
            </h3>

            <p>
              Cada boda puede tener un programa
              diferente o no mostrar itinerario.
            </p>
          </div>

          <div className="subsection-header-actions">
            <SectionStatus
              enabled={itineraryEnabled}
            />

            <button
              type="button"
              className={
                itineraryEnabled
                  ? 'secondary-button compact-button'
                  : 'primary-button compact-button'
              }
              onClick={
                handleToggleItinerary
              }
            >
              {itineraryEnabled
                ? 'Desactivar'
                : 'Activar'}
            </button>
          </div>
        </div>

        {!itineraryEnabled && (
          <div className="inline-notice">
            El itinerario está desactivado. Puedes
            preparar las actividades, pero no
            aparecerán en la invitación hasta que
            vuelvas a activar esta sección.
          </div>
        )}
      </section>

      <div className="itinerary-statistics">
        <div className="itinerary-statistic">
          <span>
            Actividades creadas
          </span>

          <strong>
            {totalActivities}
          </strong>
        </div>

        <div className="itinerary-statistic">
          <span>
            Actividades completas
          </span>

          <strong>
            {completedActivitiesCount}
          </strong>
        </div>

        <div className="itinerary-statistic">
          <span>
            Estado
          </span>

          <strong
            className={
              hasValidActivity
                ? 'valid-text'
                : 'warning-text'
            }
          >
            {hasValidActivity
              ? 'Listo'
              : 'Incompleto'}
          </strong>
        </div>
      </div>

      <div className="itinerary-toolbar">
        <button
          type="button"
          className="primary-button compact-button"
          onClick={handleAddActivity}
          disabled={!itineraryEnabled}
        >
          + Agregar actividad
        </button>

        <button
          type="button"
          className="secondary-button compact-button"
          onClick={sortItineraryByTime}
          disabled={
            !itineraryEnabled ||
            itinerary.length < 2
          }
        >
          Ordenar por hora
        </button>

        <button
          type="button"
          className="danger-button compact-button"
          onClick={handleClearItinerary}
          disabled={
            !itineraryEnabled ||
            itinerary.length === 0
          }
        >
          Limpiar itinerario
        </button>
      </div>

      {!hasValidActivity &&
        itineraryEnabled && (
          <div className="inline-notice warning-notice">
            Debes agregar al menos una actividad
            con hora y nombre para poder crear la
            invitación.
          </div>
        )}

      <div className="itinerary-list">
        {itinerary.map((item, index) => (
          <ItineraryActivity
            key={item.id}
            item={item}
            index={index}
            totalItems={
              itinerary.length
            }
            onChange={
              handleItineraryChange
            }
            onRemove={
              removeItineraryItem
            }
            onDuplicate={
              duplicateItineraryItem
            }
            onMoveUp={
              moveItineraryItemUp
            }
            onMoveDown={
              moveItineraryItemDown
            }
            disabled={!itineraryEnabled}
          />
        ))}
      </div>

      {itineraryEnabled && (
        <button
          type="button"
          className="add-item-button"
          onClick={handleAddActivity}
        >
          <span aria-hidden="true">
            +
          </span>

          Agregar otra actividad
        </button>
      )}

      <div className="sections-help-card">
        <div
          className="sections-help-icon"
          aria-hidden="true"
        >
          i
        </div>

        <div>
          <strong>
            Recomendación
          </strong>

          <p>
            Agrega primero las actividades y
            después utiliza “Ordenar por hora”.
            También puedes moverlas manualmente
            con las flechas.
          </p>
        </div>
      </div>
    </div>
  );
}