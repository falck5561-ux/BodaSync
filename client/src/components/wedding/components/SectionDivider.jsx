import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import {
  dividerReveal,
  rotateContinuously
} from '../config/animations';

import { getStyles } from '../config/weddingStyles';

function StarOrnament({ isDark, animated = true }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      animate={
        animated && !shouldReduceMotion
          ? rotateContinuously.rotate
          : undefined
      }
      transition={
        animated && !shouldReduceMotion
          ? rotateContinuously.transition
          : undefined
      }
      className="flex shrink-0 items-center justify-center"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={
          isDark
            ? 'text-[#C5A059]'
            : 'text-[#9E7A32]'
        }
      >
        <path
          d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"
          fill="currentColor"
        />
      </svg>
    </motion.div>
  );
}

function DiamondOrnament({ isDark }) {
  return (
    <div
      aria-hidden="true"
      className="mx-6 flex shrink-0 items-center gap-3 sm:mx-8"
    >
      <span
        className={`h-1.5 w-1.5 rotate-45 ${
          isDark ? 'bg-[#C5A059]' : 'bg-[#9E7A32]'
        }`}
      />

      <span
        className={`h-2 w-2 rotate-45 shadow-[0_0_8px_rgba(197,160,89,0.6)] ${
          isDark ? 'bg-[#FCF6BA]' : 'bg-[#D4AF37]'
        }`}
      />

      <span
        className={`h-1.5 w-1.5 rotate-45 ${
          isDark ? 'bg-[#C5A059]' : 'bg-[#9E7A32]'
        }`}
      />
    </div>
  );
}

function StandardDivider({
  text,
  isDark,
  animated,
  className
}) {
  const styles = getStyles(isDark);
  const shouldReduceMotion = useReducedMotion();

  const lineAnimation =
    animated && !shouldReduceMotion
      ? dividerReveal
      : undefined;

  return (
    <motion.div
      initial={
        animated && !shouldReduceMotion
          ? {
              opacity: 0,
              scale: 0.95
            }
          : false
      }
      whileInView={{
        opacity: 1,
        scale: 1
      }}
      viewport={{
        once: true,
        margin: '-50px'
      }}
      transition={{
        duration: 1.2,
        ease: 'easeOut'
      }}
      className={`relative z-20 flex flex-col items-center justify-center px-4 py-20 ${className}`}
    >
      <div className="flex w-full items-center justify-center gap-5 sm:gap-6">
        <motion.div
          variants={lineAnimation}
          initial={lineAnimation ? 'hidden' : false}
          whileInView={lineAnimation ? 'visible' : undefined}
          viewport={{
            once: true
          }}
          className={`h-px w-full max-w-[150px] origin-right bg-gradient-to-r ${styles.dividerLine}`}
        />

        <StarOrnament
          isDark={isDark}
          animated={animated}
        />

        <motion.div
          variants={lineAnimation}
          initial={lineAnimation ? 'hidden' : false}
          whileInView={lineAnimation ? 'visible' : undefined}
          viewport={{
            once: true
          }}
          className={`h-px w-full max-w-[150px] origin-left bg-gradient-to-l ${styles.dividerLine}`}
        />
      </div>

      {text && (
        <motion.p
          initial={
            animated && !shouldReduceMotion
              ? {
                  y: 10,
                  opacity: 0
                }
              : false
          }
          whileInView={{
            y: 0,
            opacity: 1
          }}
          viewport={{
            once: true
          }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: 'easeOut'
          }}
          className={`mt-8 px-4 text-center font-serif text-[10px] font-black uppercase tracking-[0.45em] drop-shadow-sm sm:text-xs ${styles.textSecondary}`}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}

function ElegantDivider({
  isDark,
  animated,
  className
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      initial={
        animated && !shouldReduceMotion
          ? {
              opacity: 0,
              scaleX: 0.8
            }
          : false
      }
      whileInView={{
        opacity: 0.7,
        scaleX: 1
      }}
      viewport={{
        once: true,
        margin: '-50px'
      }}
      transition={{
        duration: 1.2,
        ease: 'easeInOut'
      }}
      className={`relative z-20 flex w-full items-center justify-center px-6 py-20 ${className}`}
    >
      <div
        className={`h-px w-full max-w-[200px] flex-grow bg-gradient-to-r ${
          isDark
            ? 'from-transparent via-[#C5A059] to-transparent'
            : 'from-transparent via-[#9E7A32] to-transparent'
        }`}
      />

      <DiamondOrnament isDark={isDark} />

      <div
        className={`h-px w-full max-w-[200px] flex-grow bg-gradient-to-l ${
          isDark
            ? 'from-transparent via-[#C5A059] to-transparent'
            : 'from-transparent via-[#9E7A32] to-transparent'
        }`}
      />
    </motion.div>
  );
}

export function SectionDivider({
  text = '',
  isDark = false,
  variant = 'standard',
  animated = true,
  className = ''
}) {
  if (variant === 'elegant') {
    return (
      <ElegantDivider
        isDark={isDark}
        animated={animated}
        className={className}
      />
    );
  }

  return (
    <StandardDivider
      text={text}
      isDark={isDark}
      animated={animated}
      className={className}
    />
  );
}

export function Divider(props) {
  return (
    <SectionDivider
      {...props}
      variant="standard"
    />
  );
}

export function ElegantSectionDivider(props) {
  return (
    <SectionDivider
      {...props}
      variant="elegant"
    />
  );
}

export default SectionDivider;