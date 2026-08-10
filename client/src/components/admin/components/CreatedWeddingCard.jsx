import React from 'react';
import { Link } from 'react-router-dom';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function getCoupleTitle(wedding = {}) {
  const groomName = cleanText(
    wedding.groomName ||
      wedding.novio
  );

  const brideName = cleanText(
    wedding.brideName ||
      wedding.novia
  );

  if (groomName && brideName) {
    return `${groomName} y ${brideName}`;
  }

  return groomName || brideName || 'Invitación creada';
}

function parseWeddingDate(value) {
  const dateValue = cleanText(value);

  if (!dateValue) {
    return null;
  }

  const dateOnlyMatch = dateValue.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (dateOnlyMatch) {
    const [, year, month, day] =
      dateOnlyMatch;

    const parsedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      12,
      0,
      0
    );

    return Number.isNaN(
      parsedDate.getTime()
    )
      ? null
      : parsedDate;
  }

  const parsedDate = new Date(dateValue);

  return Number.isNaN(
    parsedDate.getTime()
  )
    ? null
    : parsedDate;
}

function formatWeddingDate(value) {
  const dateValue = cleanText(value);

  if (!dateValue) {
    return '';
  }

  const parsedDate =
    parseWeddingDate(dateValue);

  if (!parsedDate) {
    return '';
  }

  const hasTime =
    /T\d{2}:\d{2}/.test(dateValue) ||
    /\s\d{2}:\d{2}/.test(dateValue);

  return new Intl.DateTimeFormat(
    'es-MX',
    hasTime
      ? {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      : {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }
  ).format(parsedDate);
}

function getVenueName(wedding = {}) {
  return cleanText(
    wedding.location?.venueName ||
      wedding.venue?.name ||
      wedding.venueName
  );
}

function getVenueAddress(wedding = {}) {
  return cleanText(
    wedding.location?.venueAddress ||
      wedding.venue?.address ||
      wedding.venueAddress
  );
}

function getStatusLabel(status) {
  const normalizedStatus =
    cleanText(status).toLowerCase();

  if (normalizedStatus === 'published') {
    return 'Publicado';
  }

  if (normalizedStatus === 'draft') {
    return 'Borrador';
  }

  return cleanText(status);
}

async function copyText(value) {
  const text = cleanText(value);

  if (!text) {
    return false;
  }

  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard?.writeText
  ) {
    try {
      await navigator.clipboard.writeText(
        text
      );

      return true;
    } catch {
      // Continuamos con el método alternativo.
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const textarea =
      document.createElement('textarea');

    textarea.value = text;
    textarea.setAttribute(
      'readonly',
      ''
    );

    textarea.style.position =
      'fixed';

    textarea.style.left =
      '-9999px';

    textarea.style.opacity = '0';

    document.body.appendChild(
      textarea
    );

    textarea.select();

    const copied =
      document.execCommand('copy');

    textarea.remove();

    return copied;
  } catch {
    return false;
  }
}

export default function CreatedWeddingCard({
  wedding,
  generatedUrl = '',
  onCopyUrl,
  onClose
}) {
  if (
    !wedding ||
    typeof wedding !== 'object'
  ) {
    return null;
  }

  const coupleTitle =
    getCoupleTitle(wedding);

  const slug =
    cleanText(wedding.slug);

  const publicUrl =
    cleanText(generatedUrl);

  const eventDate =
    cleanText(
      wedding.eventDate ||
        wedding.fecha
    );

  const formattedDate =
    formatWeddingDate(eventDate);

  const venueName =
    getVenueName(wedding);

  const venueAddress =
    getVenueAddress(wedding);

  const statusLabel =
    getStatusLabel(
      wedding.status
    );

  const weddingPath = slug
    ? `/boda/${encodeURIComponent(slug)}`
    : '';

  const hasDetails = Boolean(
    statusLabel ||
      slug ||
      formattedDate ||
      venueName ||
      venueAddress
  );

  async function handleCopyUrl() {
    if (!publicUrl) {
      return;
    }

    if (
      typeof onCopyUrl === 'function'
    ) {
      await onCopyUrl();
      return;
    }

    const copied =
      await copyText(publicUrl);

    if (
      !copied &&
      typeof window !== 'undefined'
    ) {
      window.alert(
        'No fue posible copiar el enlace.'
      );
    }
  }

  return (
    <article
      className="created-card"
      aria-labelledby="created-wedding-title"
    >
      <div className="created-card-header">
        <div className="created-card-status">
          <span
            className="created-card-status-icon"
            aria-hidden="true"
          >
            ✓
          </span>

          <div>
            <span className="created-label">
              Invitación creada correctamente
            </span>

            <h2 id="created-wedding-title">
              {coupleTitle}
            </h2>
          </div>
        </div>

        {typeof onClose === 'function' && (
          <button
            type="button"
            className="created-card-close"
            onClick={onClose}
            aria-label="Cerrar información de la invitación"
            title="Cerrar"
          >
            ×
          </button>
        )}
      </div>

      <p className="created-card-description">
        La invitación fue guardada
        correctamente.
        {publicUrl
          ? ' Puedes abrirla o compartir su enlace público.'
          : ''}
      </p>

      {publicUrl && (
        <div className="generated-url">
          <div className="generated-url-content">
            <span className="generated-url-label">
              Enlace público
            </span>

            <span
              className="generated-url-value"
              title={publicUrl}
            >
              {publicUrl}
            </span>
          </div>

          <button
            type="button"
            className="copy-url-button"
            onClick={handleCopyUrl}
          >
            Copiar enlace
          </button>
        </div>
      )}

      {hasDetails && (
        <div className="created-card-details">
          {statusLabel && (
            <div className="created-card-detail">
              <span>Estado</span>

              <strong>
                {statusLabel}
              </strong>
            </div>
          )}

          {slug && (
            <div className="created-card-detail">
              <span>Identificador</span>

              <strong>{slug}</strong>
            </div>
          )}

          {formattedDate && (
            <div className="created-card-detail">
              <span>Fecha</span>

              <strong>
                {formattedDate}
              </strong>
            </div>
          )}

          {venueName && (
            <div className="created-card-detail">
              <span>Lugar</span>

              <strong>
                {venueName}
              </strong>
            </div>
          )}

          {venueAddress && (
            <div className="created-card-detail">
              <span>Dirección</span>

              <strong>
                {venueAddress}
              </strong>
            </div>
          )}
        </div>
      )}

      {(weddingPath || publicUrl) && (
        <div className="created-card-actions">
          {weddingPath && (
            <Link
              className="primary-button"
              to={weddingPath}
              target="_blank"
              rel="noreferrer"
            >
              Abrir invitación
            </Link>
          )}

          {publicUrl && (
            <button
              type="button"
              className="secondary-button"
              onClick={handleCopyUrl}
            >
              Copiar enlace
            </button>
          )}
        </div>
      )}
    </article>
  );
}