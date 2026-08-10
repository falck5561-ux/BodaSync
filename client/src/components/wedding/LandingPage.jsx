import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring
} from 'framer-motion';

import { useParams } from 'react-router-dom';

import FloatingControls from './components/FloatingControls';
import GoldenParticles from './components/GoldenParticles';
import LoadingInvitation from './components/LoadingInvitation';
import SectionDivider from './components/SectionDivider';
import WeddingEnvelope from './components/WeddingEnvelope';

import CalendarSection from './sections/CalendarSection';
import DressCodeSection from './sections/DressCodeSection';
import FooterSection from './sections/FooterSection';
import GiftsSection from './sections/GiftsSection';
import GuestBookSection from './sections/GuestBookSection';
import HeroSection from './sections/HeroSection';
import ItinerarySection from './sections/ItinerarySection';
import LocationSection from './sections/LocationSection';
import MessageSection from './sections/MessageSection';
import ParentsSection from './sections/ParentsSection';
import PhotoGallerySection from './sections/PhotoGallerySection';

import { pageEntrance } from './config/animations';

import {
  BLACK_TEXTURE,
  PAPER_TEXTURE,
  getStyles
} from './config/weddingStyles';

import useGuestMessages from './hooks/useGuestMessages';
import useSmartAudio from './hooks/useSmartAudio';
import useWeddingData from './hooks/useWeddingData';
import useWeddingTheme from './hooks/useWeddingTheme';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function hasText(...values) {
  return values.some((value) => Boolean(cleanText(value)));
}

function hasParentsData(wedding = {}) {
  return hasText(
    wedding.parents?.groom?.father,
    wedding.parents?.groom?.mother,
    wedding.parents?.bride?.father,
    wedding.parents?.bride?.mother,

    wedding.parents?.groomFather,
    wedding.parents?.groomMother,
    wedding.parents?.brideFather,
    wedding.parents?.brideMother
  );
}

function hasLocationData(wedding = {}) {
  return hasText(
    wedding.venue?.name,
    wedding.venue?.address,
    wedding.venue?.mapsUrl,
    wedding.venue?.googleMapsUrl,

    wedding.location?.venueName,
    wedding.location?.venueAddress,
    wedding.location?.mapsUrl,
    wedding.location?.googleMapsUrl,
    wedding.location?.name,
    wedding.location?.address,

    wedding.venueName,
    wedding.venueAddress,
    wedding.mapsUrl,
    wedding.googleMapsUrl,
    wedding.locationLabel,
    wedding.lugar
  );
}

function hasStoryData(wedding = {}) {
  return (
    hasText(
      wedding.story?.title,
      wedding.story?.text,
      wedding.story?.description,
      wedding.mainMessage,
      wedding.welcomeMessage
    ) ||
    Boolean(
      wedding.media?.coupleImage ||
        wedding.coupleImage
    )
  );
}

function hasGalleryData(wedding = {}) {
  const gallery =
    wedding.media?.gallery ||
    wedding.gallery ||
    wedding.photos ||
    [];

  return Array.isArray(gallery) && gallery.length > 0;
}

function hasItineraryData(wedding = {}) {
  const itinerary =
    wedding.itinerary ||
    wedding.schedule ||
    wedding.program ||
    [];

  return Array.isArray(itinerary) && itinerary.length > 0;
}

function hasDressCodeData(wedding = {}) {
  return hasText(
    wedding.dressCode?.title,
    wedding.dressCode?.women,
    wedding.dressCode?.men,
    wedding.dressCode?.notes,
    wedding.dressCode?.note
  );
}

function hasGiftData(wedding = {}) {
  return hasText(
    wedding.gifts?.message,
    wedding.gifts?.bankName,
    wedding.gifts?.accountHolder,
    wedding.gifts?.accountNumber,
    wedding.gifts?.clabe
  );
}

function AmbientBackground({
  isDark
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <motion.div
        animate={{
          x: [0, 25, 0],
          y: [0, -20, 0],
          scale: [1, 1.08, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`absolute -left-52 top-[10%] h-[520px] w-[520px] rounded-full blur-[170px] ${
          isDark
            ? 'bg-[#C5A059]/[0.04]'
            : 'bg-[#C5A059]/[0.07]'
        }`}
      />

      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
          scale: [1.05, 1, 1.05]
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`absolute -right-56 top-[55%] h-[540px] w-[540px] rounded-full blur-[180px] ${
          isDark
            ? 'bg-[#9E7A32]/[0.04]'
            : 'bg-[#D4AF37]/[0.055]'
        }`}
      />
    </div>
  );
}

function SectionFrame({
  children,
  isDark,
  variant = 'plain'
}) {
  const variantClass = {
    plain: 'bg-transparent',

    soft: isDark
      ? 'bg-gradient-to-b from-transparent via-white/[0.012] to-transparent'
      : 'bg-gradient-to-b from-transparent via-[#9E7A32]/[0.018] to-transparent',

    glow: isDark
      ? 'bg-gradient-to-b from-transparent via-[#C5A059]/[0.02] to-transparent'
      : 'bg-gradient-to-b from-transparent via-[#D4AF37]/[0.025] to-transparent'
  };

  return (
    <div
      className={`relative isolate overflow-hidden ${
        variantClass[variant] ||
        variantClass.plain
      }`}
    >
      {variant === 'glow' && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] ${
            isDark
              ? 'bg-[#C5A059]/[0.02]'
              : 'bg-[#D4AF37]/[0.035]'
          }`}
        />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function InvitationStatusScreen({
  isDark = false,
  title,
  message,
  actionLabel = '',
  onAction
}) {
  const styles = getStyles(isDark);

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-6 ${styles.bg}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-[0.16] ${
          isDark
            ? BLACK_TEXTURE
            : PAPER_TEXTURE
        }`}
      />

      <motion.div
        aria-hidden="true"
        animate={{
          opacity: [0.05, 0.12, 0.05],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] ${
          isDark
            ? 'bg-[#C5A059]'
            : 'bg-[#D4AF37]'
        }`}
      />

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
          scale: 0.95
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1]
        }}
        className={`relative z-10 w-full max-w-lg overflow-hidden rounded-[3rem] p-10 text-center sm:p-14 ${styles.glassBox}`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 opacity-[0.12] ${
            isDark
              ? BLACK_TEXTURE
              : PAPER_TEXTURE
          }`}
        />

        <motion.div
          aria-hidden="true"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`relative z-10 mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full border text-2xl ${
            isDark
              ? 'border-[#C5A059]/30 bg-[#C5A059]/10'
              : 'border-[#9E7A32]/20 bg-[#9E7A32]/10'
          }`}
        >
          ✦
        </motion.div>

        <h1
          className={`relative z-10 font-serif text-3xl sm:text-4xl ${styles.goldGradient}`}
        >
          {title}
        </h1>

        <p
          className={`relative z-10 mt-5 font-serif text-base italic leading-relaxed sm:text-lg ${styles.mutedText}`}
        >
          {message}
        </p>

        {actionLabel &&
          typeof onAction === 'function' && (
            <motion.button
              type="button"
              whileHover={{
                y: -3,
                scale: 1.02
              }}
              whileTap={{
                scale: 0.98
              }}
              onClick={onAction}
              className="relative z-10 mt-9 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#AA7C11] px-9 py-4 text-[10px] font-black uppercase tracking-[0.28em] text-black shadow-[0_15px_35px_rgba(197,160,89,0.3)]"
            >
              {actionLabel}
            </motion.button>
          )}
      </motion.div>
    </div>
  );
}

export function LandingPage() {
  const { slug = '' } = useParams();

  const shouldReduceMotion = useReducedMotion();

  const openingTimerRef = useRef(null);
  const openingRef = useRef(false);

  /*
   * Mantiene una referencia del control de música
   * para que PLAY / PAUSA no reinicie el sobre.
   */
  const setPlayingRef = useRef(null);

  const {
    wedding,
    loading,
    error,
    notFound,
    reloadWedding,
    sectionEnabled
  } = useWeddingData(slug);

  const {
    isDark,
    toggleTheme,
    allowThemeToggle
  } = useWeddingTheme({
    initialMode:
      wedding?.theme?.mode ||
      'light',

    allowToggle:
      wedding?.theme?.allowThemeToggle !== false
  });

  const galleryEnabled =
    sectionEnabled('gallery') &&
    hasGalleryData(wedding);

  const parentsEnabled =
    sectionEnabled('parents') &&
    hasParentsData(wedding);

  const storyEnabled =
    sectionEnabled('story') &&
    hasStoryData(wedding);

  const itineraryEnabled =
    sectionEnabled('itinerary') &&
    hasItineraryData(wedding);

  const locationEnabled =
    sectionEnabled('location') &&
    hasLocationData(wedding);

  const dressCodeEnabled =
    sectionEnabled('dressCode') &&
    hasDressCodeData(wedding);

  const giftsEnabled =
    sectionEnabled('gifts') &&
    hasGiftData(wedding);

  const musicEnabled =
    sectionEnabled('music');

  const guestBookEnabled =
    sectionEnabled('guestBook');

  const calendarEnabled =
    sectionEnabled('calendar') ||
    sectionEnabled('countdown');

  const publicSlug =
    wedding?.slug ||
    slug;

  const musicUrl =
    musicEnabled
      ? cleanText(
          wedding?.media?.musicUrl ||
            wedding?.media?.backgroundMusic ||
            wedding?.musicUrl ||
            wedding?.backgroundMusic
        )
      : '';

  const [
    playing,
    setPlaying,
    audioControls
  ] = useSmartAudio(
    musicUrl,
    {
      loop: true,
      volume: 0.85,
      fadeInDuration: 1800,
      fadeOutDuration: 700,
      pauseWhenHidden: true
    }
  );

  useEffect(() => {
    setPlayingRef.current =
      setPlaying;
  }, [setPlaying]);

  const {
    messages: guestMessages
  } = useGuestMessages(
    publicSlug,
    {
      enabled: Boolean(
        wedding &&
          guestBookEnabled &&
          publicSlug
      ),

      autoLoad: Boolean(
        wedding &&
          guestBookEnabled &&
          publicSlug
      )
    }
  );

  const [
    envelopeStep,
    setEnvelopeStep
  ] = useState(0);

  const {
    scrollYProgress
  } = useScroll();

  const progressScale =
    useSpring(
      scrollYProgress,
      {
        stiffness: 120,
        damping: 28,
        mass: 0.25,
        restDelta: 0.001
      }
    );

  const styles =
    getStyles(isDark);

  const invitationOpened =
    envelopeStep === 2;

  /*
   * Usamos únicamente la identidad real de
   * la invitación.
   *
   * Pausar/reanudar música NO modifica esto.
   */
  const weddingIdentity =
    wedding?.slug ||
    slug;

  const themeVariables =
    useMemo(
      () => ({
        '--wedding-primary':
          wedding?.theme?.primaryColor ||
          (isDark
            ? '#C5A059'
            : '#9E7A32'),

        '--wedding-secondary':
          wedding?.theme?.secondaryColor ||
          (isDark
            ? '#FCF6BA'
            : '#C5A059'),

        '--wedding-background':
          wedding?.theme?.backgroundColor ||
          (isDark
            ? '#050505'
            : '#F9F7F2'),

        '--wedding-text':
          wedding?.theme?.textColor ||
          (isDark
            ? '#FDFBF7'
            : '#111111')
      }),
      [
        isDark,
        wedding?.theme?.backgroundColor,
        wedding?.theme?.primaryColor,
        wedding?.theme?.secondaryColor,
        wedding?.theme?.textColor
      ]
    );

  useEffect(() => {
    return () => {
      if (
        openingTimerRef.current
      ) {
        window.clearTimeout(
          openingTimerRef.current
        );
      }

      openingRef.current =
        false;
    };
  }, []);

  /*
   * =====================================================
   * SOBRE
   * =====================================================
   *
   * Solo vuelve al estado cerrado cuando cambia
   * realmente de invitación.
   *
   * El botón de música NO puede provocar esto.
   */
  useEffect(() => {
    setEnvelopeStep(0);

    openingRef.current =
      false;

    if (
      openingTimerRef.current
    ) {
      window.clearTimeout(
        openingTimerRef.current
      );

      openingTimerRef.current =
        null;
    }

    setPlayingRef.current?.(
      false
    );

    if (
      typeof window !==
      'undefined'
    ) {
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    }
  }, [weddingIdentity]);

  /*
   * Si ya no hay música, solo se pausa.
   * Nunca tocamos envelopeStep aquí.
   */
  useEffect(() => {
    if (
      (!musicEnabled ||
        !musicUrl) &&
      playing
    ) {
      setPlaying(false);
    }
  }, [
    musicEnabled,
    musicUrl,
    playing,
    setPlaying
  ]);

  /*
   * =====================================================
   * UN SOLO TOQUE PARA ABRIR
   * =====================================================
   */
  const handleOpenInvitation =
    useCallback(() => {
      if (
        openingRef.current ||
        envelopeStep !== 0
      ) {
        return;
      }

      openingRef.current =
        true;

      setEnvelopeStep(1);

      /*
       * La interacción que abre el sobre
       * también inicia la música.
       */
      if (
        musicEnabled &&
        musicUrl
      ) {
        setPlaying(true);
      }

      if (
        openingTimerRef.current
      ) {
        window.clearTimeout(
          openingTimerRef.current
        );
      }

      /*
       * Después de la animación entra
       * automáticamente.
       *
       * NO necesita segundo toque.
       */
      openingTimerRef.current =
        window.setTimeout(
          () => {
            setEnvelopeStep(2);

            openingRef.current =
              false;

            openingTimerRef.current =
              null;
          },
          shouldReduceMotion
            ? 300
            : 2500
        );
    }, [
      envelopeStep,
      musicEnabled,
      musicUrl,
      setPlaying,
      shouldReduceMotion
    ]);

  if (loading) {
    return (
      <LoadingInvitation
        isDark={isDark}
        title="Preparando invitación"
        message="Estamos colocando cada detalle para este momento especial."
      />
    );
  }

  if (notFound) {
    return (
      <InvitationStatusScreen
        isDark={isDark}
        title="Invitación no encontrada"
        message="La dirección utilizada no corresponde a una invitación disponible."
        actionLabel="Intentar nuevamente"
        onAction={reloadWedding}
      />
    );
  }

  if (error) {
    return (
      <InvitationStatusScreen
        isDark={isDark}
        title="No pudimos cargar la invitación"
        message={error}
        actionLabel="Volver a intentar"
        onAction={reloadWedding}
      />
    );
  }

  if (!wedding) {
    return (
      <InvitationStatusScreen
        isDark={isDark}
        title="Invitación no disponible"
        message="No se encontró información para mostrar esta invitación."
        actionLabel="Recargar"
        onAction={reloadWedding}
      />
    );
  }

  return (
    <div
      style={themeVariables}
      className={`relative min-h-screen overflow-x-hidden font-serif selection:bg-[#C5A059] selection:text-black ${styles.bg}`}
    >
      {/*
       * Textura general.
       */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 opacity-[0.12] ${
          isDark
            ? BLACK_TEXTURE
            : PAPER_TEXTURE
        }`}
      />

      <AmbientBackground
        isDark={isDark}
      />

      {invitationOpened && (
        <GoldenParticles
          isDark={isDark}
        />
      )}

      {invitationOpened && (
        <>
          <motion.div
            aria-hidden="true"
            style={{
              scaleX:
                progressScale
            }}
            className="fixed left-0 right-0 top-0 z-[110] h-[2px] origin-left bg-gradient-to-r from-[#8A6414] via-[#FFF1B8] to-[#AA7C11] shadow-[0_0_14px_rgba(197,160,89,0.7)]"
          />

          <FloatingControls
            playing={playing}
            toggleAudio={
              audioControls.toggleAudio
            }
            isDark={isDark}
            toggleTheme={
              toggleTheme
            }
            allowThemeToggle={
              allowThemeToggle
            }
            showAudioControl={
              musicEnabled &&
              audioControls.hasAudio
            }
            audioReady={
              audioControls.ready
            }
            audioError={
              audioControls.error
            }
          />
        </>
      )}

      <WeddingEnvelope
        wedding={wedding}
        step={envelopeStep}
        onOpen={
          handleOpenInvitation
        }
        isDark={isDark}
      />

      {invitationOpened && (
        <motion.main
          variants={pageEntrance}
          initial="hidden"
          animate="visible"
          className={`relative z-10 mx-auto min-h-screen w-full max-w-[760px] overflow-hidden border-x shadow-[0_0_160px_rgba(0,0,0,0.10),0_0_180px_rgba(197,160,89,0.07)] transition-colors duration-1000 ${
            isDark
              ? 'border-white/[0.045] bg-[#080808]/95'
              : 'border-black/[0.045] bg-[#F9F7F2]/95'
          }`}
        >
          {/*
           * Líneas finas que dan sensación de
           * papelería/invitación impresa.
           */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-[22px] top-0 z-30 hidden w-px bg-gradient-to-b from-transparent via-[#C5A059]/10 to-transparent sm:block"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-[22px] top-0 z-30 hidden w-px bg-gradient-to-b from-transparent via-[#C5A059]/10 to-transparent sm:block"
          />

          {/*
           * HERO
           */}
          <SectionFrame
            isDark={isDark}
          >
            <HeroSection
              wedding={wedding}
              isDark={isDark}
            />
          </SectionFrame>

          {/*
           * MENSAJE / HISTORIA
           */}
          {storyEnabled && (
            <SectionFrame
              isDark={isDark}
              variant="soft"
            >
              <MessageSection
                wedding={wedding}
                isDark={isDark}
              />
            </SectionFrame>
          )}

          {/*
           * GALERÍA
           */}
          {galleryEnabled && (
            <SectionFrame
              isDark={isDark}
              variant="glow"
            >
              <SectionDivider
                text="Momentos inolvidables"
                isDark={isDark}
              />

              <PhotoGallerySection
                wedding={wedding}
                isDark={isDark}
              />
            </SectionFrame>
          )}

          {/*
           * PADRES
           */}
          {parentsEnabled && (
            <SectionFrame
              isDark={isDark}
              variant="soft"
            >
              <SectionDivider
                text="Con la bendición"
                isDark={isDark}
              />

              <ParentsSection
                wedding={wedding}
                isDark={isDark}
              />
            </SectionFrame>
          )}

          {/*
           * CALENDARIO / CUENTA REGRESIVA
           */}
          {calendarEnabled && (
            <SectionFrame
              isDark={isDark}
            >
              <SectionDivider
                variant="elegant"
                isDark={isDark}
              />

              <CalendarSection
                wedding={wedding}
                isDark={isDark}
              />
            </SectionFrame>
          )}

          {/*
           * UBICACIÓN + MAPA
           */}
          {locationEnabled && (
            <SectionFrame
              isDark={isDark}
              variant="glow"
            >
              <SectionDivider
                text="El lugar de nuestro gran día"
                isDark={isDark}
              />

              <LocationSection
                wedding={wedding}
                isDark={isDark}
              />
            </SectionFrame>
          )}

          {/*
           * ITINERARIO
           */}
          {itineraryEnabled && (
            <SectionFrame
              isDark={isDark}
              variant="soft"
            >
              <SectionDivider
                text="Nuestro gran día"
                isDark={isDark}
              />

              <ItinerarySection
                wedding={wedding}
                isDark={isDark}
              />
            </SectionFrame>
          )}

          {/*
           * CÓDIGO DE VESTIMENTA
           */}
          {dressCodeEnabled && (
            <SectionFrame
              isDark={isDark}
            >
              <SectionDivider
                text="Para este día especial"
                isDark={isDark}
              />

              <DressCodeSection
                wedding={wedding}
                isDark={isDark}
              />
            </SectionFrame>
          )}

          {/*
           * =================================================
           * REGALOS
           * =================================================
           *
           * SIN SectionDivider.
           *
           * GiftsSection ya tiene su propio:
           *
           * 🎁
           * UN DETALLE PARA NOSOTROS
           * Mesa de regalos
           *
           * No repetimos texto.
           */}
          {giftsEnabled && (
            <SectionFrame
              isDark={isDark}
              variant="glow"
            >
              <GiftsSection
                wedding={wedding}
                isDark={isDark}
              />
            </SectionFrame>
          )}

          {/*
           * =================================================
           * LIBRO DE FIRMAS
           * =================================================
           *
           * SIN:
           *
           * "DÉJANOS UN RECUERDO"
           *
           * GuestBookSection ya tiene su propio encabezado,
           * formulario y carrusel.
           *
           * Así evitamos la repetición y el espacio enorme
           * que se veía en tu captura.
           */}
          {guestBookEnabled && (
            <SectionFrame
              isDark={isDark}
              variant="soft"
            >
              <GuestBookSection
                wedding={wedding}
                messages={
                  guestMessages
                }
                isDark={isDark}
              />
            </SectionFrame>
          )}

          {/*
           * FOOTER
           */}
          <SectionFrame
            isDark={isDark}
          >
            <FooterSection
              wedding={wedding}
              isDark={isDark}
            />
          </SectionFrame>
        </motion.main>
      )}
    </div>
  );
}

export default LandingPage;