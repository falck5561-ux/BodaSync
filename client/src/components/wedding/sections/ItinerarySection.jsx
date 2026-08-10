import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import ItineraryCard from '../cards/ItineraryCard';

import {
  containerStagger,
  fadeInUp
} from '../config/animations';

import { getStyles } from '../config/weddingStyles';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeItinerary(itinerary = []) {
  if (!Array.isArray(itinerary)) {
    return [];
  }

  return itinerary
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const time = cleanText(item.time || item.hour);

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

      const subtitle = cleanText(
        item.subtitle ||
          item.label
      );

      const icon = cleanText(item.icon);

      if (
        !time &&
        !title &&
        !description &&
        !location
      ) {
        return null;
      }

      const parsedOrder = Number(item.order);

      return {
        id:
          item.id ||
          item._id ||
          `itinerary-item-${index + 1}`,

        order: Number.isFinite(parsedOrder)
          ? parsedOrder
          : index + 1,

        time,
        title,
        subtitle,
        description,
        location,
        icon
      };
    })
    .filter(Boolean)
    .sort((firstItem, secondItem) => {
      return firstItem.order - secondItem.order;
    });
}

function TimelineMarker({
  icon,
  isDark,
  shouldReduceMotion
}) {
  return (
    <div className="absolute left-8 z-20 flex -translate-x-1/2 items-center justify-center md:left-1/2">
      <motion.div
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                scale: 1.12,
                boxShadow:
                  '0 0 30px rgba(197, 160, 89, 0.5)'
              }
        }
        className={`flex h-16 w-16 items-center justify-center rounded-full border shadow-[0_10px_20px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-500 md:h-20 md:w-20 ${
          isDark
            ? 'border-white/20 bg-[#111111]'
            : 'border-black/10 bg-white'
        }`}
      >
        {icon ? (
          <span
            aria-hidden="true"
            className="text-2xl md:text-3xl"
          >
            {icon}
          </span>
        ) : (
          <span
            aria-hidden="true"
            className={`h-3 w-3 rotate-45 shadow-[0_0_15px_rgba(197,160,89,0.6)] ${
              isDark
                ? 'bg-[#FCF6BA]'
                : 'bg-[#9E7A32]'
            }`}
          />
        )}
      </motion.div>
    </div>
  );
}

function ItineraryTimelineItem({
  item,
  index,
  isDark,
  shouldReduceMotion
}) {
  const isEven = index % 2 === 0;

  return (
    <motion.li
      variants={fadeInUp}
      className={`relative flex flex-col items-center justify-between md:flex-row ${
        isEven ? 'md:flex-row-reverse' : ''
      }`}
    >
      <div
        aria-hidden="true"
        className="hidden md:block md:w-[45%]"
      />

      <TimelineMarker
        icon={item.icon}
        isDark={isDark}
        shouldReduceMotion={shouldReduceMotion}
      />

      <div
        className={`w-full pl-24 md:w-[45%] md:pl-0 ${
          isEven
            ? 'md:flex md:justify-start'
            : 'md:flex md:justify-end'
        }`}
      >
        <ItineraryCard
          item={item}
          index={index}
          isDark={isDark}
          align={isEven ? 'left' : 'right'}
          showIcon={false}
        />
      </div>
    </motion.li>
  );
}

export function ItinerarySection({
  wedding = {},
  items,
  isDark = false,
  eyebrow = 'Nuestro día',
  title = 'Itinerario',
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  const itinerary = useMemo(() => {
    const source =
      items ||
      wedding.itinerary ||
      wedding.schedule ||
      wedding.program ||
      [];

    return normalizeItinerary(source);
  }, [items, wedding]);

  if (itinerary.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="itinerary-section-title"
      className={`relative overflow-hidden px-6 py-28 md:px-12 md:py-32 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.015]"
      >
        <span className="select-none font-serif text-[400px] md:text-[600px]">
          🕒
        </span>
      </div>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[150px] ${
          isDark
            ? 'bg-[#C5A059]/5'
            : 'bg-[#9E7A32]/5'
        }`}
      />

      <motion.div
        variants={containerStagger}
        initial={shouldReduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{
          once: true,
          margin: '-100px'
        }}
        className="relative z-10 mx-auto max-w-5xl"
      >
        <header className="mb-24 text-center md:mb-28">
          <motion.div
            aria-hidden="true"
            variants={fadeInUp}
            className="mx-auto mb-8 h-16 w-px rounded-full bg-gradient-to-b from-transparent to-[#C5A059]"
          />

          <motion.p
            variants={fadeInUp}
            className={`mb-4 text-[9px] font-black uppercase tracking-[0.5em] opacity-70 md:text-[10px] md:tracking-[0.6em] ${styles.textSecondary}`}
          >
            {eyebrow}
          </motion.p>

          <motion.h2
            id="itinerary-section-title"
            variants={fadeInUp}
            className={`font-serif text-5xl font-light tracking-tight md:text-7xl ${styles.goldGradient}`}
          >
            {title}
          </motion.h2>

          <motion.div
            aria-hidden="true"
            variants={fadeInUp}
            className={`mx-auto mt-8 h-px w-28 bg-gradient-to-r ${styles.dividerLine}`}
          />
        </header>

        <div className="relative">
          <motion.div
            aria-hidden="true"
            initial={
              shouldReduceMotion
                ? false
                : {
                    height: 0,
                    opacity: 0
                  }
            }
            whileInView={{
              height: '100%',
              opacity: 1
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 3,
              ease: 'easeInOut'
            }}
            className={`absolute bottom-0 left-8 top-0 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b md:left-1/2 ${
              isDark
                ? 'from-transparent via-[#C5A059]/50 to-transparent'
                : 'from-transparent via-[#9E7A32]/40 to-transparent'
            }`}
          />

          <ol className="space-y-16 md:space-y-28">
            {itinerary.map((item, index) => (
              <ItineraryTimelineItem
                key={item.id}
                item={item}
                index={index}
                isDark={isDark}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </ol>
        </div>

        <motion.div
          aria-hidden="true"
          variants={fadeInUp}
          className="mx-auto mt-24 flex w-fit items-center gap-3"
        >
          <span
            className={`h-1.5 w-1.5 rotate-45 ${
              isDark
                ? 'bg-[#C5A059]'
                : 'bg-[#9E7A32]'
            }`}
          />

          <span
            className={`h-2.5 w-2.5 rotate-45 shadow-[0_0_12px_rgba(197,160,89,0.6)] ${
              isDark
                ? 'bg-[#FCF6BA]'
                : 'bg-[#D4AF37]'
            }`}
          />

          <span
            className={`h-1.5 w-1.5 rotate-45 ${
              isDark
                ? 'bg-[#C5A059]'
                : 'bg-[#9E7A32]'
            }`}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ItinerarySection;