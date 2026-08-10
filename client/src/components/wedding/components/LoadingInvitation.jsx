import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { getStyles } from '../config/weddingStyles';

function LoadingOrnament({ isDark, shouldReduceMotion }) {
  const primaryColor = isDark ? '#FCF6BA' : '#9E7A32';
  const secondaryColor = isDark ? '#C5A059' : '#D4AF37';

  return (
    <div
      aria-hidden="true"
      className="relative flex h-24 w-24 items-center justify-center"
    >
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                rotate: 360
              }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute inset-0 rounded-full border border-transparent"
        style={{
          borderTopColor: secondaryColor,
          borderRightColor: `${secondaryColor}55`
        }}
      />

      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                rotate: -360
              }
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute inset-3 rounded-full border border-transparent"
        style={{
          borderBottomColor: primaryColor,
          borderLeftColor: `${primaryColor}55`
        }}
      />

      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [0.85, 1.1, 0.85],
                opacity: [0.6, 1, 0.6]
              }
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle, ${primaryColor}33, transparent 70%)`
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: primaryColor }}
        >
          <path
            d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"
            fill="currentColor"
          />
        </svg>
      </motion.div>
    </div>
  );
}

function LoadingDots({ isDark, shouldReduceMotion }) {
  const dotColor = isDark ? 'bg-[#FCF6BA]' : 'bg-[#9E7A32]';

  return (
    <div
      aria-hidden="true"
      className="mt-7 flex items-center justify-center gap-2"
    >
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={`loading-dot-${dot + 1}`}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  y: [0, -6, 0],
                  opacity: [0.35, 1, 0.35]
                }
          }
          transition={{
            duration: 1.2,
            delay: dot * 0.18,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
        />
      ))}
    </div>
  );
}

export function LoadingInvitation({
  isDark = false,
  title = 'Preparando invitación',
  message = 'Estamos colocando cada detalle para este momento especial.'
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title}
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-6 transition-colors duration-700 ${styles.bg}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.12),transparent_55%)]'
            : 'bg-[radial-gradient(circle_at_center,rgba(158,122,50,0.1),transparent_55%)]'
        }`}
      />

      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 20,
                scale: 0.96
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="relative z-10 flex w-full max-w-md flex-col items-center text-center"
      >
        <LoadingOrnament
          isDark={isDark}
          shouldReduceMotion={shouldReduceMotion}
        />

        <motion.p
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: [0.65, 1, 0.65]
                }
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`mt-8 text-xs font-black uppercase tracking-[0.45em] sm:text-sm ${styles.textSecondary}`}
        >
          {title}
        </motion.p>

        <p
          className={`mt-5 max-w-sm font-serif text-base italic leading-relaxed sm:text-lg ${styles.mutedText}`}
        >
          {message}
        </p>

        <LoadingDots
          isDark={isDark}
          shouldReduceMotion={shouldReduceMotion}
        />
      </motion.div>

      <span className="sr-only">
        La invitación se está cargando. Espera un momento.
      </span>
    </div>
  );
}

export default LoadingInvitation;