import React, { useEffect, useMemo, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform
} from 'framer-motion';

import {
  containerStagger,
  fadeInUp,
  scrollIndicatorAnimation
} from '../config/animations';

import { getStyles } from '../config/weddingStyles';

import {
  formatWeddingDateHero,
  parseWeddingDate
} from '../utils/dateUtils';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function firstText(...values) {
  for (const value of values) {
    const normalizedValue = cleanText(value);

    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return '';
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

function resolveMediaUrl(value) {
  let mediaValue = value;

  if (
    mediaValue &&
    typeof mediaValue === 'object'
  ) {
    mediaValue =
      mediaValue.url ||
      mediaValue.secureUrl ||
      mediaValue.secure_url ||
      mediaValue.fileUrl ||
      mediaValue.path ||
      '';
  }

  const mediaUrl = cleanText(mediaValue);

  if (!mediaUrl) {
    return '';
  }

  if (
    mediaUrl.startsWith('data:') ||
    mediaUrl.startsWith('blob:')
  ) {
    return mediaUrl;
  }

  if (/^https?:\/\//i.test(mediaUrl)) {
    return mediaUrl;
  }

  const serverOrigin = getServerOrigin();

  if (mediaUrl.startsWith('/uploads/')) {
    return `${serverOrigin}${mediaUrl}`;
  }

  if (mediaUrl.startsWith('uploads/')) {
    return `${serverOrigin}/${mediaUrl}`;
  }

  if (mediaUrl.startsWith('/')) {
    return mediaUrl;
  }

  return `${serverOrigin}/${mediaUrl}`;
}

function getHeroData(wedding = {}) {
  const groomName = firstText(
    wedding.groomName,
    wedding.novio
  );

  const brideName = firstText(
    wedding.brideName,
    wedding.novia
  );

  const eventDate = firstText(
    wedding.eventDate,
    wedding.fecha
  );

  const parsedDate = parseWeddingDate(
    eventDate
  );

  const formattedDate = parsedDate
    ? formatWeddingDateHero(eventDate)
    : '';

  const venueName = firstText(
    wedding.venue?.name,
    wedding.location?.venueName,
    wedding.location?.name,
    wedding.venueName
  );

  const venueAddress = firstText(
    wedding.venue?.address,
    wedding.location?.venueAddress,
    wedding.location?.address,
    wedding.venueAddress
  );

  const locationLabel = firstText(
    wedding.locationLabel,
    wedding.lugar,
    venueName,
    venueAddress
  );

  const coverImage = resolveMediaUrl(
    wedding.media?.coverImage ||
      wedding.coverImage
  );

  return {
    groomName,
    brideName,
    eventDate,
    formattedDate,
    venueName,
    venueAddress,
    locationLabel,
    coverImage
  };
}

export function HeroSection({
  wedding = {},
  isDark = false,
  eyebrow = 'Nuestra Boda',
  className = ''
}) {
  const shouldReduceMotion =
    useReducedMotion();

  const styles = getStyles(isDark);

  const { scrollYProgress } =
    useScroll();

  const heroParallax = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -250]
  );

  const heroData = useMemo(
    () => getHeroData(wedding),
    [wedding]
  );

  const [
    imageFailed,
    setImageFailed
  ] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [heroData.coverImage]);

  const hasCoverImage = Boolean(
    heroData.coverImage &&
      !imageFailed
  );

  const hasBothNames = Boolean(
    heroData.groomName &&
      heroData.brideName
  );

  const hasAnyName = Boolean(
    heroData.groomName ||
      heroData.brideName
  );

  const groomAnimation =
    shouldReduceMotion
      ? undefined
      : {
          y: [-4, 4, -4]
        };

  const brideAnimation =
    shouldReduceMotion
      ? undefined
      : {
          y: [4, -4, 4]
        };

  return (
    <header
      className={`relative z-30 flex min-h-screen items-center justify-center overflow-hidden px-6 text-center ${className}`}
    >
      {hasCoverImage && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0"
        >
          <motion.img
            src={heroData.coverImage}
            alt=""
            onError={() =>
              setImageFailed(true)
            }
            initial={
              shouldReduceMotion
                ? false
                : {
                    scale: 1.08
                  }
            }
            animate={{
              scale: 1
            }}
            transition={{
              duration: 2.5,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="h-full w-full object-cover"
          />

          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-black/65'
                : 'bg-black/45'
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/70" />
        </div>
      )}

      {!hasCoverImage && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${
            isDark
              ? 'bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.08),transparent_55%)]'
              : 'bg-[radial-gradient(circle_at_center,rgba(158,122,50,0.07),transparent_55%)]'
          }`}
        />
      )}

      <motion.div
        style={
          shouldReduceMotion
            ? undefined
            : {
                y: heroParallax
              }
        }
        variants={containerStagger}
        initial="hidden"
        animate="visible"
        className="relative z-20 flex w-full flex-col items-center"
      >
        {eyebrow && (
          <motion.div
            variants={fadeInUp}
          >
            <div className="mb-10 flex items-center gap-4 opacity-90 sm:mb-12 sm:gap-6">
              <div
                className={`h-px w-10 rounded-full sm:w-16 ${
                  hasCoverImage
                    ? 'bg-[#FCF6BA]'
                    : isDark
                      ? 'bg-[#C5A059]'
                      : 'bg-[#9E7A32]'
                }`}
              />

              <p
                className={`text-[9px] font-black uppercase tracking-[0.45em] drop-shadow-sm sm:text-xs sm:tracking-[0.6em] ${
                  hasCoverImage
                    ? 'text-[#FCF6BA]'
                    : styles.textSecondary
                }`}
              >
                {eyebrow}
              </p>

              <div
                className={`h-px w-10 rounded-full sm:w-16 ${
                  hasCoverImage
                    ? 'bg-[#FCF6BA]'
                    : isDark
                      ? 'bg-[#C5A059]'
                      : 'bg-[#9E7A32]'
                }`}
              />
            </div>
          </motion.div>
        )}

        {hasAnyName && (
          <motion.h1
            variants={containerStagger}
            className="relative z-20 flex w-full flex-col items-center justify-center"
          >
            {heroData.groomName && (
              <motion.span
                variants={fadeInUp}
                animate={groomAnimation}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className={`max-w-full break-words font-serif text-6xl font-medium leading-none tracking-tighter drop-shadow-2xl sm:text-8xl md:text-[9rem] ${
                  hasCoverImage
                    ? 'text-white'
                    : styles.textPrimary
                }`}
              >
                {heroData.groomName}
              </motion.span>
            )}

            {hasBothNames && (
              <motion.span
                variants={fadeInUp}
                className="-my-5 bg-gradient-to-r from-[#AA7C11] via-[#FFF3CC] to-[#AA7C11] bg-clip-text px-8 py-8 font-serif text-5xl italic leading-relaxed text-transparent drop-shadow-lg sm:-my-8 sm:px-12 sm:py-10 sm:text-7xl md:text-8xl"
              >
                &
              </motion.span>
            )}

            {heroData.brideName && (
              <motion.span
                variants={fadeInUp}
                animate={brideAnimation}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className={`max-w-full break-words font-serif text-6xl font-medium leading-none tracking-tighter drop-shadow-2xl sm:text-8xl md:text-[9rem] ${
                  hasCoverImage
                    ? 'text-white'
                    : styles.textPrimary
                }`}
              >
                {heroData.brideName}
              </motion.span>
            )}
          </motion.h1>
        )}

        {(heroData.formattedDate ||
          heroData.locationLabel) && (
          <motion.div
            variants={fadeInUp}
            className="mt-16 flex flex-col items-center sm:mt-20"
          >
            <div
              aria-hidden="true"
              className={`mb-8 h-16 w-px rounded-full bg-gradient-to-b sm:h-20 ${
                hasCoverImage
                  ? 'from-[#FCF6BA] to-transparent'
                  : isDark
                    ? 'from-[#C5A059] to-transparent'
                    : 'from-[#9E7A32] to-transparent'
              }`}
            />

            {heroData.formattedDate && (
              <time
                dateTime={
                  heroData.eventDate ||
                  undefined
                }
                className={`mb-4 font-serif text-xl font-light italic tracking-wider drop-shadow-md sm:text-2xl md:text-4xl ${
                  hasCoverImage
                    ? 'text-white'
                    : isDark
                      ? 'text-[#FCF6BA]'
                      : 'text-[#333333]'
                }`}
              >
                {heroData.formattedDate}
              </time>
            )}

            {heroData.locationLabel && (
              <p
                className={`max-w-lg text-center text-[9px] font-bold uppercase tracking-[0.4em] drop-shadow-md sm:text-xs sm:tracking-[0.6em] ${
                  hasCoverImage
                    ? 'text-[#FCF6BA]'
                    : styles.textSecondary
                }`}
              >
                {heroData.locationLabel}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        aria-hidden="true"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                y: scrollIndicatorAnimation.y,
                opacity:
                  scrollIndicatorAnimation.opacity
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : scrollIndicatorAnimation.transition
        }
        className={`absolute bottom-8 z-20 font-light sm:bottom-10 ${
          hasCoverImage
            ? 'text-[#FCF6BA]'
            : styles.textSecondary
        }`}
      >
        <div className="h-12 w-px bg-gradient-to-b from-current to-transparent opacity-70" />
      </motion.div>
    </header>
  );
}

export default HeroSection;