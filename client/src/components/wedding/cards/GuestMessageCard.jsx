import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { getStyles } from '../config/weddingStyles';

function cleanText(value, fallback = '') {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : fallback;
}

function normalizeMessage(message = {}) {
  return {
    id: message.id || message._id || '',
    message: cleanText(
      message.message ||
        message.mensaje ||
        message.content ||
        message.text,
      'Un mensaje especial para los novios.'
    ),
    author: cleanText(
      message.author ||
        message.nombre ||
        message.name,
      'Invitado'
    ),
    createdAt:
      message.createdAt ||
      message.created_at ||
      message.date ||
      '',
    type: cleanText(message.type, 'message')
  };
}

function formatMessageDate(dateValue) {
  if (!dateValue) {
    return '';
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(parsedDate);
}

export function GuestMessageCard({
  message = {},
  index = 0,
  isDark = false,
  layoutId,
  onOpen,
  rotation,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  const normalizedMessage = useMemo(
    () => normalizeMessage(message),
    [message]
  );

  const resolvedLayoutId =
    layoutId ||
    `guest-message-${normalizedMessage.id || index + 1}`;

  const cardRotation =
    typeof rotation === 'number'
      ? rotation
      : index % 2 === 0
        ? 4
        : -4;

  const formattedDate = formatMessageDate(
    normalizedMessage.createdAt
  );

  function handleOpen() {
    if (typeof onOpen !== 'function') {
      return;
    }

    onOpen({
      ...normalizedMessage,
      uniqueId: resolvedLayoutId
    });
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
    }
  }

  return (
    <motion.article
      layoutId={resolvedLayoutId}
      role="button"
      tabIndex={0}
      aria-label={`Leer mensaje de ${normalizedMessage.author}`}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              y: 30,
              rotate: cardRotation
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        rotate: cardRotation
      }}
      viewport={{
        once: true,
        margin: '-40px'
      }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              scale: 1.05,
              rotate: 0,
              y: -15,
              zIndex: 30
            }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : {
              scale: 0.98
            }
      }
      transition={{
        duration: 0.7,
        delay: Math.min(index * 0.08, 0.4),
        ease: [0.16, 1, 0.3, 1]
      }}
      className={`relative flex h-[240px] w-[320px] shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-[2rem] p-8 text-left shadow-[0_15px_40px_rgba(0,0,0,0.3)] outline-none transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-4 ${
        isDark
          ? 'focus-visible:ring-offset-[#050505]'
          : 'focus-visible:ring-offset-[#F9F7F2]'
      } ${styles.glassBox} ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl ${
          isDark
            ? 'bg-[#C5A059]/10'
            : 'bg-[#9E7A32]/10'
        }`}
      />

      <span
        aria-hidden="true"
        className={`absolute -top-2 left-6 font-serif text-7xl opacity-10 ${styles.textSecondary}`}
      >
        “
      </span>

      <div className="relative z-10 mt-6 min-h-0 flex-1 overflow-hidden">
        <p
          className={`line-clamp-4 font-serif text-base italic leading-relaxed ${styles.textPrimary}`}
        >
          “{normalizedMessage.message}”
        </p>
      </div>

      <footer className="relative z-10 mt-4 border-t border-[#C5A059]/20 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-[10px] font-black uppercase tracking-widest ${styles.textSecondary}`}
            >
              — {normalizedMessage.author}
            </p>

            {formattedDate && (
              <time
                dateTime={normalizedMessage.createdAt}
                className={`mt-2 block text-[8px] font-bold uppercase tracking-[0.2em] opacity-45 ${styles.textPrimary}`}
              >
                {formattedDate}
              </time>
            )}
          </div>

          <motion.span
            aria-hidden="true"
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    rotate: -12,
                    scale: 1.15
                  }
            }
            className="shrink-0 text-sm opacity-40"
          >
            🖋️
          </motion.span>
        </div>
      </footer>
    </motion.article>
  );
}

export default GuestMessageCard;