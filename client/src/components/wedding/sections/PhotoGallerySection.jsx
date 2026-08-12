import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function getServerOrigin() {
  const apiUrl = cleanText(
    import.meta.env.VITE_API_URL ||
      'http://localhost:5000/api'
  );

  try {
    return new URL(apiUrl).origin;
  } catch {
    return 'http://localhost:5000';
  }
}

function resolveImageUrl(value) {
  const imageUrl = cleanText(value);

  if (!imageUrl) {
    return '';
  }

  if (
    imageUrl.startsWith('data:') ||
    imageUrl.startsWith('blob:')
  ) {
    return imageUrl;
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  const serverOrigin = getServerOrigin();

  if (imageUrl.startsWith('/uploads/')) {
    return `${serverOrigin}${imageUrl}`;
  }

  if (imageUrl.startsWith('uploads/')) {
    return `${serverOrigin}/${imageUrl}`;
  }

  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  return `${serverOrigin}/${imageUrl}`;
}

function getImageUrl(photo) {
  if (typeof photo === 'string') {
    return resolveImageUrl(photo);
  }

  if (!photo || typeof photo !== 'object') {
    return '';
  }

  return resolveImageUrl(
    photo.url ||
      photo.secureUrl ||
      photo.secure_url ||
      photo.previewUrl ||
      photo.imageUrl ||
      photo.fileUrl ||
      photo.path ||
      photo.src
  );
}

function normalizePhotos(photos = []) {
  if (!Array.isArray(photos)) {
    return [];
  }

  return photos
    .map((photo, index) => {
      const url = getImageUrl(photo);

      if (!url) {
        return null;
      }

      if (typeof photo === 'string') {
        return {
          id: `gallery-photo-${index + 1}`,
          url,
          alt: ''
        };
      }

      return {
        id:
          photo.id ||
          photo._id ||
          `gallery-photo-${index + 1}`,

        url,

        alt: cleanText(
          photo.alt ||
            photo.title ||
            photo.name ||
            photo.description
        )
      };
    })
    .filter(Boolean);
}

function MobileGalleryCard({
  photo,
  index,
  isDark,
  onOpen,
  onImageError
}) {
  const alt =
    photo.alt ||
    `Fotografía ${index + 1}`;

  return (
    <button
      type="button"
      onClick={() => onOpen(photo)}
      aria-label={`Ampliar ${alt}`}
      className={`relative w-[78vw] max-w-[330px] flex-none snap-center overflow-hidden rounded-[1.7rem] border p-1.5 text-left shadow-lg outline-none ${
        isDark
          ? 'border-white/10 bg-[#111]'
          : 'border-black/10 bg-white'
      }`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem]">
        <img
          src={photo.url}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={() =>
            onImageError(photo.id)
          }
          className="h-full w-full select-none object-cover"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <span className="pointer-events-none absolute bottom-4 left-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white/90">
          {String(index + 1).padStart(
            2,
            '0'
          )}
        </span>
      </div>
    </button>
  );
}

function DesktopGalleryCard({
  photo,
  index,
  isDark,
  onOpen,
  onImageError,
  featured = false
}) {
  const alt =
    photo.alt ||
    `Fotografía ${index + 1}`;

  return (
    <button
      type="button"
      onClick={() => onOpen(photo)}
      aria-label={`Ampliar ${alt}`}
      className={`group relative h-full w-full overflow-hidden rounded-[2rem] border text-left outline-none transition-all duration-500 focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
        isDark
          ? 'border-white/10 bg-[#111] shadow-[0_20px_60px_rgba(0,0,0,0.35)]'
          : 'border-black/[0.08] bg-white shadow-[0_18px_50px_rgba(51,42,27,0.13)]'
      } hover:-translate-y-1 ${
        featured
          ? 'min-h-[610px]'
          : 'min-h-[292px]'
      }`}
    >
      <img
        src={photo.url}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable="false"
        onError={() =>
          onImageError(photo.id)
        }
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-white/65">
            Recuerdo
          </p>

          <p className="mt-1 font-serif text-xl text-white">
            {String(index + 1).padStart(
              2,
              '0'
            )}
          </p>
        </div>

        <div className="flex h-10 w-10 translate-y-2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          ↗
        </div>
      </div>
    </button>
  );
}

function DesktopGallery({
  photos,
  isDark,
  onOpen,
  onImageError
}) {
  if (photos.length === 1) {
    return (
      <div className="mx-auto max-w-[580px] px-8">
        <DesktopGalleryCard
          photo={photos[0]}
          index={0}
          isDark={isDark}
          onOpen={onOpen}
          onImageError={onImageError}
          featured
        />
      </div>
    );
  }

  if (photos.length === 2) {
    return (
      <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-5 px-8">
        {photos.map(
          (photo, index) => (
            <div
              key={photo.id}
              className="min-h-[560px]"
            >
              <DesktopGalleryCard
                photo={photo}
                index={index}
                isDark={isDark}
                onOpen={onOpen}
                onImageError={
                  onImageError
                }
                featured
              />
            </div>
          )
        )}
      </div>
    );
  }

  const firstPhoto = photos[0];

  const sidePhotos =
    photos.slice(1, 3);

  const remainingPhotos =
    photos.slice(3);

  return (
    <div className="mx-auto max-w-[1120px] px-8">
      <div className="grid grid-cols-[1.16fr_0.84fr] gap-5">
        <div>
          <DesktopGalleryCard
            photo={firstPhoto}
            index={0}
            isDark={isDark}
            onOpen={onOpen}
            onImageError={onImageError}
            featured
          />
        </div>

        <div className="grid grid-rows-2 gap-5">
          {sidePhotos.map(
            (
              photo,
              sideIndex
            ) => (
              <DesktopGalleryCard
                key={photo.id}
                photo={photo}
                index={
                  sideIndex + 1
                }
                isDark={isDark}
                onOpen={onOpen}
                onImageError={
                  onImageError
                }
              />
            )
          )}
        </div>
      </div>

      {remainingPhotos.length >
        0 && (
        <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-3">
          {remainingPhotos.map(
            (
              photo,
              index
            ) => (
              <div
                key={photo.id}
                className="min-h-[330px]"
              >
                <DesktopGalleryCard
                  photo={photo}
                  index={
                    index + 3
                  }
                  isDark={isDark}
                  onOpen={
                    onOpen
                  }
                  onImageError={
                    onImageError
                  }
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/*
 * =========================================================
 * VISOR DE FOTOGRAFÍAS
 * =========================================================
 *
 * Se renderiza mediante createPortal directamente
 * en document.body.
 *
 * De esta forma no depende del stacking context,
 * transformaciones o z-index de la invitación.
 */

function GalleryModal({
  photo,
  photoIndex,
  totalPhotos,
  onClose,
  onPrevious,
  onNext,
  onImageError
}) {
  const touchStartX =
    useRef(null);

  const touchStartY =
    useRef(null);

  useEffect(() => {
    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style
        .overflow;

    const previousOverscroll =
      document.body.style
        .overscrollBehavior;

    document.body.style.overflow =
      'hidden';

    document.documentElement.style.overflow =
      'hidden';

    document.body.style.overscrollBehavior =
      'none';

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }

      if (
        event.key ===
        'ArrowLeft'
      ) {
        onPrevious();
      }

      if (
        event.key ===
        'ArrowRight'
      ) {
        onNext();
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.body.style.overscrollBehavior =
        previousOverscroll;

      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    onClose,
    onNext,
    onPrevious
  ]);

  function handleTouchStart(
    event
  ) {
    const touch =
      event.touches?.[0];

    if (!touch) {
      return;
    }

    touchStartX.current =
      touch.clientX;

    touchStartY.current =
      touch.clientY;
  }

  function handleTouchEnd(
    event
  ) {
    const touch =
      event.changedTouches?.[0];

    if (
      !touch ||
      touchStartX.current ===
        null ||
      touchStartY.current ===
        null
    ) {
      return;
    }

    const distanceX =
      touch.clientX -
      touchStartX.current;

    const distanceY =
      touch.clientY -
      touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (
      Math.abs(distanceX) <
        45 ||
      Math.abs(distanceX) <=
        Math.abs(distanceY)
    ) {
      return;
    }

    if (distanceX > 0) {
      onPrevious();
      return;
    }

    onNext();
  }

  function handlePhotoAreaClick(
    event
  ) {
    event.stopPropagation();
  }

  const alt =
    photo.alt ||
    `Fotografía ${
      photoIndex + 1
    }`;

  if (
    typeof document ===
    'undefined'
  ) {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fotografía ampliada: ${alt}`}
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-[#050505]"
    >
      {/*
       * =====================================================
       * FOTO
       * =====================================================
       *
       * Solamente esta zona detiene el click.
       * Todo el resto del fondo negro cierra el visor.
       */}

      <div
        onClick={
          handlePhotoAreaClick
        }
        onTouchStart={
          handleTouchStart
        }
        onTouchEnd={
          handleTouchEnd
        }
        className="relative flex max-h-[92dvh] max-w-[96vw] select-none items-center justify-center md:max-h-[84vh] md:max-w-[82vw]"
      >
        <img
          src={photo.url}
          alt={alt}
          draggable="false"
          decoding="async"
          onError={() => {
            onImageError(
              photo.id
            );

            onClose();
          }}
          className="block max-h-[90dvh] max-w-[94vw] select-none object-contain shadow-[0_30px_100px_rgba(0,0,0,0.75)] md:max-h-[82vh] md:max-w-[82vw] md:rounded-[1.25rem]"
        />

        {totalPhotos > 1 && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-[9px] font-bold tracking-[0.18em] text-white/90 backdrop-blur-md">
            {photoIndex + 1} /{' '}
            {totalPhotos}
          </div>
        )}
      </div>

      {/*
       * =====================================================
       * CONTROLES DESKTOP
       * =====================================================
       */}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar fotografía"
        className="absolute right-6 top-6 z-30 hidden h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/60 text-lg text-white backdrop-blur-md transition-all duration-300 hover:rotate-90 hover:border-white/30 hover:bg-white hover:text-black md:flex"
      >
        ✕
      </button>

      {totalPhotos > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrevious();
            }}
            aria-label="Fotografía anterior"
            className="absolute left-6 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-3xl font-light text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white hover:text-black md:flex lg:left-10"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            aria-label="Fotografía siguiente"
            className="absolute right-6 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-3xl font-light text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white hover:text-black md:flex lg:right-10"
          >
            ›
          </button>
        </>
      )}
    </div>,
    document.body
  );
}

export function PhotoGallerySection({
  wedding = {},
  photos,
  isDark = false,
  title = 'Nuestros momentos',
  subtitle = 'Desliza para descubrir',
  className = ''
}) {
  const [
    selectedPhotoId,
    setSelectedPhotoId
  ] = useState(null);

  const [
    failedPhotoIds,
    setFailedPhotoIds
  ] = useState(
    () => new Set()
  );

  const galleryPhotos =
    useMemo(() => {
      const source =
        photos ||
        wedding.media?.gallery ||
        wedding.gallery ||
        wedding.photos ||
        [];

      return normalizePhotos(
        source
      );
    }, [photos, wedding]);

  useEffect(() => {
    setFailedPhotoIds(
      new Set()
    );

    setSelectedPhotoId(
      null
    );
  }, [galleryPhotos]);

  const visiblePhotos =
    useMemo(() => {
      return galleryPhotos.filter(
        (photo) =>
          !failedPhotoIds.has(
            photo.id
          )
      );
    }, [
      failedPhotoIds,
      galleryPhotos
    ]);

  const selectedPhotoIndex =
    useMemo(() => {
      if (!selectedPhotoId) {
        return -1;
      }

      return visiblePhotos.findIndex(
        (photo) =>
          photo.id ===
          selectedPhotoId
      );
    }, [
      selectedPhotoId,
      visiblePhotos
    ]);

  const selectedPhoto =
    selectedPhotoIndex >= 0
      ? visiblePhotos[
          selectedPhotoIndex
        ]
      : null;

  function openPhoto(photo) {
    setSelectedPhotoId(
      photo.id
    );
  }

  function closePhoto() {
    setSelectedPhotoId(
      null
    );
  }

  function showPreviousPhoto() {
    if (
      visiblePhotos.length <= 1
    ) {
      return;
    }

    const currentIndex =
      selectedPhotoIndex >= 0
        ? selectedPhotoIndex
        : 0;

    const previousIndex =
      currentIndex === 0
        ? visiblePhotos.length -
          1
        : currentIndex - 1;

    setSelectedPhotoId(
      visiblePhotos[
        previousIndex
      ].id
    );
  }

  function showNextPhoto() {
    if (
      visiblePhotos.length <= 1
    ) {
      return;
    }

    const currentIndex =
      selectedPhotoIndex >= 0
        ? selectedPhotoIndex
        : 0;

    const nextIndex =
      currentIndex ===
      visiblePhotos.length - 1
        ? 0
        : currentIndex + 1;

    setSelectedPhotoId(
      visiblePhotos[
        nextIndex
      ].id
    );
  }

  function handleImageError(
    photoId
  ) {
    setFailedPhotoIds(
      (currentIds) => {
        const nextIds =
          new Set(
            currentIds
          );

        nextIds.add(
          photoId
        );

        return nextIds;
      }
    );

    setSelectedPhotoId(
      (currentPhotoId) =>
        currentPhotoId ===
        photoId
          ? null
          : currentPhotoId
    );
  }

  if (
    galleryPhotos.length === 0
  ) {
    return null;
  }

  if (
    visiblePhotos.length === 0 &&
    failedPhotoIds.size > 0
  ) {
    return null;
  }

  return (
    <section
      aria-label="Galería de fotografías"
      className={`relative w-full py-10 md:py-16 ${className}`}
    >
      <header className="mb-8 flex flex-col items-center justify-center px-5 text-center md:mb-12">
        {title && (
          <h3
            className={`font-serif text-3xl font-light sm:text-4xl md:text-5xl ${
              isDark
                ? 'text-[#FDFBF7]'
                : 'text-[#17130d]'
            }`}
          >
            {title}
          </h3>
        )}

        <div className="mt-5 flex items-center justify-center gap-4 opacity-70">
          <div
            className={`h-px w-8 md:w-12 ${
              isDark
                ? 'bg-[#C5A059]'
                : 'bg-[#9E7A32]'
            }`}
          />

          <p
            className={`text-[8px] font-bold uppercase tracking-[0.3em] sm:text-[9px] ${
              isDark
                ? 'text-[#C5A059]'
                : 'text-[#9E7A32]'
            }`}
          >
            <span className="md:hidden">
              {subtitle}
            </span>

            <span className="hidden md:inline">
              Una historia en imágenes
            </span>
          </p>

          <div
            className={`h-px w-8 md:w-12 ${
              isDark
                ? 'bg-[#C5A059]'
                : 'bg-[#9E7A32]'
            }`}
          />
        </div>
      </header>

      {/*
       * =====================================================
       * CELULAR
       * =====================================================
       */}

      <div
        className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:hidden"
        style={{
          WebkitOverflowScrolling:
            'touch',
          scrollbarWidth:
            'none',
          msOverflowStyle:
            'none',
          overscrollBehaviorX:
            'contain'
        }}
      >
        {visiblePhotos.map(
          (photo, index) => (
            <MobileGalleryCard
              key={photo.id}
              photo={photo}
              index={index}
              isDark={isDark}
              onOpen={
                openPhoto
              }
              onImageError={
                handleImageError
              }
            />
          )
        )}

        <div className="w-1 flex-none" />
      </div>

      {/*
       * =====================================================
       * DESKTOP
       * =====================================================
       */}

      <div className="hidden md:block">
        <DesktopGallery
          photos={visiblePhotos}
          isDark={isDark}
          onOpen={openPhoto}
          onImageError={
            handleImageError
          }
        />
      </div>

      {selectedPhoto && (
        <GalleryModal
          photo={selectedPhoto}
          photoIndex={
            selectedPhotoIndex
          }
          totalPhotos={
            visiblePhotos.length
          }
          onClose={
            closePhoto
          }
          onPrevious={
            showPreviousPhoto
          }
          onNext={
            showNextPhoto
          }
          onImageError={
            handleImageError
          }
        />
      )}
    </section>
  );
}

export default PhotoGallerySection;