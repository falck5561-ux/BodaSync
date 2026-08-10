import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { createPortal } from 'react-dom';

import {
  AnimatePresence,
  motion,
  useReducedMotion
} from 'framer-motion';

import { getStyles } from '../config/weddingStyles';

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
    const url = new URL(apiUrl);

    return url.origin;
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

  const serverOrigin =
    getServerOrigin();

  if (
    imageUrl.startsWith(
      '/uploads/'
    )
  ) {
    return `${serverOrigin}${imageUrl}`;
  }

  if (
    imageUrl.startsWith(
      'uploads/'
    )
  ) {
    return `${serverOrigin}/${imageUrl}`;
  }

  if (
    imageUrl.startsWith('/')
  ) {
    return imageUrl;
  }

  return `${serverOrigin}/${imageUrl}`;
}

function getImageUrl(photo) {
  if (
    typeof photo === 'string'
  ) {
    return resolveImageUrl(
      photo
    );
  }

  if (
    !photo ||
    typeof photo !== 'object'
  ) {
    return '';
  }

  return resolveImageUrl(
    photo.url ||
      photo.secureUrl ||
      photo.secure_url ||
      photo.previewUrl ||
      photo.imageUrl ||
      photo.fileUrl ||
      photo.path
  );
}

function normalizePhotos(
  photos = []
) {
  if (!Array.isArray(photos)) {
    return [];
  }

  return photos
    .map((photo, index) => {
      const url =
        getImageUrl(photo);

      if (!url) {
        return null;
      }

      if (
        typeof photo === 'string'
      ) {
        return {
          id: `gallery-photo-${
            index + 1
          }`,
          url,
          alt: ''
        };
      }

      return {
        id:
          photo.id ||
          photo._id ||
          `gallery-photo-${
            index + 1
          }`,

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

function GalleryCard({
  photo,
  index,
  isDark,
  onOpen,
  onImageError,
  shouldReduceMotion
}) {
  const layoutId =
    `gallery-card-${photo.id}`;

  const imageLayoutId =
    `gallery-image-${photo.id}`;

  function handleOpen() {
    onOpen(photo);
  }

  function handleKeyDown(
    event
  ) {
    if (
      event.key ===
        'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();

      handleOpen();
    }
  }

  return (
    <motion.article
      layoutId={layoutId}
      role="button"
      tabIndex={0}
      aria-label={
        photo.alt
          ? `Ampliar fotografía: ${photo.alt}`
          : 'Ampliar fotografía'
      }
      onClick={handleOpen}
      onKeyDown={
        handleKeyDown
      }
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              scale: 0.95,
              y: 40
            }
      }
      whileInView={{
        opacity: 1,
        scale: 1,
        y: 0
      }}
      viewport={{
        once: true,
        margin: '-50px'
      }}
      transition={{
        duration: 0.8,
        delay: Math.min(
          index * 0.1,
          0.5
        ),
        ease: [
          0.16,
          1,
          0.3,
          1
        ]
      }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -15,
              scale: 1.02,

              rotateZ:
                index % 2 === 0
                  ? 1
                  : -1,

              zIndex: 10
            }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : {
              scale: 0.98
            }
      }
      className={`group relative h-[400px] min-w-[280px] cursor-pointer overflow-hidden rounded-[2rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.4)] outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-4 md:h-[480px] md:min-w-[340px] ${
        isDark
          ? 'border border-white/10 bg-[#111] focus-visible:ring-offset-[#050505]'
          : 'border border-black/5 bg-white focus-visible:ring-offset-[#F9F7F2]'
      }`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.5rem]">
        <motion.img
          layoutId={
            imageLayoutId
          }
          src={photo.url}
          alt={photo.alt}
          loading="lazy"
          draggable="false"
          onError={() =>
            onImageError(
              photo.id
            )
          }
          className="pointer-events-none h-full w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100" />

        <div className="absolute bottom-8 left-0 right-0 z-20 flex translate-y-6 justify-center opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <span className="rounded-full border border-white/30 bg-black/40 px-8 py-3 text-[10px] font-bold uppercase tracking-[0.4em] text-white shadow-xl backdrop-blur-md">
            Ampliar
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function GalleryModal({
  photo,
  isDark,
  onClose,
  onImageError,
  shouldReduceMotion
}) {
  const styles =
    getStyles(isDark);

  const layoutId =
    `gallery-card-${photo.id}`;

  const imageLayoutId =
    `gallery-image-${photo.id}`;

  /*
   * ESC cierra la fotografía.
   */
  useEffect(() => {
    function handleKeyDown(
      event
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        onClose();
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [onClose]);

  /*
   * Evitamos que la invitación
   * de atrás pueda desplazarse
   * mientras la foto está abierta.
   */
  useEffect(() => {
    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  function handleError() {
    onImageError(photo.id);
    onClose();
  }

  if (
    typeof document ===
    'undefined'
  ) {
    return null;
  }

  /*
   * =====================================================
   * CORRECCIÓN IMPORTANTE
   * =====================================================
   *
   * Antes este modal se renderizaba dentro de:
   *
   * PhotoGallerySection
   *   ↓
   * LandingPage
   *   ↓
   * motion.main
   *
   * y podía quedar atrapado dentro de un
   * stacking context generado por animaciones,
   * transforms o z-index.
   *
   * Ahora createPortal lo monta directamente
   * en document.body.
   *
   * NO cambiamos su diseño.
   * NO cambiamos su animación.
   * NO cambiamos el tamaño de la imagen.
   */
  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={
        photo.alt
          ? `Fotografía ampliada: ${photo.alt}`
          : 'Fotografía ampliada'
      }
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0
      }}
      transition={{
        duration:
          shouldReduceMotion
            ? 0.2
            : 0.5,

        ease: 'easeInOut'
      }}
      onClick={onClose}
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-4 md:p-12 ${styles.overlay}`}
    >
      {/*
       * CAPA DE SEGURIDAD
       *
       * Está detrás de la foto, pero delante
       * de TODA la invitación.
       *
       * Esto evita que:
       *
       * - títulos
       * - padres
       * - divisores
       * - botones
       * - controles
       * - otras secciones
       *
       * aparezcan encima de la fotografía.
       *
       * La dejamos muy parecida al fondo
       * que ya tenía el visor anterior.
       */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? 'bg-black/95'
            : 'bg-[#F9F7F2]/95'
        }`}
      />

      <motion.div
        layoutId={layoutId}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 25,
          mass: 0.8
        }}
        onClick={(event) =>
          event.stopPropagation()
        }
        className={`relative z-10 max-h-[90vh] max-w-[95vw] overflow-hidden rounded-[2rem] p-2 shadow-[0_0_100px_rgba(0,0,0,0.8)] ${
          isDark
            ? 'border border-white/10 bg-[#111]'
            : 'border border-black/10 bg-white'
        }`}
      >
        <motion.button
          type="button"
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  scale: 0
                }
          }
          animate={{
            opacity: 1,
            scale: 1
          }}
          exit={{
            opacity: 0,
            scale: 0
          }}
          transition={{
            delay:
              shouldReduceMotion
                ? 0
                : 0.25
          }}
          onClick={onClose}
          aria-label="Cerrar fotografía"
          className="absolute right-6 top-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-xl backdrop-blur-md transition-all hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          ✕
        </motion.button>

        <motion.img
          layoutId={
            imageLayoutId
          }
          src={photo.url}
          alt={photo.alt}
          draggable="false"
          onError={
            handleError
          }
          className="h-auto max-h-[85vh] w-auto max-w-full rounded-[1.5rem] object-contain"
        />
      </motion.div>
    </motion.div>,
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
  const shouldReduceMotion =
    useReducedMotion();

  const carouselRef =
    useRef(null);

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
    }, [
      photos,
      wedding
    ]);

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

  const selectedPhoto =
    useMemo(() => {
      return (
        visiblePhotos.find(
          (photo) =>
            photo.id ===
            selectedPhotoId
        ) || null
      );
    }, [
      selectedPhotoId,
      visiblePhotos
    ]);

  function openPhoto(
    photo
  ) {
    setSelectedPhotoId(
      photo.id
    );
  }

  function closePhoto() {
    setSelectedPhotoId(
      null
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
    galleryPhotos.length ===
    0
  ) {
    return null;
  }

  if (
    visiblePhotos.length ===
      0 &&
    failedPhotoIds.size > 0
  ) {
    return null;
  }

  return (
    <section
      aria-label="Galería de fotografías"
      className={`relative w-full overflow-hidden py-8 ${className}`}
    >
      {/*
       * ==========================================
       * ENCABEZADO ORIGINAL
       * ==========================================
       */}
      <motion.header
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 20
              }
        }
        whileInView={{
          opacity: 1,
          y: 0
        }}
        viewport={{
          once: true
        }}
        transition={{
          duration: 1
        }}
        className="mb-10 flex flex-col items-center justify-center px-6 text-center"
      >
        {title && (
          <h3
            className={`font-serif text-3xl font-light md:text-4xl ${
              isDark
                ? 'text-[#FDFBF7]'
                : 'text-[#111111]'
            }`}
          >
            {title}
          </h3>
        )}

        {subtitle && (
          <div className="mt-5 flex items-center justify-center gap-4 opacity-60">
            <div
              className={`h-px w-8 ${
                isDark
                  ? 'bg-[#C5A059]'
                  : 'bg-[#9E7A32]'
              }`}
            />

            <p
              className={`text-[9px] font-bold uppercase tracking-[0.4em] ${
                isDark
                  ? 'text-[#C5A059]'
                  : 'text-[#9E7A32]'
              }`}
            >
              {subtitle}
            </p>

            <div
              className={`h-px w-8 ${
                isDark
                  ? 'bg-[#C5A059]'
                  : 'bg-[#9E7A32]'
              }`}
            />
          </div>
        )}
      </motion.header>

      {/*
       * ==========================================
       * CARRUSEL ORIGINAL
       * ==========================================
       *
       * Lo dejamos tal como estaba:
       *
       * - horizontal
       * - drag
       * - tarjetas grandes
       * - animación hover
       * - "Ampliar"
       */}
      <motion.div
        ref={carouselRef}
        className="-my-12 flex cursor-grab overflow-hidden px-6 py-12 active:cursor-grabbing md:px-12"
      >
        <motion.div
          drag={
            shouldReduceMotion
              ? false
              : 'x'
          }
          dragConstraints={
            carouselRef
          }
          dragElastic={0.08}
          className="flex gap-8 md:gap-14"
        >
          {visiblePhotos.map(
            (
              photo,
              index
            ) => (
              <GalleryCard
                key={
                  photo.id
                }
                photo={
                  photo
                }
                index={
                  index
                }
                isDark={
                  isDark
                }
                onOpen={
                  openPhoto
                }
                onImageError={
                  handleImageError
                }
                shouldReduceMotion={
                  shouldReduceMotion
                }
              />
            )
          )}
        </motion.div>
      </motion.div>

      {/*
       * ==========================================
       * VISOR
       * ==========================================
       *
       * Se conserva la misma animación.
       *
       * GalleryModal ahora usa createPortal,
       * así que aunque este JSX esté aquí,
       * visualmente se monta en <body>.
       */}
      <AnimatePresence>
        {selectedPhoto && (
          <GalleryModal
            photo={
              selectedPhoto
            }
            isDark={
              isDark
            }
            onClose={
              closePhoto
            }
            onImageError={
              handleImageError
            }
            shouldReduceMotion={
              shouldReduceMotion
            }
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export default PhotoGallerySection;