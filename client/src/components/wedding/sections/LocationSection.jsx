import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import {
  containerStagger,
  fadeInUp
} from '../config/animations';

import {
  BLACK_TEXTURE,
  PAPER_TEXTURE,
  getStyles
} from '../config/weddingStyles';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeMapsUrl(value) {
  const cleanValue = cleanText(value);

  if (!cleanValue) {
    return '';
  }

  try {
    const valueWithProtocol = /^https?:\/\//i.test(cleanValue)
      ? cleanValue
      : `https://${cleanValue}`;

    const url = new URL(valueWithProtocol);

    if (
      url.protocol !== 'http:' &&
      url.protocol !== 'https:'
    ) {
      return '';
    }

    return url.toString();
  } catch {
    return '';
  }
}

function getVenueData(wedding = {}) {
  const venue = wedding?.venue || {};
  const location = wedding?.location || {};

  return {
    name: cleanText(
      venue.name ||
        location.venueName ||
        location.name ||
        wedding.venueName
    ),

    address: cleanText(
      venue.address ||
        location.venueAddress ||
        location.address ||
        wedding.venueAddress ||
        wedding.locationLabel ||
        wedding.lugar
    ),

    mapsUrl: normalizeMapsUrl(
      venue.mapsUrl ||
        venue.googleMapsUrl ||
        location.mapsUrl ||
        location.googleMapsUrl ||
        wedding.mapsUrl ||
        wedding.googleMapsUrl
    )
  };
}

/*
 * Intenta sacar una búsqueda útil de una URL
 * normal de Google Maps.
 *
 * Por ejemplo:
 *
 * google.com/maps/place/Hacienda+...
 * google.com/maps?q=...
 * google.com/maps/search/?api=1&query=...
 */
function getQueryFromMapsUrl(mapsUrl) {
  if (!mapsUrl) {
    return '';
  }

  try {
    const url = new URL(mapsUrl);

    const query =
      url.searchParams.get('q') ||
      url.searchParams.get('query') ||
      url.searchParams.get('destination');

    if (query) {
      return cleanText(query);
    }

    const placeMatch = url.pathname.match(
      /\/maps\/place\/([^/]+)/i
    );

    if (placeMatch?.[1]) {
      return decodeURIComponent(
        placeMatch[1]
      ).replace(/\+/g, ' ');
    }

    const searchMatch = url.pathname.match(
      /\/maps\/search\/([^/]+)/i
    );

    if (searchMatch?.[1]) {
      return decodeURIComponent(
        searchMatch[1]
      ).replace(/\+/g, ' ');
    }

    return '';
  } catch {
    return '';
  }
}

/*
 * Construimos la búsqueda del mapa.
 *
 * Lo mejor para incrustar es tener:
 *
 * nombre del lugar + dirección
 */
function createMapQuery(venue) {
  const locationText = [
    cleanText(venue.name),
    cleanText(venue.address)
  ]
    .filter(Boolean)
    .join(', ');

  if (locationText) {
    return locationText;
  }

  return getQueryFromMapsUrl(
    venue.mapsUrl
  );
}

/*
 * Google Maps permite esta forma sencilla
 * para mostrar un mapa sin necesitar una
 * API key.
 */
function createEmbedUrl(venue) {
  const query = createMapQuery(venue);

  if (!query) {
    return '';
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(
    query
  )}&output=embed`;
}

/*
 * Para el botón "Cómo llegar":
 *
 * 1. Si el administrador guardó un enlace real,
 *    usamos exactamente ese enlace.
 *
 * 2. Si no, generamos una búsqueda de Maps.
 */
function createDirectionsUrl(venue) {
  if (venue.mapsUrl) {
    return venue.mapsUrl;
  }

  const query = createMapQuery(venue);

  if (!query) {
    return '';
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

export function LocationSection({
  wedding = {},
  isDark = false,
  title = 'Ubicación',
  eyebrow = 'Dónde celebraremos',
  className = ''
}) {
  const shouldReduceMotion =
    useReducedMotion();

  const styles =
    getStyles(isDark);

  const venue = useMemo(
    () => getVenueData(wedding),
    [wedding]
  );

  const mapEmbedUrl = useMemo(
    () => createEmbedUrl(venue),
    [venue]
  );

  const directionsUrl = useMemo(
    () => createDirectionsUrl(venue),
    [venue]
  );

  const hasVenueInformation = Boolean(
    venue.name ||
      venue.address ||
      venue.mapsUrl
  );

  if (!hasVenueInformation) {
    return null;
  }

  return (
    <section
      aria-labelledby="location-section-title"
      className={`relative overflow-hidden px-6 py-28 text-center ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-20 ${
          isDark
            ? BLACK_TEXTURE
            : PAPER_TEXTURE
        }`}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] ${
          isDark
            ? 'bg-[#C5A059]/10'
            : 'bg-[#9E7A32]/10'
        }`}
      />

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
        className="relative z-10 mx-auto max-w-3xl"
      >
        <motion.div
          variants={fadeInUp}
          className="mb-8 text-6xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)]"
          aria-hidden="true"
        >
          📍
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className={`mb-4 text-[10px] font-black uppercase tracking-[0.45em] ${
            isDark
              ? 'text-[#FCF6BA]'
              : 'text-[#8A6927]'
          }`}
        >
          {eyebrow}
        </motion.p>

        <motion.h2
          id="location-section-title"
          variants={fadeInUp}
          className={`font-serif text-4xl tracking-tight sm:text-5xl ${styles.goldGradient}`}
        >
          {title}
        </motion.h2>

        <motion.div
          variants={fadeInUp}
          className={`mx-auto mt-12 overflow-hidden rounded-[3rem] ${styles.glassBox}`}
        >
          {/*
           * ==============================
           * INFORMACIÓN DEL LUGAR
           * ==============================
           */}
          <div className="px-8 pb-10 pt-10 sm:px-12 sm:pb-12 sm:pt-12">
            {venue.name && (
              <h3
                className={`font-serif text-2xl leading-tight sm:text-3xl ${styles.textPrimary}`}
              >
                {venue.name}
              </h3>
            )}

            {venue.address && (
              <div className="mx-auto mt-7 max-w-xl">
                <p
                  className={`text-xs font-bold uppercase tracking-[0.22em] ${styles.textSecondary}`}
                >
                  Dirección
                </p>

                <p
                  className={`mt-3 font-serif text-base leading-relaxed sm:text-lg ${styles.textPrimary}`}
                >
                  {venue.address}
                </p>
              </div>
            )}
          </div>

          {/*
           * ==============================
           * MAPA VISIBLE
           * ==============================
           */}
          {mapEmbedUrl && (
            <motion.div
              variants={fadeInUp}
              className="px-4 pb-4 sm:px-6 sm:pb-6"
            >
              <div
                className={`relative overflow-hidden rounded-[2.2rem] border shadow-[0_25px_70px_rgba(0,0,0,0.20)] ${
                  isDark
                    ? 'border-[#C5A059]/25 bg-black/30'
                    : 'border-[#9E7A32]/20 bg-white/40'
                }`}
              >
                {/*
                 * Franja superior decorativa
                 */}
                <div
                  className={`flex items-center justify-between border-b px-5 py-4 ${
                    isDark
                      ? 'border-white/10 bg-black/30'
                      : 'border-black/5 bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 text-base">
                      📍
                    </div>

                    <div className="text-left">
                      <p
                        className={`text-[8px] font-black uppercase tracking-[0.3em] ${styles.textSecondary}`}
                      >
                        Ver en el mapa
                      </p>

                      {venue.name && (
                        <p
                          className={`mt-1 max-w-[210px] truncate font-serif text-sm ${styles.textPrimary}`}
                        >
                          {venue.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    aria-hidden="true"
                    className="font-serif text-xl text-[#C5A059]"
                  >
                    ✦
                  </span>
                </div>

                {/*
                 * Google Maps real dentro
                 * de la invitación.
                 */}
                <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
                  <iframe
                    title={
                      venue.name
                        ? `Mapa de ${venue.name}`
                        : 'Mapa de la celebración'
                    }
                    src={mapEmbedUrl}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 h-full w-full border-0"
                  />

                  {/*
                   * Este borde interior ayuda
                   * a que el iframe se vea
                   * integrado con la invitación.
                   */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-b-[2.2rem] ring-1 ring-inset ring-[#C5A059]/10"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/*
           * ==============================
           * BOTÓN CÓMO LLEGAR
           * ==============================
           */}
          {directionsUrl && (
            <motion.div
              variants={fadeInUp}
              className="px-8 pb-10 pt-5 sm:px-12 sm:pb-12"
            >
              <motion.a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
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
                className="mx-auto flex w-full max-w-sm items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#AA7C11] px-7 py-5 text-[10px] font-black uppercase tracking-[0.28em] text-black shadow-[0_15px_40px_rgba(197,160,89,0.35)] transition-shadow hover:shadow-[0_20px_50px_rgba(197,160,89,0.55)]"
              >
                <span
                  aria-hidden="true"
                  className="text-base"
                >
                  ↗
                </span>

                <span>
                  Cómo llegar
                </span>
              </motion.a>

              <p
                className={`mx-auto mt-5 max-w-md text-[9px] uppercase tracking-[0.2em] ${styles.mutedText}`}
              >
                Abre Google Maps para iniciar tu ruta
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          aria-hidden="true"
          variants={fadeInUp}
          className={`mx-auto mt-14 h-px w-28 bg-gradient-to-r ${styles.dividerLine}`}
        />
      </motion.div>
    </section>
  );
}

export default LocationSection;