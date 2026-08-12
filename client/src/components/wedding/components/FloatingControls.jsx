import React from 'react';
import { motion } from 'framer-motion';

import { audioBarAnimations } from '../config/animations';

function AudioBars({ isDark }) {
  const barColor = isDark
    ? 'bg-[#FCF6BA]'
    : 'bg-[#9E7A32]';

  return (
    <div
      aria-hidden="true"
      className="flex h-5 w-5 items-center justify-center gap-[3px]"
    >
      {audioBarAnimations.map((barAnimation, index) => (
        <motion.span
          key={`audio-bar-${index + 1}`}
          animate={{
            height: barAnimation.height
          }}
          transition={barAnimation.transition}
          className={`w-[2px] rounded-full ${barColor}`}
        />
      ))}
    </div>
  );
}

function PlayIcon({ isDark }) {
  return (
    <span
      aria-hidden="true"
      className={`ml-[2px] text-xs drop-shadow-md ${
        isDark
          ? 'text-[#FCF6BA]'
          : 'text-[#9E7A32]'
      }`}
    >
      ▶
    </span>
  );
}

export function FloatingControls({
  playing = false,
  toggleAudio,
  isDark = false,
  toggleTheme,
  allowThemeToggle = true,
  showAudioControl = true,
  audioReady = true,
  audioError = ''
}) {
  const baseButtonClasses =
    'flex h-11 w-11 items-center justify-center rounded-full border border-white/20 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50';

  const buttonClasses = isDark
    ? 'bg-black/40 text-[#FCF6BA]'
    : 'bg-white/40 text-[#9E7A32]';

  function handleAudioToggle() {
    if (
      !showAudioControl ||
      typeof toggleAudio !== 'function'
    ) {
      return;
    }

    toggleAudio();
  }

  function handleThemeToggle() {
    if (
      !allowThemeToggle ||
      typeof toggleTheme !== 'function'
    ) {
      return;
    }

    toggleTheme();
  }

  if (!allowThemeToggle && !showAudioControl) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[100] flex gap-3 sm:right-6 sm:top-6">
      {allowThemeToggle && (
        <motion.button
          type="button"
          whileHover={{
            scale: 1.05
          }}
          whileTap={{
            scale: 0.95
          }}
          onClick={handleThemeToggle}
          className={`${baseButtonClasses} ${buttonClasses}`}
          aria-label={
            isDark
              ? 'Cambiar al tema claro'
              : 'Cambiar al tema oscuro'
          }
          title={
            isDark
              ? 'Cambiar al tema claro'
              : 'Cambiar al tema oscuro'
          }
        >
          <motion.span
            key={isDark ? 'moon' : 'sun'}
            aria-hidden="true"
            initial={{
              opacity: 0,
              rotate: -45,
              scale: 0.7
            }}
            animate={{
              opacity: 1,
              rotate: 0,
              scale: 1
            }}
            transition={{
              duration: 0.3
            }}
            className="text-base"
          >
            {isDark ? '🌙' : '☀️'}
          </motion.span>
        </motion.button>
      )}

      {showAudioControl && (
        <motion.button
          type="button"
          whileHover={{
            scale: 1.05
          }}
          whileTap={{
            scale: 0.95
          }}
          onClick={handleAudioToggle}
          className={`${baseButtonClasses} ${buttonClasses}`}
          aria-label={
            playing
              ? 'Pausar música'
              : 'Reproducir música'
          }
          aria-pressed={playing}
          title={
            audioError ||
            (audioReady
              ? playing
                ? 'Pausar música'
                : 'Reproducir música'
              : 'La música se está cargando')
          }
        >
          {playing ? (
            <AudioBars isDark={isDark} />
          ) : (
            <PlayIcon isDark={isDark} />
          )}
        </motion.button>
      )}
    </div>
  );
}

export default FloatingControls;