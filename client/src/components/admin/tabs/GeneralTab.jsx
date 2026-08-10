import React from 'react';

import { getMinimumEventDate } from '../utils/dateUtils';

function SectionStatus({
  enabled,
  enabledText = 'Sección activa',
  disabledText = 'Sección desactivada'
}) {
  return (
    <span
      className={
        enabled
          ? 'status-badge enabled'
          : 'status-badge disabled'
      }
    >
      {enabled ? enabledText : disabledText}
    </span>
  );
}

export default function GeneralTab({
  formData,
  handleChange,
  applyDefaultMessage,
  onToggleSection
}) {
  const locationEnabled = Boolean(
    formData?.sections?.location
  );

  const calendarEnabled = Boolean(
    formData?.sections?.calendar
  );

  const countdownEnabled = Boolean(
    formData?.sections?.countdown
  );

  const minimumEventDate = getMinimumEventDate();

  function toggleSection(sectionKey) {
    if (typeof onToggleSection === 'function') {
      onToggleSection(sectionKey);
    }
  }

  return (
    <div className="builder-tab general-tab">
      <div className="tab-heading">
        <div>
          <span className="section-eyebrow">
            Información principal
          </span>

          <h2>Datos generales de la boda</h2>

          <p>
            Captura los nombres, la fecha, el mensaje principal y la ubicación
            del evento.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="groomName">
            Nombre del novio
            <span className="required-mark" aria-hidden="true">
              *
            </span>
          </label>

          <input
            id="groomName"
            type="text"
            name="groomName"
            value={formData?.groomName || ''}
            onChange={handleChange}
            placeholder="Ejemplo: Manuel"
            autoComplete="off"
            maxLength="120"
            required
          />

          <small>
            Puedes escribir uno o varios nombres.
          </small>
        </div>

        <div className="form-field">
          <label htmlFor="brideName">
            Nombre de la novia
            <span className="required-mark" aria-hidden="true">
              *
            </span>
          </label>

          <input
            id="brideName"
            type="text"
            name="brideName"
            value={formData?.brideName || ''}
            onChange={handleChange}
            placeholder="Ejemplo: Luz"
            autoComplete="off"
            maxLength="120"
            required
          />

          <small>
            Este nombre aparecerá en la portada de la invitación.
          </small>
        </div>

        <div className="form-field form-field-full">
          <div className="field-label-row">
            <label htmlFor="eventDate">
              Fecha y hora de la boda
              <span className="required-mark" aria-hidden="true">
                *
              </span>
            </label>

            <div className="field-status-group">
              <SectionStatus
                enabled={countdownEnabled}
                enabledText="Cuenta regresiva activa"
                disabledText="Cuenta regresiva desactivada"
              />

              <SectionStatus
                enabled={calendarEnabled}
                enabledText="Calendario activo"
                disabledText="Calendario desactivado"
              />
            </div>
          </div>

          <input
            id="eventDate"
            type="datetime-local"
            name="eventDate"
            value={formData?.eventDate || ''}
            onChange={handleChange}
            min={minimumEventDate}
            required
          />

          <small>
            Esta fecha se utilizará para la cuenta regresiva, calendario y
            demás información de la invitación.
          </small>
        </div>

        <div className="form-field form-field-full">
          <div className="field-label-row">
            <label htmlFor="welcomeMessage">
              Mensaje de bienvenida
              <span className="required-mark" aria-hidden="true">
                *
              </span>
            </label>

            {typeof applyDefaultMessage === 'function' && (
              <button
                type="button"
                className="text-button"
                onClick={applyDefaultMessage}
              >
                Usar mensaje predeterminado
              </button>
            )}
          </div>

          <textarea
            id="welcomeMessage"
            name="welcomeMessage"
            rows="6"
            value={formData?.welcomeMessage || ''}
            onChange={handleChange}
            placeholder="Escribe el mensaje que recibirán los invitados al abrir la invitación."
            maxLength="1200"
            required
          />

          <div className="field-counter">
            <small>
              Puedes personalizar este mensaje para cada pareja.
            </small>

            <span>
              {(formData?.welcomeMessage || '').length}/1200
            </span>
          </div>
        </div>
      </div>

      <div className="builder-divider" />

      <section className="builder-subsection">
        <div className="subsection-header">
          <div>
            <span className="section-eyebrow">
              Ubicación
            </span>

            <h3>Lugar donde se realizará el evento</h3>

            <p>
              Aquí puedes guardar el nombre del lugar, la dirección completa y
              el enlace real de Google Maps.
            </p>
          </div>

          <div className="subsection-header-actions">
            <SectionStatus enabled={locationEnabled} />

            {typeof onToggleSection === 'function' && (
              <button
                type="button"
                className={
                  locationEnabled
                    ? 'secondary-button compact-button'
                    : 'primary-button compact-button'
                }
                onClick={() => toggleSection('location')}
              >
                {locationEnabled ? 'Desactivar' : 'Activar'}
              </button>
            )}
          </div>
        </div>

        {!locationEnabled && (
          <div className="inline-notice">
            La ubicación está desactivada. La invitación no mostrará el lugar,
            la dirección ni el botón para abrir Google Maps.
          </div>
        )}

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="venueName">
              Nombre del lugar
              {locationEnabled && (
                <span className="required-mark" aria-hidden="true">
                  *
                </span>
              )}
            </label>

            <input
              id="venueName"
              type="text"
              name="venueName"
              value={formData?.venueName || ''}
              onChange={handleChange}
              placeholder="Ejemplo: Hacienda San José"
              maxLength="120"
              disabled={!locationEnabled}
            />

            <small>
              Escribe el nombre del salón, hacienda, jardín, iglesia o recinto.
            </small>
          </div>

          <div className="form-field">
            <label htmlFor="venueAddress">
              Dirección completa
              {locationEnabled && (
                <span className="required-mark" aria-hidden="true">
                  *
                </span>
              )}
            </label>

            <input
              id="venueAddress"
              type="text"
              name="venueAddress"
              value={formData?.venueAddress || ''}
              onChange={handleChange}
              placeholder="Calle, número, colonia, ciudad y estado"
              maxLength="220"
              disabled={!locationEnabled}
            />

            <small>
              Esta dirección aparecerá escrita dentro de la invitación.
            </small>
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="mapsUrl">
              Enlace de Google Maps
            </label>

            <input
              id="mapsUrl"
              type="url"
              name="mapsUrl"
              value={formData?.mapsUrl || ''}
              onChange={handleChange}
              placeholder="https://maps.app.goo.gl/..."
              disabled={!locationEnabled}
            />

            <small>
              Abre el lugar en Google Maps, pulsa Compartir y pega aquí el
              enlace. Después lo usaremos en el botón “Cómo llegar”.
            </small>
          </div>
        </div>
      </section>
    </div>
  );
}