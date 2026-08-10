import React, { useEffect, useMemo, useState } from 'react';
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

export function MessageSection({
  wedding = {},
  message = '',
  isDark = false,
  showQuotationMarks = true,
  className = ''
}) {
  const shouldReduceMotion =
    useReducedMotion();

  const styles = getStyles(isDark);

  const resolvedMessage = useMemo(
    () =>
      firstText(
        message,
        wedding.story?.text,
        wedding.story?.description,
        wedding.mainMessage,
        wedding.mensajePrincipal,
        wedding.welcomeMessage,
        wedding.message
      ),
    [message, wedding]
  );

  const storyTitle = useMemo(
    () =>
      firstText(
        wedding.story?.title,
        wedding.storyTitle
      ),
    [wedding]
  );

  const coupleImage = useMemo(
    () =>
      resolveMediaUrl(
        wedding.media?.coupleImage ||
          wedding.coupleImage
      ),
    [wedding]
  );

  const [imageFailed, setImageFailed] =
    useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [coupleImage]);

  const hasCoupleImage = Boolean(
    coupleImage && !imageFailed
  );

  const hasMessage = Boolean(
    resolvedMessage
  );

  if (!hasMessage && !hasCoupleImage) {
    return null;
  }

  return (
    <section
      aria-label="Historia de los novios"
      className={`relative overflow-hidden border-y px-6 py-24 sm:px-10 sm:py-32 ${
        isDark
          ? 'border-white/5 bg-[#050505]'
          : 'border-black/5 bg-[#EAE6DE]'
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay ${
          isDark
            ? BLACK_TEXTURE
            : PAPER_TEXTURE
        }`}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] ${
          isDark
            ? 'bg-[#C5A059]/5'
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
        className="relative z-10 mx-auto max-w-5xl"
      >
        {storyTitle && (
          <motion.header
            variants={fadeInUp}
            className="mb-14 text-center"
          >
            <p
              className={`mb-4 text-[9px] font-black uppercase tracking-[0.45em] ${styles.textSecondary}`}
            >
              Nuestra historia
            </p>

            <h2
              className={`font-serif text-4xl font-light sm:text-5xl ${styles.goldGradient}`}
            >
              {storyTitle}
            </h2>

            <div
              aria-hidden="true"
              className={`mx-auto mt-7 h-px w-28 bg-gradient-to-r ${styles.dividerLine}`}
            />
          </motion.header>
        )}

        <div
          className={`grid items-center gap-12 ${
            hasCoupleImage &&
            hasMessage
              ? 'md:grid-cols-2 md:gap-16'
              : 'grid-cols-1'
          }`}
        >
          {hasCoupleImage && (
            <motion.div
              variants={fadeInUp}
              className={`relative mx-auto w-full ${
                hasMessage
                  ? 'max-w-lg'
                  : 'max-w-2xl'
              }`}
            >
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[3rem] border border-[#C5A059]/20"
              />

              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-[3.5rem] border border-[#C5A059]/10"
              />

              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
                <motion.img
                  src={coupleImage}
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
                  whileInView={{
                    scale: 1
                  }}
                  viewport={{
                    once: true
                  }}
                  transition={{
                    duration:
                      shouldReduceMotion
                        ? 0.2
                        : 2,
                    ease: [
                      0.16,
                      1,
                      0.3,
                      1
                    ]
                  }}
                  className="h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </div>
            </motion.div>
          )}

          {hasMessage && (
            <motion.div
              variants={containerStagger}
              className={`flex flex-col ${
                hasCoupleImage
                  ? 'items-center text-center md:items-start md:text-left'
                  : 'mx-auto max-w-3xl items-center text-center'
              }`}
            >
              {showQuotationMarks && (
                <motion.span
                  aria-hidden="true"
                  variants={fadeInUp}
                  className={`-mb-7 block font-serif text-[8rem] font-black leading-none opacity-20 sm:text-[10rem] ${styles.textSecondary}`}
                >
                  “
                </motion.span>
              )}

              <motion.blockquote
                variants={fadeInUp}
                className={`relative z-10 font-serif text-xl font-light italic leading-loose sm:text-2xl md:text-3xl ${
                  isDark
                    ? 'text-[#E0E0E0]'
                    : 'text-[#444444]'
                }`}
              >
                {showQuotationMarks
                  ? `“${resolvedMessage}”`
                  : resolvedMessage}
              </motion.blockquote>

              <motion.div
                aria-hidden="true"
                variants={fadeInUp}
                className={`mt-10 h-px w-24 bg-gradient-to-r ${styles.dividerLine}`}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export default MessageSection;