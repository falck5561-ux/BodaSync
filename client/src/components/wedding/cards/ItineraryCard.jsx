import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import {
  fadeInUp,
  itineraryCardHover
} from '../config/animations';

import { getStyles } from '../config/weddingStyles';
import { formatItineraryTimeWithSuffix } from '../utils/dateUtils';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

export function ItineraryCard({
  item = {},
  isDark = false,
  align = 'right',
  showIcon = true,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  const time = cleanText(
    item.time ||
      item.hour
  );

  const subtitle = cleanText(
    item.subtitle ||
      item.label
  );

  const title = cleanText(
    item.title ||
      item.name ||
      item.activity
  );

  const description = cleanText(
    item.description ||
      item.details ||
      item.desc
  );

  const location = cleanText(
    item.location ||
      item.place
  );

  const icon = cleanText(item.icon);

  const formattedTime = time
    ? formatItineraryTimeWithSuffix(time)
    : '';

  const hasContent = Boolean(
    formattedTime ||
      subtitle ||
      title ||
      description ||
      location
  );

  if (!hasContent) {
    return null;
  }

  const isLeftAligned = align === 'left';

  const contentAlignment = isLeftAligned
    ? 'md:text-left md:items-start'
    : 'md:text-right md:items-end';

  const timeAlignment = isLeftAligned
    ? 'md:justify-start'
    : 'md:justify-end';

  return (
    <motion.article
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        margin: '-80px'
      }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : itineraryCardHover
      }
      className={`relative flex w-full flex-col overflow-hidden rounded-[2.5rem] p-8 transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(197,160,89,0.15)] md:p-12 ${styles.glassBox} ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl ${
          isDark
            ? 'bg-[#C5A059]/10'
            : 'bg-[#9E7A32]/10'
        }`}
      />

      <div
        className={`relative z-10 flex h-full flex-col items-start text-left ${contentAlignment}`}
      >
        {formattedTime && (
          <div
            className={`mb-6 flex w-full items-center gap-4 ${timeAlignment}`}
          >
            <time
              dateTime={time}
              className={`inline-flex items-center rounded-full border px-5 py-2 text-[9px] font-black uppercase tracking-[0.35em] md:text-[10px] ${
                isDark
                  ? 'border-[#C5A059]/40 bg-[#C5A059]/10 text-[#FCF6BA]'
                  : 'border-[#9E7A32]/40 bg-[#9E7A32]/5 text-[#7A5A1B]'
              }`}
            >
              {formattedTime}
            </time>
          </div>
        )}

        <div
          className={`flex w-full items-center gap-4 ${
            isLeftAligned
              ? 'md:flex-row'
              : 'md:flex-row-reverse'
          }`}
        >
          {showIcon && icon && (
            <motion.div
              aria-hidden="true"
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotate: 8,
                      scale: 1.08
                    }
              }
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-2xl shadow-inner ${
                isDark
                  ? 'border-white/10 bg-black/30'
                  : 'border-black/5 bg-white/60'
              }`}
            >
              {icon}
            </motion.div>
          )}

          <div className="min-w-0 flex-1">
            {subtitle && (
              <p
                className={`mb-3 text-[9px] font-bold uppercase tracking-[0.4em] md:text-[10px] ${styles.textSecondary}`}
              >
                {subtitle}
              </p>
            )}

            {title && (
              <h4
                className={`font-serif text-3xl font-light drop-shadow-sm md:text-4xl ${styles.textPrimary}`}
              >
                {title}
              </h4>
            )}
          </div>
        </div>

        {description && (
          <p
            className={`mt-6 text-sm italic leading-relaxed ${
              isDark
                ? 'text-gray-400'
                : 'text-gray-600'
            }`}
          >
            {description}
          </p>
        )}

        {location && (
          <div
            className={`mt-6 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] ${styles.textSecondary}`}
          >
            <span aria-hidden="true">📍</span>

            <span>{location}</span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default ItineraryCard;