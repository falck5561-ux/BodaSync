import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function getCoupleTitle(wedding = {}) {
  const groomName = cleanText(
    wedding.groomName || wedding.novio
  );

  const brideName = cleanText(
    wedding.brideName || wedding.novia
  );

  if (groomName && brideName) {
    return `${groomName} & ${brideName}`;
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
    const [, year, month, day] = dateOnlyMatch;

    const parsedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      12,
      0,
      0
    );

    return Number.isNaN(parsedDate.getTime())
      ? null
      : parsedDate;
  }

  const parsedDate = new Date(dateValue);

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
}

function formatWeddingDate(value) {
  const dateValue = cleanText(value);

  if (!dateValue) {
    return '';
  }

  const parsedDate = parseWeddingDate(dateValue);

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
  const normalizedStatus = cleanText(status).toLowerCase();

  if (normalizedStatus === 'published') {
    return 'Publicada';
  }

  if (normalizedStatus === 'draft') {
    return 'Borrador';
  }

  return cleanText(status) || 'Publicada';
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
      await navigator.clipboard.writeText(text);

      return true;
    } catch {
      // Usamos el método alternativo.
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const textarea = document.createElement('textarea');

    textarea.value = text;
    textarea.setAttribute('readonly', '');

    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);

    textarea.select();

    const copied = document.execCommand('copy');

    textarea.remove();

    return copied;
  } catch {
    return false;
  }
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="20"
      height="20"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CopyIcon() {
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
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function ExternalIcon() {
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
      <path d="M15 4h5v5" />
      <path d="m10 14 10-10" />
      <path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="16"
      height="16"
    >
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="16"
      height="16"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="16"
      height="16"
    >
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" />
    </svg>
  );
}

function DetailCard({
  icon,
  label,
  value,
  wide = false
}) {
  if (!value) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        minWidth: 0,
        gridColumn: wide ? '1 / -1' : 'auto',
        alignItems: 'flex-start',
        gap: '11px',
        border: '1px solid var(--admin-border)',
        borderRadius: '13px',
        padding: '12px 13px',
        background: 'var(--admin-surface-soft)'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'grid',
          width: '34px',
          height: '34px',
          flexShrink: 0,
          placeItems: 'center',
          border: '1px solid var(--admin-border)',
          borderRadius: '10px',
          background: 'var(--admin-surface)',
          color: 'var(--admin-accent)'
        }}
      >
        {icon}
      </span>

      <div
        style={{
          minWidth: 0
        }}
      >
        <span
          style={{
            display: 'block',
            marginBottom: '4px',
            color: 'var(--admin-text-muted)',
            fontSize: '7px',
            fontWeight: 850,
            letterSpacing: '.1em',
            textTransform: 'uppercase'
          }}
        >
          {label}
        </span>

        <strong
          title={value}
          style={{
            display: 'block',
            overflow: 'hidden',
            color: 'var(--admin-text)',
            fontSize: '9px',
            fontWeight: 720,
            lineHeight: 1.45,
            textOverflow: 'ellipsis'
          }}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}

export default function CreatedWeddingCard({
  wedding,
  generatedUrl = '',
  onCopyUrl,
  onClose
}) {
  const [copied, setCopied] = useState(false);

  if (!wedding || typeof wedding !== 'object') {
    return null;
  }

  const coupleTitle = getCoupleTitle(wedding);

  const slug = cleanText(wedding.slug);

  const publicUrl = cleanText(generatedUrl);

  const eventDate = cleanText(
    wedding.eventDate || wedding.fecha
  );

  const formattedDate = formatWeddingDate(eventDate);

  const venueName = getVenueName(wedding);
  const venueAddress = getVenueAddress(wedding);

  const statusLabel = getStatusLabel(wedding.status);

  const weddingPath = slug
    ? `/boda/${encodeURIComponent(slug)}`
    : '';

  async function handleCopyUrl() {
    if (!publicUrl) {
      return;
    }

    let success = false;

    if (typeof onCopyUrl === 'function') {
      try {
        await onCopyUrl();
        success = true;
      } catch {
        success = false;
      }
    } else {
      success = await copyText(publicUrl);
    }

    if (!success) {
      return;
    }

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <article
      aria-labelledby="created-wedding-title"
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--admin-border)',
        borderRadius: '22px',
        background:
          'linear-gradient(145deg, var(--admin-surface), var(--admin-surface-soft))',
        boxShadow:
          '0 24px 70px rgba(0, 0, 0, 0.12)'
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'var(--admin-accent)',
          opacity: 0.055
        }}
      />

      <header
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '24px 24px 19px'
        }}
      >
        <div
          style={{
            display: 'flex',
            minWidth: 0,
            alignItems: 'flex-start',
            gap: '15px'
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'grid',
              width: '46px',
              height: '46px',
              flexShrink: 0,
              placeItems: 'center',
              border:
                '1px solid color-mix(in srgb, var(--admin-success) 45%, var(--admin-border))',
              borderRadius: '14px',
              background:
                'color-mix(in srgb, var(--admin-success) 10%, var(--admin-surface))',
              color: 'var(--admin-success)'
            }}
          >
            <CheckIcon />
          </span>

          <div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px'
              }}
            >
              <span
                style={{
                  color: 'var(--admin-success)',
                  fontSize: '7px',
                  fontWeight: 900,
                  letterSpacing: '.14em',
                  textTransform: 'uppercase'
                }}
              >
                Publicación completada
              </span>

              <span
                style={{
                  border:
                    '1px solid color-mix(in srgb, var(--admin-success) 32%, var(--admin-border))',
                  borderRadius: '999px',
                  padding: '4px 8px',
                  background:
                    'color-mix(in srgb, var(--admin-success) 7%, var(--admin-surface))',
                  color: 'var(--admin-success)',
                  fontSize: '6px',
                  fontWeight: 850,
                  textTransform: 'uppercase'
                }}
              >
                {statusLabel}
              </span>
            </div>

            <h2
              id="created-wedding-title"
              style={{
                margin: 0,
                color: 'var(--admin-text)',
                fontSize: '23px',
                fontWeight: 790,
                letterSpacing: '-.03em',
                lineHeight: 1.1
              }}
            >
              {coupleTitle}
            </h2>

            <p
              style={{
                maxWidth: '680px',
                margin: '8px 0 0',
                color: 'var(--admin-text-soft)',
                fontSize: '9px',
                lineHeight: 1.65
              }}
            >
              La invitación está lista para compartir con los invitados.
              Puedes abrirla ahora o copiar su enlace público.
            </p>
          </div>
        </div>

        {typeof onClose === 'function' && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar información de la invitación"
            title="Cerrar"
            style={{
              display: 'grid',
              width: '36px',
              height: '36px',
              flexShrink: 0,
              placeItems: 'center',
              border: '1px solid var(--admin-border)',
              borderRadius: '10px',
              background: 'var(--admin-surface)',
              color: 'var(--admin-text-muted)',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        )}
      </header>

      {publicUrl && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            margin: '0 24px',
            border: '1px solid var(--admin-border)',
            borderRadius: '15px',
            padding: '13px 14px',
            background: 'var(--admin-surface)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div
              style={{
                display: 'flex',
                minWidth: '180px',
                flex: '1 1 420px',
                alignItems: 'center',
                gap: '11px'
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'grid',
                  width: '35px',
                  height: '35px',
                  flexShrink: 0,
                  placeItems: 'center',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '10px',
                  background: 'var(--admin-surface-soft)',
                  color: 'var(--admin-accent)'
                }}
              >
                <LinkIcon />
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
                    color: 'var(--admin-text-muted)',
                    fontSize: '6px',
                    fontWeight: 900,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase'
                  }}
                >
                  Enlace público
                </span>

                <span
                  title={publicUrl}
                  style={{
                    display: 'block',
                    overflow: 'hidden',
                    color: 'var(--admin-text)',
                    fontSize: '9px',
                    fontWeight: 700,
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {publicUrl}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyUrl}
              style={{
                display: 'inline-flex',
                minHeight: '38px',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                border: '1px solid var(--admin-border)',
                borderRadius: '10px',
                padding: '0 13px',
                background: copied
                  ? 'color-mix(in srgb, var(--admin-success) 9%, var(--admin-surface))'
                  : 'var(--admin-surface-soft)',
                color: copied
                  ? 'var(--admin-success)'
                  : 'var(--admin-text-secondary)',
                fontSize: '8px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {copied ? (
                <>
                  <CheckIcon />
                  Copiado
                </>
              ) : (
                <>
                  <CopyIcon />
                  Copiar enlace
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '10px',
          padding: '18px 24px'
        }}
      >
        {formattedDate && (
          <DetailCard
            icon={<CalendarIcon />}
            label="Fecha"
            value={formattedDate}
          />
        )}

        {venueName && (
          <DetailCard
            icon={<LocationIcon />}
            label="Lugar"
            value={venueName}
          />
        )}

        {slug && (
          <DetailCard
            icon={<LinkIcon />}
            label="Identificador"
            value={slug}
          />
        )}

        {venueAddress && (
          <DetailCard
            icon={<LocationIcon />}
            label="Dirección"
            value={venueAddress}
          />
        )}
      </div>

      {(weddingPath || publicUrl) && (
        <footer
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '9px',
            borderTop: '1px solid var(--admin-border)',
            padding: '16px 24px 18px',
            background: 'var(--admin-surface-soft)'
          }}
        >
          {weddingPath && (
            <Link
              to={weddingPath}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                minHeight: '42px',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid var(--admin-accent)',
                borderRadius: '11px',
                padding: '0 16px',
                background: 'var(--admin-accent)',
                color: '#ffffff',
                fontSize: '8px',
                fontWeight: 850,
                textDecoration: 'none'
              }}
            >
              Abrir invitación
              <ExternalIcon />
            </Link>
          )}

          {publicUrl && (
            <button
              type="button"
              onClick={handleCopyUrl}
              style={{
                display: 'inline-flex',
                minHeight: '42px',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid var(--admin-border)',
                borderRadius: '11px',
                padding: '0 16px',
                background: 'var(--admin-surface)',
                color: 'var(--admin-text-secondary)',
                fontSize: '8px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <CopyIcon />
              {copied ? 'Enlace copiado' : 'Copiar enlace'}
            </button>
          )}
        </footer>
      )}
    </article>
  );
}