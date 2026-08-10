import React, { useEffect, useMemo, useState } from 'react';

const DEFAULT_THEME = {
  primaryColor: '#9b7b6b',
  secondaryColor: '#d6b89c',
  backgroundColor: '#fffaf6',
  textColor: '#2f2925'
};

function getValidColor(value, fallback) {
  if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }
  return fallback;
}

function getEventDateLabel(eventDate, previewDate) {
  if (previewDate) {
    return previewDate;
  }
  if (!eventDate) {
    return 'Fecha pendiente';
  }

  const parsedDate = new Date(eventDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Fecha pendiente';
  }

  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsedDate);
}

function getTimeLabel(timeValue) {
  if (!timeValue) {
    return '';
  }

  const [hourString, minuteString] = timeValue.split(':');
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return timeValue;
  }

  const temporaryDate = new Date();
  temporaryDate.setHours(hour, minute, 0, 0);

  return new Intl.DateTimeFormat('es-MX', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(temporaryDate);
}

function calculateCountdown(eventDate) {
  if (!eventDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: false, valid: false };
  }

  const targetDate = new Date(eventDate);
  const difference = targetDate.getTime() - Date.now();

  if (Number.isNaN(targetDate.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: false, valid: false };
  }

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true, valid: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    finished: false,
    valid: true
  };
}

function PreviewSection({ eyebrow, title, children, className = '' }) {
  return (
    <section className={`invitation-preview-section ${className}`.trim()}>
      {eyebrow && <span className="invitation-preview-eyebrow">{eyebrow}</span>}
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
}

function CountdownItem({ value, label }) {
  return (
    <div className="preview-countdown-item">
      <strong>{String(value).padStart(2, '0')}</strong>
      <span>{label}</span>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="preview-summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function PreviewTab({
  formData = {},
  media = {},
  itinerary = [],
  previewDate = '',
  builderSummary = {},
  loading = false,
  onEdit,
  onCreateInvitation
}) {
  const [countdown, setCountdown] = useState(() => calculateCountdown(formData.eventDate));

  useEffect(() => {
    setCountdown(calculateCountdown(formData.eventDate));

    const intervalId = window.setInterval(() => {
      setCountdown(calculateCountdown(formData.eventDate));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [formData.eventDate]);

  const sections = formData.sections || {};

  const theme = useMemo(() => {
    const configuredTheme = formData.theme || {};
    return {
      primaryColor: getValidColor(configuredTheme.primaryColor, DEFAULT_THEME.primaryColor),
      secondaryColor: getValidColor(configuredTheme.secondaryColor, DEFAULT_THEME.secondaryColor),
      backgroundColor: getValidColor(configuredTheme.backgroundColor, DEFAULT_THEME.backgroundColor),
      textColor: getValidColor(configuredTheme.textColor, DEFAULT_THEME.textColor)
    };
  }, [formData.theme]);

  const groomName = formData.groomName?.trim() || 'Nombre del novio';
  const brideName = formData.brideName?.trim() || 'Nombre de la novia';
  const eventDateLabel = getEventDateLabel(formData.eventDate, previewDate);
  const coverImage = media.coverImage?.previewUrl || '';
  const coupleImage = media.coupleImage?.previewUrl || '';
  const backgroundMusic = media.backgroundMusic?.previewUrl || '';
  const gallery = Array.isArray(media.gallery) ? media.gallery : [];
  const validItinerary = Array.isArray(itinerary) ? itinerary.filter((item) => item?.time || item?.title) : [];

  const parentNames = [
    formData.groomFather,
    formData.groomMother,
    formData.brideFather,
    formData.brideMother
  ].filter((name) => typeof name === 'string' && name.trim());

  const previewStyles = {
    '--preview-primary': theme.primaryColor,
    '--preview-secondary': theme.secondaryColor,
    '--preview-background': theme.backgroundColor,
    '--preview-text': theme.textColor,
    backgroundColor: theme.backgroundColor,
    color: theme.textColor
  };

  function handleEdit() {
    if (typeof onEdit === 'function') onEdit();
  }

  function handleCreate(event) {
    if (typeof onCreateInvitation === 'function') onCreateInvitation(event);
  }

  return (
    <div className="builder-tab preview-tab">
      <div className="tab-heading section-header-row">
        <div>
          <span className="section-eyebrow">Revisión final</span>
          <h2>Vista previa de la invitación</h2>
          <p>
            Revisa cómo se verá la invitación antes de crearla. Solo aparecen las
            secciones que se encuentran activas.
          </p>
        </div>

        <div className="preview-header-actions">
          <button
            type="button"
            className="secondary-button compact-button"
            onClick={handleEdit}
          >
            Editar información
          </button>
          <button
            type="button"
            className="primary-button compact-button"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Creando invitación...' : 'Crear invitación'}
          </button>
        </div>
      </div>

      <div className="preview-workspace">
        <aside className="preview-summary-panel">
          <div className="preview-summary-header">
            <span className="section-eyebrow">Resumen</span>
            <h3>Configuración actual</h3>
          </div>

          <div className="preview-summary-list">
            <SummaryItem label="Secciones activas" value={builderSummary.activeSections ?? 0} />
            <SummaryItem label="Actividades" value={builderSummary.itineraryActivities ?? 0} />
            <SummaryItem label="Archivos" value={builderSummary.selectedMedia ?? 0} />
            <SummaryItem label="Fotografías" value={builderSummary.galleryImages ?? 0} />
          </div>

          <div className="preview-couple-summary">
            <span>Invitación de</span>
            <strong>{groomName} y {brideName}</strong>
            <small>{eventDateLabel}</small>
          </div>

          <div className="preview-theme-summary">
            <span>Colores seleccionados</span>
            <div>
              {Object.values(theme).map((color, index) => (
                <span
                  key={`${color}-${index}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="inline-notice">
            Esta es una representación previa. El diseño público puede adaptarse
            automáticamente al tamaño del celular, tableta o computadora.
          </div>
        </aside>

        <div className="invitation-device-frame">
          <div className="invitation-device-top">
            <span />
            <span />
            <span />
          </div>

          <div className="invitation-preview" style={previewStyles}>
            <section
              className={`invitation-preview-hero ${coverImage ? 'with-image' : ''}`}
              style={
                coverImage
                  ? {
                      backgroundImage: `linear-gradient(rgba(25, 20, 18, 0.28), rgba(25, 20, 18, 0.56)), url("${coverImage}")`
                    }
                  : undefined
              }
            >
              <div className="invitation-preview-hero-content">
                <span>Nos casamos</span>
                <h1>
                  {groomName}
                  <small>&</small>
                  {brideName}
                </h1>
                <p>{eventDateLabel}</p>
              </div>
            </section>

            <section className="invitation-preview-welcome">
              <span className="preview-decoration">♡</span>
              <p>
                {formData.welcomeMessage || 'Nos llena de alegría compartir este momento contigo.'}
              </p>
            </section>

            {sections.countdown && countdown.valid && (
              <PreviewSection
                eyebrow="Falta muy poco"
                title={countdown.finished ? '¡El gran día ha llegado!' : 'Cuenta regresiva'}
                className="countdown-preview-section"
              >
                {!countdown.finished && (
                  <div className="preview-countdown">
                    <CountdownItem value={countdown.days} label="Días" />
                    <CountdownItem value={countdown.hours} label="Horas" />
                    <CountdownItem value={countdown.minutes} label="Minutos" />
                    <CountdownItem value={countdown.seconds} label="Segundos" />
                  </div>
                )}
              </PreviewSection>
            )}

            {sections.calendar && (
              <PreviewSection eyebrow="Guarda la fecha" title={eventDateLabel} className="calendar-preview-section">
                <button type="button">Agregar al calendario</button>
              </PreviewSection>
            )}

            {sections.parents && parentNames.length > 0 && (
              <PreviewSection eyebrow="Con la bendición de nuestros padres" title="Nuestras familias">
                <div className="preview-parents-grid">
                  {(formData.groomFather || formData.groomMother) && (
                    <div>
                      <span>Familia del novio</span>
                      {formData.groomFather && <strong>{formData.groomFather}</strong>}
                      {formData.groomMother && <strong>{formData.groomMother}</strong>}
                    </div>
                  )}
                  {(formData.brideFather || formData.brideMother) && (
                    <div>
                      <span>Familia de la novia</span>
                      {formData.brideFather && <strong>{formData.brideFather}</strong>}
                      {formData.brideMother && <strong>{formData.brideMother}</strong>}
                    </div>
                  )}
                </div>
              </PreviewSection>
            )}

            {sections.story && (
              <PreviewSection eyebrow="La pareja" title={formData.storyTitle || 'Nuestra historia'}>
                {coupleImage && (
                  <img
                    className="preview-couple-image"
                    src={coupleImage}
                    alt={`${groomName} y ${brideName}`}
                  />
                )}
                <p className="preview-section-text">
                  {formData.storyText || 'Aquí aparecerá la historia especial de la pareja.'}
                </p>
              </PreviewSection>
            )}

            {sections.gallery && gallery.length > 0 && (
              <PreviewSection eyebrow="Nuestros recuerdos" title="Galería">
                <div className="preview-gallery-grid">
                  {gallery.map((image, index) => (
                    <img
                      key={image.id || index}
                      src={image.previewUrl}
                      alt={`Recuerdo ${index + 1}`}
                    />
                  ))}
                </div>
              </PreviewSection>
            )}

            {sections.itinerary && validItinerary.length > 0 && (
              <PreviewSection eyebrow="Programa" title="Itinerario">
                <div className="preview-itinerary">
                  {validItinerary.map((item, index) => (
                    <article key={item.id || index}>
                      <div className="preview-itinerary-time">
                        {getTimeLabel(item.time) || '--:--'}
                      </div>
                      <div className="preview-itinerary-content">
                        <strong>{item.title || `Actividad ${index + 1}`}</strong>
                        {item.description && <p>{item.description}</p>}
                        {item.location && <span>{item.location}</span>}
                      </div>
                    </article>
                  ))}
                </div>
              </PreviewSection>
            )}

            {sections.location && (
              <PreviewSection eyebrow="Ubicación" title={formData.venueName || 'Lugar del evento'}>
                <p className="preview-section-text">
                  {formData.venueAddress || 'La dirección aparecerá aquí.'}
                </p>
                {formData.mapsUrl ? (
                  <a
                    className="preview-primary-link"
                    href={formData.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir en Google Maps
                  </a>
                ) : (
                  <button type="button" disabled>Ver ubicación</button>
                )}
              </PreviewSection>
            )}

            {sections.dressCode && (
              <PreviewSection eyebrow="Vestimenta" title={formData.dressCodeTitle || 'Código de vestimenta'}>
                <div className="preview-dress-code">
                  {formData.dressCodeWomen && (
                    <div>
                      <span>Mujeres</span>
                      <strong>{formData.dressCodeWomen}</strong>
                    </div>
                  )}
                  {formData.dressCodeMen && (
                    <div>
                      <span>Hombres</span>
                      <strong>{formData.dressCodeMen}</strong>
                    </div>
                  )}
                </div>
                {formData.dressCodeNotes && (
                  <p className="preview-section-text">{formData.dressCodeNotes}</p>
                )}
              </PreviewSection>
            )}

            {sections.gifts && (
              <PreviewSection eyebrow="Obsequios" title="Mesa de regalos">
                <p className="preview-section-text">
                  {formData.giftMessage || 'Tu presencia es nuestro mejor regalo.'}
                </p>
                {(formData.bankName || formData.accountHolder || formData.accountNumber || formData.clabe) && (
                  <div className="preview-bank-card">
                    {formData.bankName && (
                      <div>
                        <span>Banco</span>
                        <strong>{formData.bankName}</strong>
                      </div>
                    )}
                    {formData.accountHolder && (
                      <div>
                        <span>Titular</span>
                        <strong>{formData.accountHolder}</strong>
                      </div>
                    )}
                    {formData.accountNumber && (
                      <div>
                        <span>Cuenta</span>
                        <strong>{formData.accountNumber}</strong>
                      </div>
                    )}
                    {formData.clabe && (
                      <div>
                        <span>CLABE</span>
                        <strong>{formData.clabe}</strong>
                      </div>
                    )}
                  </div>
                )}
              </PreviewSection>
            )}

            {sections.rsvp && (
              <PreviewSection eyebrow="Confirma tu asistencia" title="RSVP">
                <p className="preview-section-text">
                  {formData.rsvpMessage || 'Por favor, confirma tu asistencia para acompañarnos en este día tan especial.'}
                </p>
                {formData.rsvpDeadline && (
                  <small className="preview-rsvp-deadline">
                    Fecha límite:{' '}
                    {new Intl.DateTimeFormat('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }).format(new Date(`${formData.rsvpDeadline}T12:00:00`))}
                  </small>
                )}
                <button type="button">Confirmar asistencia</button>
              </PreviewSection>
            )}

            {sections.music && backgroundMusic && (
              <PreviewSection eyebrow="Nuestra canción" title="Música">
                <audio controls preload="metadata" src={backgroundMusic}>
                  Tu navegador no puede reproducir este audio.
                </audio>
              </PreviewSection>
            )}

            {sections.guestBook && (
              <PreviewSection eyebrow="Buenos deseos" title={formData.guestBookTitle || 'Déjanos un mensaje'}>
                <textarea rows="4" placeholder="Escribe un mensaje para los novios..." readOnly />
                <button type="button">Enviar mensaje</button>
              </PreviewSection>
            )}

            <footer className="invitation-preview-footer">
              <span>♡</span>
              <strong>{groomName} & {brideName}</strong>
              <p>Gracias por formar parte de nuestra historia.</p>
            </footer>
          </div>
        </div>
      </div>

      <div className="preview-bottom-actions">
        <button type="button" className="secondary-button" onClick={handleEdit}>
          Regresar a editar
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? 'Creando invitación...' : 'Crear y publicar invitación'}
        </button>
      </div>
    </div>
  );
}