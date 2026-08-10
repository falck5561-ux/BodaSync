import React from 'react';

import {
  MAX_AUDIO_SIZE,
  MAX_GALLERY_IMAGES,
  MAX_IMAGE_SIZE,
  formatFileSize
} from '../utils/mediaUtils';

const IMAGE_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

const AUDIO_ACCEPT =
  '.mp3,.wav,.m4a,.aac,.ogg,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg';

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="20"
      height="20"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m5 18 5-5 3 3 2-2 4 4" />
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="20"
      height="20"
    >
      <path d="M9 18V6l10-2v12" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
      width="16"
      height="16"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="15"
      height="15"
    >
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="m7 7 1 13h8l1-13" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function ReplaceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="15"
      height="15"
    >
      <path d="M20 7h-6V1" />
      <path d="M20 7a8 8 0 1 0 1 8" />
    </svg>
  );
}

function ArrowIcon({ direction = 'left' }) {
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
      style={{
        transform:
          direction === 'right'
            ? 'rotate(180deg)'
            : 'none'
      }}
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function getButtonStyle(
  variant = 'secondary',
  disabled = false
) {
  const styles = {
    primary: {
      border: '1px solid var(--admin-accent)',
      background: 'var(--admin-accent)',
      color: '#ffffff'
    },

    secondary: {
      border: '1px solid var(--admin-border)',
      background: 'var(--admin-surface)',
      color: 'var(--admin-text-secondary)'
    },

    danger: {
      border: '1px solid var(--admin-border)',
      background: 'var(--admin-surface)',
      color: 'var(--admin-danger)'
    }
  };

  return {
    display: 'inline-flex',
    minHeight: '38px',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    borderRadius: '10px',
    padding: '0 13px',
    fontSize: '8px',
    fontWeight: 800,
    lineHeight: 1,
    cursor: disabled
      ? 'not-allowed'
      : 'pointer',
    opacity: disabled ? 0.42 : 1,
    transition:
      'border-color 180ms ease, background 180ms ease, opacity 180ms ease, transform 180ms ease',
    ...styles[variant]
  };
}

function FileInformation({
  mediaItem,
  compact = false
}) {
  if (!mediaItem) {
    return null;
  }

  const fileName =
    mediaItem.name ||
    'Archivo seleccionado';

  const fileSize =
    mediaItem.formattedSize ||
    'Tamaño no disponible';

  return (
    <div
      style={{
        minWidth: 0
      }}
    >
      <strong
        title={fileName}
        style={{
          display: 'block',
          overflow: 'hidden',
          color: 'var(--admin-text)',
          fontSize: compact ? '8px' : '9px',
          fontWeight: 750,
          lineHeight: 1.35,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {fileName}
      </strong>

      <span
        style={{
          display: 'block',
          marginTop: '4px',
          color: 'var(--admin-text-muted)',
          fontSize: compact ? '7px' : '8px',
          lineHeight: 1.3
        }}
      >
        {fileSize}
      </span>
    </div>
  );
}

function VisibilityToggle({
  enabled,
  label,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={enabled}
      style={{
        display: 'inline-flex',
        minHeight: '38px',
        alignItems: 'center',
        gap: '10px',
        border: '1px solid var(--admin-border)',
        borderRadius: '999px',
        padding: '0 11px 0 13px',
        background: 'var(--admin-surface)',
        color: enabled
          ? 'var(--admin-text)'
          : 'var(--admin-text-muted)',
        cursor: 'pointer'
      }}
    >
      <span
        style={{
          fontSize: '8px',
          fontWeight: 750,
          whiteSpace: 'nowrap'
        }}
      >
        {label}
      </span>

      <span
        aria-hidden="true"
        style={{
          position: 'relative',
          width: '34px',
          height: '19px',
          flexShrink: 0,
          border: enabled
            ? '1px solid var(--admin-accent)'
            : '1px solid var(--admin-border-strong)',
          borderRadius: '999px',
          background: enabled
            ? 'var(--admin-accent)'
            : 'var(--admin-surface-muted)',
          transition: 'all 180ms ease'
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: enabled ? '17px' : '3px',
            width: '11px',
            height: '11px',
            borderRadius: '50%',
            background: enabled
              ? '#ffffff'
              : 'var(--admin-text-muted)',
            boxShadow:
              '0 2px 4px rgba(0,0,0,.18)',
            transition: 'left 180ms ease'
          }}
        />
      </span>
    </button>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action
}) {
  return (
    <header
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '18px',
        marginBottom: '20px'
      }}
    >
      <div
        style={{
          minWidth: 0,
          flex: '1 1 420px'
        }}
      >
        <span
          style={{
            display: 'block',
            marginBottom: '6px',
            color: 'var(--admin-accent-strong)',
            fontSize: '7px',
            fontWeight: 900,
            letterSpacing: '.15em',
            textTransform: 'uppercase'
          }}
        >
          {eyebrow}
        </span>

        <h3
          style={{
            margin: 0,
            color: 'var(--admin-text)',
            fontSize: '15px',
            fontWeight: 780,
            letterSpacing: '-.018em'
          }}
        >
          {title}
        </h3>

        {description && (
          <p
            style={{
              maxWidth: '700px',
              margin: '6px 0 0',
              color: 'var(--admin-text-soft)',
              fontSize: '9px',
              lineHeight: 1.6
            }}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <div
          style={{
            flexShrink: 0
          }}
        >
          {action}
        </div>
      )}
    </header>
  );
}

function SectionShell({
  children
}) {
  return (
    <section
      style={{
        overflow: 'hidden',
        border: '1px solid var(--admin-border)',
        borderRadius: '20px',
        padding: '22px',
        background:
          'linear-gradient(145deg, var(--admin-surface), var(--admin-surface-soft))',
        boxShadow:
          '0 14px 40px rgba(15, 23, 42, 0.04)'
      }}
    >
      {children}
    </section>
  );
}

function ImageUploadCard({
  eyebrow,
  title,
  description,
  mediaItem,
  inputId,
  onChange,
  onRemove,
  recommendedSize
}) {
  const hasImage = Boolean(
    mediaItem?.previewUrl
  );

  return (
    <article
      style={{
        display: 'grid',
        overflow: 'hidden',
        border:
          '1px solid var(--admin-border)',
        borderRadius: '17px',
        background:
          'var(--admin-surface)'
      }}
    >
      <header
        style={{
          minHeight: '94px',
          padding: '16px 17px 13px'
        }}
      >
        <span
          style={{
            display: 'block',
            marginBottom: '5px',
            color:
              'var(--admin-accent-strong)',
            fontSize: '7px',
            fontWeight: 900,
            letterSpacing: '.13em',
            textTransform: 'uppercase'
          }}
        >
          {eyebrow}
        </span>

        <h4
          style={{
            margin: 0,
            color: 'var(--admin-text)',
            fontSize: '12px',
            fontWeight: 760
          }}
        >
          {title}
        </h4>

        <p
          style={{
            margin: '5px 0 0',
            color: 'var(--admin-text-muted)',
            fontSize: '8px',
            lineHeight: 1.5
          }}
        >
          {description}
        </p>
      </header>

      {hasImage ? (
        <>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              aspectRatio: '16 / 10',
              margin: '0 12px',
              border:
                '1px solid var(--admin-border)',
              borderRadius: '13px',
              background:
                'var(--admin-surface-muted)'
            }}
          >
            <img
              src={mediaItem.previewUrl}
              alt={`Vista previa de ${title}`}
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            <span
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                border:
                  '1px solid rgba(255,255,255,.22)',
                borderRadius: '999px',
                padding: '5px 8px',
                background:
                  'rgba(5, 9, 16, .68)',
                color: '#ffffff',
                fontSize: '7px',
                fontWeight: 800,
                backdropFilter: 'blur(10px)'
              }}
            >
              Vista previa
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '13px',
              padding: '15px 17px 17px'
            }}
          >
            <FileInformation
              mediaItem={mediaItem}
            />

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                paddingTop: '12px',
                borderTop:
                  '1px solid var(--admin-border)'
              }}
            >
              <label
                htmlFor={inputId}
                style={getButtonStyle(
                  'secondary'
                )}
              >
                <ReplaceIcon />
                Cambiar
              </label>

              <button
                type="button"
                onClick={onRemove}
                style={getButtonStyle(
                  'danger'
                )}
              >
                <TrashIcon />
                Quitar
              </button>
            </div>
          </div>

          <input
            id={inputId}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={onChange}
            style={{
              display: 'none'
            }}
          />
        </>
      ) : (
        <label
          htmlFor={inputId}
          style={{
            display: 'grid',
            minHeight: '245px',
            margin: '0 12px 12px',
            placeItems: 'center',
            border:
              '1px dashed var(--admin-border-strong)',
            borderRadius: '14px',
            padding: '24px',
            background:
              'var(--admin-surface-soft)',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          <input
            id={inputId}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={onChange}
            style={{
              display: 'none'
            }}
          />

          <div>
            <span
              aria-hidden="true"
              style={{
                display: 'grid',
                width: '46px',
                height: '46px',
                margin: '0 auto 13px',
                placeItems: 'center',
                border:
                  '1px solid var(--admin-border)',
                borderRadius: '14px',
                background:
                  'var(--admin-surface)',
                color:
                  'var(--admin-accent)'
              }}
            >
              <PlusIcon />
            </span>

            <strong
              style={{
                display: 'block',
                color:
                  'var(--admin-text)',
                fontSize: '10px',
                fontWeight: 780
              }}
            >
              Seleccionar imagen
            </strong>

            <span
              style={{
                display: 'block',
                marginTop: '7px',
                color:
                  'var(--admin-text-muted)',
                fontSize: '7px',
                lineHeight: 1.5
              }}
            >
              JPG, PNG o WebP · Máximo{' '}
              {formatFileSize(
                MAX_IMAGE_SIZE
              )}
            </span>

            {recommendedSize && (
              <small
                style={{
                  display: 'block',
                  marginTop: '5px',
                  color:
                    'var(--admin-text-muted)',
                  fontSize: '7px',
                  opacity: 0.78
                }}
              >
                Recomendado:{' '}
                {recommendedSize}
              </small>
            )}
          </div>
        </label>
      )}
    </article>
  );
}

function GalleryImage({
  image,
  index,
  totalImages,
  onRemove,
  onMoveUp,
  onMoveDown
}) {
  return (
    <article
      style={{
        display: 'grid',
        overflow: 'hidden',
        border:
          '1px solid var(--admin-border)',
        borderRadius: '15px',
        background:
          'var(--admin-surface)',
        boxShadow:
          '0 9px 26px rgba(15, 23, 42, .04)'
      }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '4 / 3',
          background:
            'var(--admin-surface-muted)'
        }}
      >
        <img
          src={image.previewUrl}
          alt={`Fotografía ${index + 1} de la galería`}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        <span
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            minWidth: '28px',
            border:
              '1px solid rgba(255,255,255,.2)',
            borderRadius: '999px',
            padding: '5px 8px',
            background:
              'rgba(5, 9, 16, .7)',
            color: '#ffffff',
            fontSize: '7px',
            fontWeight: 850,
            textAlign: 'center',
            backdropFilter: 'blur(8px)'
          }}
        >
          {String(index + 1).padStart(
            2,
            '0'
          )}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '12px',
          padding: '12px 13px 13px'
        }}
      >
        <FileInformation
          mediaItem={image}
          compact
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: '10px',
            paddingTop: '10px',
            borderTop:
              '1px solid var(--admin-border)'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '6px'
            }}
          >
            <button
              type="button"
              onClick={() =>
                onMoveUp(index)
              }
              disabled={index === 0}
              aria-label={`Mover ${
                image.name ||
                'fotografía'
              } hacia atrás`}
              title="Mover hacia atrás"
              style={{
                display: 'grid',
                width: '32px',
                height: '32px',
                placeItems: 'center',
                border:
                  '1px solid var(--admin-border)',
                borderRadius: '9px',
                background:
                  'var(--admin-surface-soft)',
                color:
                  'var(--admin-text-secondary)',
                cursor:
                  index === 0
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  index === 0
                    ? 0.34
                    : 1
              }}
            >
              <ArrowIcon direction="left" />
            </button>

            <button
              type="button"
              onClick={() =>
                onMoveDown(index)
              }
              disabled={
                index ===
                totalImages - 1
              }
              aria-label={`Mover ${
                image.name ||
                'fotografía'
              } hacia adelante`}
              title="Mover hacia adelante"
              style={{
                display: 'grid',
                width: '32px',
                height: '32px',
                placeItems: 'center',
                border:
                  '1px solid var(--admin-border)',
                borderRadius: '9px',
                background:
                  'var(--admin-surface-soft)',
                color:
                  'var(--admin-text-secondary)',
                cursor:
                  index ===
                  totalImages - 1
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  index ===
                  totalImages - 1
                    ? 0.34
                    : 1
              }}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              onRemove(image.id)
            }
            aria-label={`Eliminar ${
              image.name ||
              'fotografía'
            }`}
            title="Eliminar fotografía"
            style={{
              display: 'grid',
              width: '32px',
              height: '32px',
              placeItems: 'center',
              border:
                '1px solid var(--admin-border)',
              borderRadius: '9px',
              background:
                'var(--admin-surface-soft)',
              color:
                'var(--admin-danger)',
              cursor: 'pointer'
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyGallery() {
  return (
    <div
      style={{
        display: 'grid',
        minHeight: '190px',
        placeItems: 'center',
        border:
          '1px dashed var(--admin-border-strong)',
        borderRadius: '15px',
        padding: '28px',
        background:
          'var(--admin-surface-soft)',
        textAlign: 'center'
      }}
    >
      <div>
        <span
          aria-hidden="true"
          style={{
            display: 'grid',
            width: '44px',
            height: '44px',
            margin: '0 auto 12px',
            placeItems: 'center',
            border:
              '1px solid var(--admin-border)',
            borderRadius: '13px',
            background:
              'var(--admin-surface)',
            color:
              'var(--admin-accent)'
          }}
        >
          <ImageIcon />
        </span>

        <strong
          style={{
            display: 'block',
            color: 'var(--admin-text)',
            fontSize: '10px',
            fontWeight: 780
          }}
        >
          Todavía no hay fotografías
        </strong>

        <p
          style={{
            maxWidth: '370px',
            margin: '6px auto 0',
            color:
              'var(--admin-text-muted)',
            fontSize: '8px',
            lineHeight: 1.55
          }}
        >
          Agrega los recuerdos que quieras
          mostrar en la galería de esta
          invitación.
        </p>
      </div>
    </div>
  );
}

export default function MediaTab({
  formData,
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
  onToggleSection
}) {
  const sections =
    formData?.sections || {};

  const galleryEnabled =
    Boolean(sections.gallery);

  const musicEnabled =
    Boolean(sections.music);

  const coverImage =
    media?.coverImage || null;

  const coupleImage =
    media?.coupleImage || null;

  const backgroundMusic =
    media?.backgroundMusic || null;

  const gallery =
    Array.isArray(media?.gallery)
      ? media.gallery
      : [];

  const galleryFull =
    galleryCount >=
    MAX_GALLERY_IMAGES;

  function toggleSection(
    sectionKey
  ) {
    if (
      typeof onToggleSection ===
      'function'
    ) {
      onToggleSection(sectionKey);
    }
  }

  function handleClearGallery() {
    if (
      typeof clearGallery !==
        'function' ||
      gallery.length === 0
    ) {
      return;
    }

    const shouldClear =
      window.confirm(
        '¿Deseas eliminar todas las fotografías de la galería?'
      );

    if (shouldClear) {
      clearGallery();
    }
  }

  function handleClearAllMedia() {
    if (
      typeof clearMedia !==
        'function' ||
      selectedMediaCount === 0
    ) {
      return;
    }

    const shouldClear =
      window.confirm(
        '¿Deseas quitar todas las fotografías y la canción seleccionada?'
      );

    if (shouldClear) {
      clearMedia();
    }
  }

  return (
    <div
      className="builder-tab media-tab"
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
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent:
            'space-between',
          gap: '24px'
        }}
      >
        <div
          style={{
            minWidth: 0,
            flex: '1 1 500px'
          }}
        >
          <span
            className="section-eyebrow"
            style={{
              display: 'block',
              marginBottom: '7px'
            }}
          >
            Archivos multimedia
          </span>

          <h2
            style={{
              margin: 0,
              color:
                'var(--admin-text)',
              fontSize: '24px',
              fontWeight: 790,
              letterSpacing: '-.035em',
              lineHeight: 1.08
            }}
          >
            Fotografías y música
          </h2>

          <p
            style={{
              maxWidth: '720px',
              margin: '9px 0 0',
              color:
                'var(--admin-text-soft)',
              fontSize: '10px',
              lineHeight: 1.65
            }}
          >
            Organiza la identidad visual
            y sonora de la invitación.
            Cada archivo seleccionado se
            guardará cuando publiques la
            boda.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '13px',
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
              fontSize: '27px',
              fontWeight: 700,
              lineHeight: 1
            }}
          >
            {selectedMediaCount}
          </strong>

          <div>
            <span
              style={{
                display: 'block',
                color:
                  'var(--admin-text-muted)',
                fontSize: '7px',
                fontWeight: 850,
                letterSpacing: '.09em',
                textTransform:
                  'uppercase'
              }}
            >
              Multimedia
            </span>

            <span
              style={{
                display: 'block',
                marginTop: '2px',
                color:
                  'var(--admin-text-secondary)',
                fontSize: '8px',
                fontWeight: 700
              }}
            >
              archivos seleccionados
            </span>
          </div>
        </div>
      </header>

      {/*
       * =====================================================
       * IMÁGENES PRINCIPALES
       * =====================================================
       */}

      <SectionShell>
        <SectionHeading
          eyebrow="Imágenes principales"
          title="Portada y fotografía de la pareja"
          description="Define las fotografías principales de la experiencia. Las vistas previas se mantienen compactas para que puedas revisar ambas sin perder el contexto."
          action={
            <button
              type="button"
              onClick={
                handleClearAllMedia
              }
              disabled={
                selectedMediaCount === 0
              }
              style={getButtonStyle(
                'danger',
                selectedMediaCount === 0
              )}
            >
              <TrashIcon />
              Limpiar multimedia
            </button>
          }
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(360px, 100%), 1fr))',
            gap: '16px'
          }}
        >
          <ImageUploadCard
            eyebrow="Portada"
            title="Fotografía principal"
            description="Es la primera imagen que verá el invitado al entrar."
            mediaItem={coverImage}
            inputId="coverImage"
            onChange={
              handleCoverImageChange
            }
            onRemove={
              removeCoverImage
            }
            recommendedSize="1600 × 2000 píxeles"
          />

          <ImageUploadCard
            eyebrow="La pareja"
            title="Fotografía de los novios"
            description="Puede acompañar la historia y el contenido personal de la pareja."
            mediaItem={coupleImage}
            inputId="coupleImage"
            onChange={
              handleCoupleImageChange
            }
            onRemove={
              removeCoupleImage
            }
            recommendedSize="1200 × 1200 píxeles"
          />
        </div>
      </SectionShell>

      {/*
       * =====================================================
       * GALERÍA
       * =====================================================
       */}

      <SectionShell>
        <SectionHeading
          eyebrow="Recuerdos"
          title="Galería de fotografías"
          description={`Organiza hasta ${MAX_GALLERY_IMAGES} imágenes en el orden en que quieres que aparezcan en la invitación.`}
          action={
            <VisibilityToggle
              enabled={
                galleryEnabled
              }
              label={
                galleryEnabled
                  ? 'Galería visible'
                  : 'Galería oculta'
              }
              onClick={() =>
                toggleSection(
                  'gallery'
                )
              }
            />
          }
        />

        {!galleryEnabled && (
          <div
            style={{
              marginBottom: '18px',
              borderLeft:
                '3px solid var(--admin-warning)',
              padding:
                '9px 12px',
              color:
                'var(--admin-text-muted)',
              fontSize: '8px',
              lineHeight: 1.55
            }}
          >
            La galería está oculta. Las
            fotografías pueden permanecer
            seleccionadas, pero no serán
            visibles en la invitación.
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: '14px',
            marginBottom: '18px',
            border:
              '1px solid var(--admin-border)',
            borderRadius: '14px',
            padding: '13px 14px',
            background:
              'var(--admin-surface-soft)'
          }}
        >
          <div>
            <span
              style={{
                display: 'block',
                color:
                  'var(--admin-text-muted)',
                fontSize: '7px',
                fontWeight: 850,
                letterSpacing: '.1em',
                textTransform:
                  'uppercase'
              }}
            >
              Fotografías
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '5px',
                marginTop: '3px'
              }}
            >
              <strong
                style={{
                  color:
                    'var(--admin-text)',
                  fontSize: '16px',
                  fontWeight: 760
                }}
              >
                {galleryCount}
              </strong>

              <span
                style={{
                  color:
                    'var(--admin-text-muted)',
                  fontSize: '8px'
                }}
              >
                de{' '}
                {MAX_GALLERY_IMAGES}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <label
              htmlFor="galleryImages"
              style={{
                ...getButtonStyle(
                  'primary',
                  !galleryEnabled ||
                    galleryFull
                ),
                pointerEvents:
                  !galleryEnabled ||
                  galleryFull
                    ? 'none'
                    : 'auto'
              }}
            >
              <PlusIcon />
              {galleryFull
                ? 'Galería completa'
                : 'Agregar fotografías'}
            </label>

            <input
              id="galleryImages"
              type="file"
              multiple
              accept={IMAGE_ACCEPT}
              onChange={
                handleGalleryChange
              }
              disabled={
                !galleryEnabled ||
                galleryFull
              }
              style={{
                display: 'none'
              }}
            />

            <button
              type="button"
              onClick={
                handleClearGallery
              }
              disabled={
                gallery.length === 0
              }
              style={getButtonStyle(
                'danger',
                gallery.length === 0
              )}
            >
              <TrashIcon />
              Vaciar galería
            </button>
          </div>
        </div>

        {galleryEnabled &&
          galleryCount === 0 && (
            <div
              style={{
                marginBottom:
                  '16px',
                borderLeft:
                  '3px solid var(--admin-warning)',
                padding:
                  '8px 12px',
                color:
                  'var(--admin-warning)',
                fontSize: '8px',
                lineHeight: 1.55
              }}
            >
              La galería está visible, pero
              todavía no contiene
              fotografías.
            </div>
          )}

        {gallery.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
              gap: '14px'
            }}
          >
            {gallery.map(
              (image, index) => (
                <GalleryImage
                  key={image.id}
                  image={image}
                  index={index}
                  totalImages={
                    gallery.length
                  }
                  onRemove={
                    removeGalleryImage
                  }
                  onMoveUp={
                    moveGalleryImageUp
                  }
                  onMoveDown={
                    moveGalleryImageDown
                  }
                />
              )
            )}
          </div>
        ) : (
          <EmptyGallery />
        )}
      </SectionShell>

      {/*
       * =====================================================
       * MÚSICA
       * =====================================================
       */}

      <SectionShell>
        <SectionHeading
          eyebrow="Ambiente"
          title="Canción de fondo"
          description="Selecciona la pieza que acompañará la experiencia de la invitación. Los invitados podrán reproducirla o pausarla desde sus controles."
          action={
            <VisibilityToggle
              enabled={musicEnabled}
              label={
                musicEnabled
                  ? 'Música visible'
                  : 'Música oculta'
              }
              onClick={() =>
                toggleSection(
                  'music'
                )
              }
            />
          }
        />

        {!musicEnabled && (
          <div
            style={{
              marginBottom: '18px',
              borderLeft:
                '3px solid var(--admin-warning)',
              padding:
                '9px 12px',
              color:
                'var(--admin-text-muted)',
              fontSize: '8px',
              lineHeight: 1.55
            }}
          >
            La música está oculta. Puedes
            conservar una canción
            seleccionada, pero no se
            reproducirá en la invitación.
          </div>
        )}

        {backgroundMusic ? (
          <div
            style={{
              display: 'grid',
              gap: '16px',
              border:
                '1px solid var(--admin-border)',
              borderRadius: '16px',
              padding: '17px',
              background:
                'var(--admin-surface)'
            }}
          >
            <div
              style={{
                display: 'flex',
                minWidth: 0,
                alignItems: 'center',
                gap: '13px'
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'grid',
                  width: '43px',
                  height: '43px',
                  flexShrink: 0,
                  placeItems: 'center',
                  border:
                    '1px solid var(--admin-border)',
                  borderRadius:
                    '13px',
                  background:
                    'var(--admin-accent-faint)',
                  color:
                    'var(--admin-accent)'
                }}
              >
                <MusicIcon />
              </span>

              <div
                style={{
                  minWidth: 0,
                  flex: 1
                }}
              >
                <span
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    color:
                      'var(--admin-accent-strong)',
                    fontSize: '7px',
                    fontWeight: 900,
                    letterSpacing:
                      '.11em',
                    textTransform:
                      'uppercase'
                  }}
                >
                  Canción seleccionada
                </span>

                <FileInformation
                  mediaItem={
                    backgroundMusic
                  }
                />
              </div>
            </div>

            <audio
              controls
              preload="metadata"
              src={
                backgroundMusic.previewUrl
              }
              style={{
                width: '100%',
                minHeight: '42px'
              }}
            >
              Tu navegador no puede
              reproducir este archivo de
              audio.
            </audio>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                paddingTop: '13px',
                borderTop:
                  '1px solid var(--admin-border)'
              }}
            >
              <label
                htmlFor="backgroundMusic"
                style={{
                  ...getButtonStyle(
                    'secondary',
                    !musicEnabled
                  ),
                  pointerEvents:
                    !musicEnabled
                      ? 'none'
                      : 'auto'
                }}
              >
                <ReplaceIcon />
                Cambiar canción
              </label>

              <button
                type="button"
                onClick={
                  removeBackgroundMusic
                }
                style={getButtonStyle(
                  'danger'
                )}
              >
                <TrashIcon />
                Quitar canción
              </button>
            </div>

            <input
              id="backgroundMusic"
              type="file"
              accept={AUDIO_ACCEPT}
              onChange={
                handleBackgroundMusicChange
              }
              disabled={!musicEnabled}
              style={{
                display: 'none'
              }}
            />
          </div>
        ) : (
          <label
            htmlFor="backgroundMusic"
            style={{
              display: 'grid',
              minHeight: '190px',
              placeItems: 'center',
              border:
                '1px dashed var(--admin-border-strong)',
              borderRadius: '15px',
              padding: '28px',
              background:
                'var(--admin-surface-soft)',
              cursor: musicEnabled
                ? 'pointer'
                : 'not-allowed',
              textAlign: 'center',
              opacity: musicEnabled
                ? 1
                : 0.5
            }}
          >
            <input
              id="backgroundMusic"
              type="file"
              accept={AUDIO_ACCEPT}
              onChange={
                handleBackgroundMusicChange
              }
              disabled={!musicEnabled}
              style={{
                display: 'none'
              }}
            />

            <div>
              <span
                aria-hidden="true"
                style={{
                  display: 'grid',
                  width: '46px',
                  height: '46px',
                  margin:
                    '0 auto 13px',
                  placeItems: 'center',
                  border:
                    '1px solid var(--admin-border)',
                  borderRadius:
                    '14px',
                  background:
                    'var(--admin-surface)',
                  color:
                    'var(--admin-accent)'
                }}
              >
                <MusicIcon />
              </span>

              <strong
                style={{
                  display: 'block',
                  color:
                    'var(--admin-text)',
                  fontSize: '10px',
                  fontWeight: 780
                }}
              >
                Seleccionar canción de
                fondo
              </strong>

              <span
                style={{
                  display: 'block',
                  marginTop: '7px',
                  color:
                    'var(--admin-text-muted)',
                  fontSize: '7px',
                  lineHeight: 1.55
                }}
              >
                MP3, WAV, M4A, AAC u OGG
                · Máximo{' '}
                {formatFileSize(
                  MAX_AUDIO_SIZE
                )}
              </span>
            </div>
          </label>
        )}

        {musicEnabled &&
          !backgroundMusic && (
            <div
              style={{
                marginTop: '15px',
                borderLeft:
                  '3px solid var(--admin-warning)',
                padding:
                  '8px 12px',
                color:
                  'var(--admin-warning)',
                fontSize: '8px',
                lineHeight: 1.55
              }}
            >
              La música está visible, pero
              todavía no has seleccionado
              una canción.
            </div>
          )}
      </SectionShell>

      {/*
       * =====================================================
       * NOTA FINAL
       * =====================================================
       *
       * Sin la "i" que aparecía suelta.
       */}

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
            color: 'var(--admin-text)',
            fontSize: '9px',
            fontWeight: 780
          }}
        >
          Los archivos se guardarán con la
          invitación
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
          Al publicar, BodaSync subirá las
          fotografías y la música al
          servidor. La invitación pública
          utilizará las URLs guardadas y no
          las vistas previas temporales del
          navegador.
        </p>
      </div>
    </div>
  );
}