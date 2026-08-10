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

function SectionStatus({
  enabled,
  enabledText = 'Sección activa',
  disabledText = 'Sección desactivada'
}) {
  return (
    <span
      className={
        enabled ? 'status-badge enabled' : 'status-badge disabled'
      }
    >
      {enabled ? enabledText : disabledText}
    </span>
  );
}

function FileInformation({ mediaItem }) {
  if (!mediaItem) {
    return null;
  }

  return (
    <div className="media-file-information">
      <strong title={mediaItem.name}>
        {mediaItem.name || 'Archivo seleccionado'}
      </strong>

      <span>{mediaItem.formattedSize || 'Archivo seleccionado'}</span>
    </div>
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
  return (
    <article className="media-upload-card">
      <div className="media-upload-header">
        <div>
          <span className="media-label">{eyebrow}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      {mediaItem ? (
        <div className="media-preview">
          <div className="media-preview-image">
            <img
              src={mediaItem.previewUrl}
              alt={`Vista previa de ${title}`}
            />
          </div>

          <div className="media-preview-footer">
            <FileInformation mediaItem={mediaItem} />

            <div className="media-preview-actions">
              <label
                htmlFor={inputId}
                className="secondary-button compact-button"
              >
                Cambiar
              </label>

              <button
                type="button"
                className="danger-button compact-button"
                onClick={onRemove}
              >
                Quitar
              </button>
            </div>
          </div>

          <input
            id={inputId}
            className="hidden-file-input"
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={onChange}
          />
        </div>
      ) : (
        <label htmlFor={inputId} className="upload-dropzone">
          <input
            id={inputId}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={onChange}
          />

          <span className="upload-dropzone-icon" aria-hidden="true">
            +
          </span>

          <strong>Seleccionar imagen</strong>

          <span>
            JPG, PNG o WebP. Máximo {formatFileSize(MAX_IMAGE_SIZE)}.
          </span>

          {recommendedSize && (
            <small>Tamaño recomendado: {recommendedSize}</small>
          )}
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
    <article className="gallery-preview-item">
      <div className="gallery-preview-image">
        <img
          src={image.previewUrl}
          alt={`Fotografía ${index + 1} de la galería`}
        />

        <span className="gallery-image-number">{index + 1}</span>
      </div>

      <div className="gallery-preview-information">
        <div>
          <strong title={image.name}>
            {image.name || `Fotografía ${index + 1}`}
          </strong>

          <span>{image.formattedSize || 'Imagen seleccionada'}</span>
        </div>

        <div className="gallery-preview-actions">
          <button
            type="button"
            className="icon-action-button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            aria-label={`Mover ${image.name || 'fotografía'} hacia atrás`}
            title="Mover hacia atrás"
          >
            ←
          </button>

          <button
            type="button"
            className="icon-action-button"
            onClick={() => onMoveDown(index)}
            disabled={index === totalImages - 1}
            aria-label={`Mover ${image.name || 'fotografía'} hacia adelante`}
            title="Mover hacia adelante"
          >
            →
          </button>

          <button
            type="button"
            className="gallery-remove-button"
            onClick={() => onRemove(image.id)}
            aria-label={`Eliminar ${image.name || 'fotografía'}`}
            title="Eliminar fotografía"
          >
            ×
          </button>
        </div>
      </div>
    </article>
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
  const sections = formData?.sections || {};

  const galleryEnabled = Boolean(sections.gallery);
  const musicEnabled = Boolean(sections.music);

  const coverImage = media?.coverImage || null;
  const coupleImage = media?.coupleImage || null;
  const backgroundMusic = media?.backgroundMusic || null;

  const gallery = Array.isArray(media?.gallery) ? media.gallery : [];

  function toggleSection(sectionKey) {
    if (typeof onToggleSection === 'function') {
      onToggleSection(sectionKey);
    }
  }

  function handleClearGallery() {
    if (typeof clearGallery !== 'function' || gallery.length === 0) {
      return;
    }

    const shouldClear = window.confirm(
      '¿Deseas eliminar todas las fotografías de la galería?'
    );

    if (shouldClear) {
      clearGallery();
    }
  }

  function handleClearAllMedia() {
    if (typeof clearMedia !== 'function' || selectedMediaCount === 0) {
      return;
    }

    const shouldClear = window.confirm(
      '¿Deseas quitar todas las fotografías y la canción seleccionada?'
    );

    if (shouldClear) {
      clearMedia();
    }
  }

  return (
    <div className="builder-tab media-tab">
      <div className="tab-heading section-header-row">
        <div>
          <span className="section-eyebrow">Archivos multimedia</span>

          <h2>Fotografías y música</h2>

          <p>
            Selecciona la portada, fotografía de la pareja, galería y canción
            de fondo que se guardarán con esta invitación.
          </p>
        </div>

        <div className="media-summary-card">
          <strong>{selectedMediaCount}</strong>
          <span>archivos seleccionados</span>
        </div>
      </div>

      <div className="inline-notice">
        Al crear la invitación, las fotografías y la canción se subirán al
        servidor y sus direcciones quedarán guardadas junto con la boda.
      </div>

      <section className="builder-subsection">
        <div className="subsection-header">
          <div>
            <span className="section-eyebrow">Imágenes principales</span>

            <h3>Portada y fotografía de la pareja</h3>

            <p>
              Estas imágenes forman parte de la presentación principal de la
              invitación.
            </p>
          </div>

          <button
            type="button"
            className="danger-button compact-button"
            onClick={handleClearAllMedia}
            disabled={selectedMediaCount === 0}
          >
            Quitar todos los archivos
          </button>
        </div>

        <div className="media-grid">
          <ImageUploadCard
            eyebrow="Portada"
            title="Fotografía principal"
            description="Será la imagen principal que verán los invitados al abrir la invitación."
            mediaItem={coverImage}
            inputId="coverImage"
            onChange={handleCoverImageChange}
            onRemove={removeCoverImage}
            recommendedSize="1600 × 2000 píxeles"
          />

          <ImageUploadCard
            eyebrow="La pareja"
            title="Fotografía de los novios"
            description="Podrá mostrarse dentro del contenido especial de la pareja."
            mediaItem={coupleImage}
            inputId="coupleImage"
            onChange={handleCoupleImageChange}
            onRemove={removeCoupleImage}
            recommendedSize="1200 × 1200 píxeles"
          />
        </div>
      </section>

      <div className="builder-divider" />

      <section className="builder-subsection">
        <div className="subsection-header">
          <div>
            <span className="section-eyebrow">Recuerdos</span>

            <h3>Galería de fotografías</h3>

            <p>
              Agrega hasta {MAX_GALLERY_IMAGES} imágenes y acomódalas en el
              orden que deseas mostrar.
            </p>
          </div>

          <div className="subsection-header-actions">
            <SectionStatus
              enabled={galleryEnabled}
              enabledText="Galería activa"
              disabledText="Galería desactivada"
            />

            <button
              type="button"
              className={
                galleryEnabled
                  ? 'secondary-button compact-button'
                  : 'primary-button compact-button'
              }
              onClick={() => toggleSection('gallery')}
            >
              {galleryEnabled ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>

        {!galleryEnabled && (
          <div className="inline-notice">
            La galería está desactivada. Las fotografías pueden permanecer
            seleccionadas, pero no aparecerán en la invitación.
          </div>
        )}

        <div className="gallery-toolbar">
          <label
            htmlFor="galleryImages"
            className={`primary-button compact-button ${
              !galleryEnabled || galleryCount >= MAX_GALLERY_IMAGES
                ? 'disabled'
                : ''
            }`}
          >
            + Agregar fotografías
          </label>

          <input
            id="galleryImages"
            className="hidden-file-input"
            type="file"
            multiple
            accept={IMAGE_ACCEPT}
            onChange={handleGalleryChange}
            disabled={
              !galleryEnabled || galleryCount >= MAX_GALLERY_IMAGES
            }
          />

          <button
            type="button"
            className="danger-button compact-button"
            onClick={handleClearGallery}
            disabled={gallery.length === 0}
          >
            Limpiar galería
          </button>

          <span className="gallery-counter">
            {galleryCount}/{MAX_GALLERY_IMAGES} fotografías
          </span>
        </div>

        {galleryEnabled && galleryCount === 0 && (
          <div className="inline-notice warning-notice">
            La galería está activa. Agrega al menos una fotografía o desactiva
            esta sección antes de crear la invitación.
          </div>
        )}

        {gallery.length > 0 ? (
          <div className="gallery-preview-grid">
            {gallery.map((image, index) => (
              <GalleryImage
                key={image.id}
                image={image}
                index={index}
                totalImages={gallery.length}
                onRemove={removeGalleryImage}
                onMoveUp={moveGalleryImageUp}
                onMoveDown={moveGalleryImageDown}
              />
            ))}
          </div>
        ) : (
          <div className="media-empty-state">
            <span className="media-empty-icon" aria-hidden="true">
              ▧
            </span>

            <strong>Todavía no hay fotografías</strong>

            <p>
              Selecciona las imágenes que deseas mostrar en la galería de esta
              boda.
            </p>
          </div>
        )}
      </section>

      <div className="builder-divider" />

      <section className="builder-subsection">
        <div className="subsection-header">
          <div>
            <span className="section-eyebrow">Ambiente</span>

            <h3>Canción de fondo</h3>

            <p>
              Selecciona la canción que acompañará la invitación. Esta opción
              es únicamente música de fondo; los invitados no podrán solicitar
              canciones.
            </p>
          </div>

          <div className="subsection-header-actions">
            <SectionStatus
              enabled={musicEnabled}
              enabledText="Música activa"
              disabledText="Música desactivada"
            />

            <button
              type="button"
              className={
                musicEnabled
                  ? 'secondary-button compact-button'
                  : 'primary-button compact-button'
              }
              onClick={() => toggleSection('music')}
            >
              {musicEnabled ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>

        {!musicEnabled && (
          <div className="inline-notice">
            La música de fondo está desactivada. Aunque exista una canción
            seleccionada, no se reproducirá en la invitación.
          </div>
        )}

        {backgroundMusic ? (
          <div className="audio-preview">
            <div className="audio-preview-information">
              <span className="audio-preview-icon" aria-hidden="true">
                ♪
              </span>

              <FileInformation mediaItem={backgroundMusic} />
            </div>

            <audio
              controls
              preload="metadata"
              src={backgroundMusic.previewUrl}
            >
              Tu navegador no puede reproducir este archivo de audio.
            </audio>

            <div className="audio-preview-actions">
              <label
                htmlFor="backgroundMusic"
                className={`secondary-button compact-button ${
                  !musicEnabled ? 'disabled' : ''
                }`}
              >
                Cambiar canción
              </label>

              <button
                type="button"
                className="danger-button compact-button"
                onClick={removeBackgroundMusic}
              >
                Quitar canción
              </button>
            </div>

            <input
              id="backgroundMusic"
              className="hidden-file-input"
              type="file"
              accept={AUDIO_ACCEPT}
              onChange={handleBackgroundMusicChange}
              disabled={!musicEnabled}
            />
          </div>
        ) : (
          <label
            htmlFor="backgroundMusic"
            className={`upload-dropzone ${
              !musicEnabled ? 'disabled' : ''
            }`}
          >
            <input
              id="backgroundMusic"
              type="file"
              accept={AUDIO_ACCEPT}
              onChange={handleBackgroundMusicChange}
              disabled={!musicEnabled}
            />

            <span className="upload-dropzone-icon" aria-hidden="true">
              ♪
            </span>

            <strong>Seleccionar canción de fondo</strong>

            <span>
              MP3, WAV, M4A, AAC u OGG. Máximo{' '}
              {formatFileSize(MAX_AUDIO_SIZE)}.
            </span>
          </label>
        )}

        {musicEnabled && !backgroundMusic && (
          <div className="inline-notice warning-notice">
            La música de fondo está activa. Selecciona una canción o desactiva
            esta sección antes de crear la invitación.
          </div>
        )}
      </section>

      <div className="sections-help-card">
        <div className="sections-help-icon" aria-hidden="true">
          i
        </div>

        <div>
          <strong>Los archivos ahora sí se guardarán</strong>

          <p>
            Al crear la invitación, BodaSync subirá estos archivos al backend.
            La invitación pública utilizará las URLs guardadas y no las vistas
            previas temporales del navegador.
          </p>
        </div>
      </div>
    </div>
  );
}