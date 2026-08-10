import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import CalendarCard from '../cards/CalendarCard';

import {
  containerStagger,
  fadeInUp
} from '../config/animations';

import { getStyles } from '../config/weddingStyles';

import {
  createWeddingCalendarData,
  downloadCalendarFile,
  openGoogleCalendar
} from '../utils/calendarUtils';

import { isValidWeddingDate } from '../utils/dateUtils';

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
    return new URL(apiUrl).origin;
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

function getBackgroundImage(wedding = {}) {
  return resolveMediaUrl(
    wedding.media?.coverImage ||
      wedding.media?.coupleImage ||
      wedding.coverImage ||
      wedding.coupleImage
  );
}

function getWeddingLocation(wedding = {}) {
  return firstText(
    wedding.venue?.name,
    wedding.location?.venueName,
    wedding.location?.name,
    wedding.locationLabel,
    wedding.venue?.address,
    wedding.location?.venueAddress,
    wedding.location?.address,
    wedding.lugar
  );
}

export function CalendarSection({
  wedding = {},
  isDark = false,
  title = 'Reserva la fecha',
  eyebrow = 'Nuestro gran día',
  showDownloadButton = true,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  const [actionError, setActionError] =
    useState('');

  const [imageFailed, setImageFailed] =
    useState(false);

  const eventDate =
    wedding.eventDate ||
    wedding.fecha ||
    '';

  const backgroundImage =
    getBackgroundImage(wedding);

  const location =
    getWeddingLocation(wedding);

  const hasBackgroundImage = Boolean(
    backgroundImage &&
      !imageFailed
  );

  const calendarData = useMemo(
    () => createWeddingCalendarData(wedding),
    [wedding]
  );

  const hasValidDate =
    isValidWeddingDate(eventDate);

  function handleOpenGoogleCalendar() {
    setActionError('');

    const opened =
      openGoogleCalendar(calendarData);

    if (!opened) {
      setActionError(
        'No fue posible abrir Google Calendar.'
      );
    }
  }

  function handleDownloadCalendar() {
    setActionError('');

    const downloaded =
      downloadCalendarFile(calendarData);

    if (!downloaded) {
      setActionError(
        'No fue posible generar el archivo de calendario.'
      );
    }
  }

  if (!hasValidDate) {
    return null;
  }

  return (
    <section
      aria-labelledby="calendar-section-title"
      className={`relative overflow-hidden px-4 py-24 sm:px-6 ${className}`}
    >
      <div
        className={`relative mx-auto min-h-[820px] w-full max-w-6xl overflow-hidden rounded-[3rem] border shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:min-h-[900px] ${
          isDark
            ? 'border-white/10 bg-[#090909]'
            : 'border-black/5 bg-[#EAE6DE]'
        }`}
      >
        {hasBackgroundImage && (
          <motion.img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            onError={() =>
              setImageFailed(true)
            }
            initial={
              shouldReduceMotion
                ? false
                : {
                    scale: 1.15,
                    y: -40
                  }
            }
            whileInView={{
              scale: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration:
                shouldReduceMotion
                  ? 0.3
                  : 18,
              ease: 'linear'
            }}
            className="absolute inset-0 h-full w-full object-cover grayscale"
          />
        )}

        {!hasBackgroundImage && (
          <div
            aria-hidden="true"
            className={`absolute inset-0 ${
              isDark
                ? 'bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.12),#050505_70%)]'
                : 'bg-[radial-gradient(circle_at_center,rgba(158,122,50,0.12),#EAE6DE_70%)]'
            }`}
          />
        )}

        {hasBackgroundImage && (
          <>
            <div
              aria-hidden="true"
              className={`absolute inset-0 ${
                isDark
                  ? 'bg-black/65'
                  : 'bg-black/50'
              }`}
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.55)_100%)]"
            />
          </>
        )}

        <motion.div
          variants={containerStagger}
          initial={
            shouldReduceMotion
              ? false
              : 'hidden'
          }
          whileInView="visible"
          viewport={{
            once: true,
            margin: '-80px'
          }}
          className="relative z-10 flex min-h-[820px] flex-col items-center justify-center px-5 py-16 text-center sm:min-h-[900px] sm:px-8"
        >
          <motion.div
            aria-hidden="true"
            variants={fadeInUp}
            className="mb-8 h-16 w-px bg-gradient-to-b from-transparent to-[#C5A059]"
          />

          {eyebrow && (
            <motion.p
              variants={fadeInUp}
              className={`mb-4 text-[9px] font-black uppercase tracking-[0.5em] drop-shadow-lg sm:text-[11px] ${
                hasBackgroundImage
                  ? 'text-[#FCF6BA]'
                  : styles.textSecondary
              }`}
            >
              {eyebrow}
            </motion.p>
          )}

          <motion.h2
            id="calendar-section-title"
            variants={fadeInUp}
            className={`mb-10 font-serif text-4xl font-light drop-shadow-xl sm:text-5xl md:text-6xl ${
              hasBackgroundImage
                ? 'text-white'
                : styles.textPrimary
            }`}
          >
            {title}
          </motion.h2>

          {location && (
            <motion.p
              variants={fadeInUp}
              className={`mb-10 max-w-md text-[10px] font-bold uppercase tracking-[0.35em] ${
                hasBackgroundImage
                  ? 'text-white/75'
                  : styles.textSecondary
              }`}
            >
              {location}
            </motion.p>
          )}

          <motion.div
            variants={fadeInUp}
            className="w-full"
          >
            <CalendarCard
              targetDate={eventDate}
              isDark={isDark}
              title={title}
            />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-10 flex w-full max-w-[360px] flex-col gap-4"
          >
            <motion.button
              type="button"
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: -4,
                      scale: 1.02
                    }
              }
              whileTap={{
                scale: 0.98
              }}
              onClick={
                handleOpenGoogleCalendar
              }
              className="relative w-full overflow-hidden rounded-full border border-white/30 bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#AA7C11] px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-[#0A0A0A] shadow-[0_15px_40px_rgba(197,160,89,0.4)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                Agendar en Google

                <span
                  aria-hidden="true"
                  className="text-base"
                >
                  📅
                </span>
              </span>
            </motion.button>

            {showDownloadButton && (
              <motion.button
                type="button"
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -3,
                        scale: 1.01
                      }
                }
                whileTap={{
                  scale: 0.98
                }}
                onClick={
                  handleDownloadCalendar
                }
                className={`w-full rounded-full border px-6 py-4 text-[9px] font-black uppercase tracking-[0.28em] shadow-lg backdrop-blur-xl transition-colors ${
                  hasBackgroundImage
                    ? 'border-white/20 bg-black/40 text-[#FCF6BA] hover:bg-white/10'
                    : isDark
                      ? 'border-white/10 bg-white/5 text-[#FCF6BA]'
                      : 'border-black/10 bg-white/50 text-[#7A5A1B]'
                }`}
              >
                Descargar calendario
              </motion.button>
            )}
          </motion.div>

          {actionError && (
            <motion.p
              role="alert"
              initial={{
                opacity: 0,
                y: 8
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="mt-6 max-w-sm rounded-2xl border border-red-300/30 bg-red-950/70 px-5 py-3 text-xs text-red-100 backdrop-blur-md"
            >
              {actionError}
            </motion.p>
          )}

          <motion.div
            aria-hidden="true"
            variants={fadeInUp}
            className={`mt-12 h-px w-32 bg-gradient-to-r ${styles.dividerLine}`}
          />
        </motion.div>
      </div>
    </section>
  );
}

export default CalendarSection;