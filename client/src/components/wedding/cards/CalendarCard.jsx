import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import {
  calculateTimeLeft,
  getCalendarMonthData
} from '../utils/dateUtils';

import {
  getGoldColor,
  getStyles
} from '../config/weddingStyles';

const WEEK_DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const COUNTDOWN_LABELS = [
  {
    key: 'days',
    label: 'Días'
  },
  {
    key: 'hours',
    label: 'Hrs'
  },
  {
    key: 'minutes',
    label: 'Min'
  },
  {
    key: 'seconds',
    label: 'Seg'
  }
];

function CountdownItem({
  label,
  value,
  isDark
}) {
  const styles = getStyles(isDark);
  const formattedValue = String(value ?? 0).padStart(2, '0');

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <span
        className={`font-serif text-xl font-light tabular-nums md:text-2xl ${styles.textPrimary}`}
      >
        {formattedValue}
      </span>

      <span
        className={`mt-1 text-[8px] font-bold uppercase tracking-[0.1em] opacity-60 ${styles.textPrimary}`}
      >
        {label}
      </span>
    </div>
  );
}

function CalendarDay({
  day,
  isWeddingDay,
  isDark,
  goldColor,
  shouldReduceMotion
}) {
  if (!day) {
    return (
      <div
        aria-hidden="true"
        className="flex aspect-square items-center justify-center"
      />
    );
  }

  const defaultDayColor = isDark ? '#FFFFFF' : '#111827';
  const dayColor = isWeddingDay ? goldColor : defaultDayColor;

  return (
    <div
      aria-current={isWeddingDay ? 'date' : undefined}
      aria-label={
        isWeddingDay
          ? `Día de la boda: ${day}`
          : `Día ${day}`
      }
      className="relative flex aspect-square items-center justify-center"
    >
      {isWeddingDay && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: [1, 1.12, 1]
                  }
            }
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="h-[78%] w-[78%] rounded-full"
            style={{
              border: `2px solid ${goldColor}`,
              background: isDark
                ? 'rgba(197, 160, 89, 0.04)'
                : 'rgba(158, 122, 50, 0.03)',
              boxShadow: isDark
                ? '0 6px 18px rgba(197, 160, 89, 0.12)'
                : '0 6px 18px rgba(158, 122, 50, 0.12)'
            }}
          />
        </div>
      )}

      <span
        className={`relative z-10 text-xs md:text-sm ${
          isWeddingDay ? 'font-bold' : 'font-light'
        }`}
        style={{
          color: dayColor
        }}
      >
        {day}
      </span>
    </div>
  );
}

export function CalendarCard({
  targetDate,
  eventDate,
  isDark = false,
  title = 'Reserva la fecha',
  showCountdown = true,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);
  const goldColor = getGoldColor(isDark);

  const resolvedDate = targetDate || eventDate;

  const calendarData = useMemo(
    () => getCalendarMonthData(resolvedDate),
    [resolvedDate]
  );

  const [timeLeft, setTimeLeft] = useState(() =>
    calculateTimeLeft(resolvedDate)
  );

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(resolvedDate));

    if (!resolvedDate) {
      return undefined;
    }

    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft(resolvedDate));
    };

    const timer = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resolvedDate]);

  return (
    <motion.article
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              y: 30,
              scale: 0.97
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1
      }}
      viewport={{
        once: true,
        margin: '-50px'
      }}
      transition={{
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={`relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[1.25rem] p-5 shadow-2xl transition-colors duration-500 md:p-6 ${styles.innerCard} ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 flex items-start justify-end pt-6"
      >
        <div
          className="h-40 w-40 translate-x-[18%] rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${goldColor}, rgba(255, 255, 255, 0))`,
            filter: 'blur(18px)',
            opacity: isDark ? 0.32 : 0.22,
            mixBlendMode: isDark ? 'screen' : 'normal'
          }}
        />
      </div>

      <div className="relative z-10">
        <header className="mb-4 flex flex-col items-center text-center">
          <span
            className={`font-serif text-3xl font-light italic tracking-wide md:text-4xl ${styles.textPrimary}`}
          >
            {calendarData.monthName}
          </span>

          <span
            className={`mt-1 text-[10px] font-bold uppercase tracking-[0.3em] opacity-70 ${styles.textPrimary}`}
          >
            {calendarData.year}
          </span>

          <span
            className="mt-3 font-serif text-sm font-semibold md:text-base"
            style={{
              color: goldColor,
              letterSpacing: '0.02em',
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.18)'
            }}
          >
            {title}
          </span>
        </header>

        <div
          aria-hidden="true"
          translate="no"
          className="mb-2 grid grid-cols-7 text-center"
        >
          {WEEK_DAYS.map((dayLabel, index) => (
            <span
              key={`${dayLabel}-${index}`}
              className={`text-[9px] uppercase tracking-widest opacity-60 ${styles.textPrimary}`}
            >
              {dayLabel}
            </span>
          ))}
        </div>

        <div
          role="grid"
          aria-label={`Calendario de ${calendarData.monthName} de ${calendarData.year}`}
          className="mb-5 grid grid-cols-7 gap-1 md:gap-2"
        >
          {calendarData.calendarGrid.map((day, index) => (
            <CalendarDay
              key={`calendar-day-${index}`}
              day={day}
              isWeddingDay={
                day === calendarData.weddingDay
              }
              isDark={isDark}
              goldColor={goldColor}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>

        {showCountdown && (
          <div
            aria-label="Cuenta regresiva para la boda"
            className={`flex justify-between border-t px-2 pt-4 ${
              isDark
                ? 'border-white/10'
                : 'border-black/5'
            }`}
          >
            {COUNTDOWN_LABELS.map(({ key, label }) => (
              <CountdownItem
                key={key}
                label={label}
                value={timeLeft[key]}
                isDark={isDark}
              />
            ))}
          </div>
        )}

        {showCountdown && timeLeft.finished && (
          <p
            className={`mt-4 text-center font-serif text-xs italic ${styles.textSecondary}`}
          >
            ¡El gran día ha llegado!
          </p>
        )}
      </div>
    </motion.article>
  );
}

export default CalendarCard;