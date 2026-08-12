import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import {
  containerStagger,
  fadeInUp
} from '../config/animations';

import {
  STARDUST_TEXTURE,
  getStyles
} from '../config/weddingStyles';

function cleanText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalizedValue = value.trim();

  return normalizedValue || fallback;
}

function getWeddingYear(wedding = {}) {
  const eventDate = wedding.eventDate || wedding.fecha || '';

  const parsedDate = new Date(eventDate);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.getFullYear();
  }

  return new Date().getFullYear();
}

function createWhatsAppUrl(phone, message) {
  const normalizedPhone = String(phone || '').replace(/\D/g, '');

  if (!normalizedPhone) {
    return '';
  }

  const params = new URLSearchParams({
    text: cleanText(
      message,
      'Hola, me gustaría solicitar información sobre una invitación digital.'
    )
  });

  return `https://wa.me/${normalizedPhone}?${params.toString()}`;
}

export function FooterSection({
  wedding = {},
  isDark = false,
  showBranding = true,
  developerName = 'JOSUE PEREZ PONCE',
  contactPhone = '525642050757',
  contactMessage = '',
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  const groomName = cleanText(
    wedding.groomName || wedding.novio
  );

  const brideName = cleanText(
    wedding.brideName || wedding.novia
  );

  const weddingYear = getWeddingYear(wedding);

  const coupleNames = useMemo(() => {
    if (groomName && brideName) {
      return `${groomName} & ${brideName}`;
    }

    return groomName || brideName || '';
  }, [brideName, groomName]);

  const whatsAppUrl = useMemo(() => {
    if (!showBranding) {
      return '';
    }

    const defaultMessage =
      contactMessage ||
      (coupleNames
        ? `Hola, vi la invitación digital de ${coupleNames} y me gustaría solicitar información sobre una invitación.`
        : 'Hola, vi una invitación digital de BodaSync y me gustaría solicitar información.');

    return createWhatsAppUrl(
      contactPhone,
      defaultMessage
    );
  }, [
    contactMessage,
    contactPhone,
    coupleNames,
    showBranding
  ]);

  return (
    <footer
      className={`relative overflow-hidden border-t px-6 py-24 text-center ${
        isDark
          ? 'border-white/10 bg-[#050505]'
          : 'border-black/5 bg-[#EAE6DE]'
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-[0.15] ${STARDUST_TEXTURE}`}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[150px] ${
          isDark
            ? 'bg-[#C5A059]/8'
            : 'bg-[#9E7A32]/10'
        }`}
      />

      <motion.div
        variants={containerStagger}
        initial={shouldReduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{
          once: true,
          margin: '-80px'
        }}
        className="relative z-10 mx-auto flex max-w-2xl flex-col items-center"
      >
        <motion.div
          variants={fadeInUp}
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  rotate: 10,
                  scale: 1.08
                }
          }
          aria-hidden="true"
          className="mb-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#C5A059] text-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.2)]"
        >
          ⚜
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className={`mb-4 text-[9px] font-black uppercase tracking-[0.45em] ${styles.textSecondary}`}
        >
          Gracias por acompañarnos
        </motion.p>

        {coupleNames && (
          <motion.h2
            variants={fadeInUp}
            className={`font-serif text-4xl tracking-tight drop-shadow-md sm:text-5xl md:text-6xl ${styles.goldGradient}`}
          >
            {coupleNames}
          </motion.h2>
        )}

        <motion.p
          variants={fadeInUp}
          className={`mx-auto mt-8 max-w-lg font-serif text-base font-light italic leading-relaxed opacity-80 sm:text-lg ${styles.textPrimary}`}
        >
          Nos llena de alegría compartir este momento tan especial con las
          personas que forman parte de nuestra historia.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          aria-hidden="true"
          className={`mx-auto my-14 h-px w-40 bg-gradient-to-r ${styles.dividerLine}`}
        />

        <motion.p
          variants={fadeInUp}
          className={`text-[9px] font-black uppercase tracking-[0.4em] opacity-60 sm:text-[10px] sm:tracking-[0.5em] ${styles.textSecondary}`}
        >
          © {weddingYear}
          {coupleNames ? ` ${coupleNames}` : ''}
        </motion.p>

        {showBranding && (
          <motion.div
            variants={fadeInUp}
            className={`mt-14 flex w-full flex-col items-center justify-between gap-8 border-t pt-10 md:mt-20 md:flex-row md:pt-12 ${
              isDark
                ? 'border-white/10'
                : 'border-black/5'
            }`}
          >
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <p
                className={`mb-3 text-[8px] font-bold uppercase tracking-[0.4em] opacity-50 ${
                  isDark
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                Invitación digital
              </p>

              <p
                className={`font-sans text-xs font-bold tracking-[0.25em] ${styles.textPrimary}`}
              >
                {developerName}
              </p>
            </div>

            {whatsAppUrl && (
              <motion.a
                href={whatsAppUrl}
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
                aria-label="Solicitar información por WhatsApp"
                className={`flex items-center justify-center gap-4 rounded-full border px-8 py-4 text-[9px] font-black uppercase tracking-[0.35em] shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-500 ${
                  isDark
                    ? 'border-white/10 bg-[#111111] text-[#FCF6BA] hover:border-transparent hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#AA7C11] hover:text-black'
                    : 'border-black/10 bg-white text-[#9E7A32] hover:border-transparent hover:bg-gradient-to-r hover:from-[#9E7A32] hover:to-[#7A5A1B] hover:text-white'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="text-base"
                >
                  📱
                </span>

                Solicitar información
              </motion.a>
            )}
          </motion.div>
        )}
      </motion.div>
    </footer>
  );
}

export default FooterSection;