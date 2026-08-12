import React, { useMemo } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion
} from 'framer-motion';

import {
  EASE_IN_OUT,
  envelopeSceneExit,
  waxSealPulse
} from '../config/animations';

import { getStyles } from '../config/weddingStyles';

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

function createInitials(groomName, brideName) {
  const groomInitial = cleanText(groomName)
    .charAt(0)
    .toUpperCase();

  const brideInitial = cleanText(brideName)
    .charAt(0)
    .toUpperCase();

  if (groomInitial && brideInitial) {
    return `${groomInitial}&${brideInitial}`;
  }

  return groomInitial || brideInitial || '';
}

function formatShortDate(value) {
  const dateValue = cleanText(value);

  if (!dateValue) {
    return '';
  }

  /*
   * Evitamos el problema de zonas horarias
   * cuando MongoDB/frontend usa YYYY-MM-DD.
   */
  const dateOnlyMatch = dateValue.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;

    return `${day} . ${month} . ${year}`;
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  const day = String(
    parsedDate.getDate()
  ).padStart(2, '0');

  const month = String(
    parsedDate.getMonth() + 1
  ).padStart(2, '0');

  const year = parsedDate.getFullYear();

  return `${day} . ${month} . ${year}`;
}

function getWeddingData(wedding = {}) {
  const groomName = firstText(
    wedding.groomName,
    wedding.novio
  );

  const brideName = firstText(
    wedding.brideName,
    wedding.novia
  );

  const eventDate = firstText(
    wedding.eventDate,
    wedding.fecha
  );

  const shortDate = firstText(
    wedding.fechaCorta,
    wedding.shortDate,
    formatShortDate(eventDate)
  );

  const initials = firstText(
    wedding.initials,
    wedding.iniciales,
    createInitials(groomName, brideName)
  );

  return {
    groomName,
    brideName,
    eventDate,
    shortDate,
    initials
  };
}

function InvitationNames({
  groomName,
  brideName
}) {
  const hasGroom = Boolean(
    cleanText(groomName)
  );

  const hasBride = Boolean(
    cleanText(brideName)
  );

  if (!hasGroom && !hasBride) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-col items-center gap-2 md:mb-10 md:gap-4">
      {hasGroom && (
        <span className="max-w-full break-words font-serif text-4xl font-bold leading-none tracking-tighter text-[#1a1a1a] md:text-6xl">
          {groomName}
        </span>
      )}

      {hasGroom && hasBride && (
        <span className="font-serif text-2xl italic text-[#BF953F] md:text-4xl">
          &
        </span>
      )}

      {hasBride && (
        <span className="max-w-full break-words font-serif text-4xl font-bold leading-none tracking-tighter text-[#1a1a1a] md:text-6xl">
          {brideName}
        </span>
      )}
    </div>
  );
}

function InvitationCard({
  groomName,
  brideName,
  shortDate,
  eventDate,
  isOpening
}) {
  const hasNames = Boolean(
    groomName || brideName
  );

  return (
    <motion.div
      animate={
        isOpening
          ? {
              y: '-85%'
            }
          : {
              y: 0
            }
      }
      transition={{
        duration: 2.5,
        ease: EASE_IN_OUT,
        delay: isOpening ? 0.8 : 0
      }}
      className="absolute inset-x-4 bottom-0 z-10 flex h-[90%] flex-col items-center justify-center overflow-hidden rounded-sm border border-[#BF953F]/20 bg-[#F4F1EA] shadow-[0_-5px_20px_rgba(0,0,0,0.2)] md:inset-x-6"
    >
      {/*
       * Conservamos exactamente el aspecto
       * de papel que tenía el sobre anterior.
       */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-30"
      />

      <div className="relative flex h-full w-full flex-col items-center justify-start p-4 pt-8 text-center md:pt-16">
        <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.4em] text-[#8C6218] md:mb-8 md:text-[11px]">
          Save the Date
        </p>

        {hasNames && (
          <InvitationNames
            groomName={groomName}
            brideName={brideName}
          />
        )}

        {shortDate && (
          <>
            <div
              aria-hidden="true"
              className="mb-4 h-px w-12 bg-[#BF953F] opacity-50"
            />

            <time
              dateTime={eventDate || undefined}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1a1a1a] md:text-xs"
            >
              {shortDate}
            </time>
          </>
        )}
      </div>
    </motion.div>
  );
}

function EnvelopeBody({
  isDark
}) {
  const styles = getStyles(isDark);

  return (
    <>
      <div
        className={`absolute inset-0 rounded-sm border ${styles.envelopeBase}`}
      />

      <div className="pointer-events-none absolute inset-0 z-20">
        <div
          aria-hidden="true"
          className={`absolute inset-0 z-20 bg-gradient-to-t via-transparent to-transparent ${
            isDark
              ? 'from-black/60'
              : 'from-[#B8860B]/20'
          }`}
        />

        <div
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 h-full w-full border-l ${styles.envelopeFlapSide}`}
          style={{
            clipPath:
              'polygon(0 0, 50% 50%, 0 100%)'
          }}
        />

        <div
          aria-hidden="true"
          className={`absolute inset-y-0 right-0 h-full w-full border-r ${styles.envelopeFlapSide}`}
          style={{
            clipPath:
              'polygon(100% 0, 50% 50%, 100% 100%)'
          }}
        />

        <div
          aria-hidden="true"
          className={`absolute bottom-0 left-0 h-full w-full border-b ${styles.envelopeFlapBottom} ${styles.envelopeShadow}`}
          style={{
            clipPath:
              'polygon(0 100%, 50% 50%, 100% 100%)'
          }}
        />
      </div>
    </>
  );
}

function EnvelopeTopFlap({
  isDark,
  isOpening,
  shouldReduceMotion
}) {
  const styles = getStyles(isDark);

  return (
    <motion.div
      animate={
        isOpening
          ? {
              rotateX: shouldReduceMotion
                ? 0
                : 180,

              opacity: 0
            }
          : {
              rotateX: 0,
              opacity: 1
            }
      }
      transition={{
        rotateX: {
          duration: shouldReduceMotion
            ? 0.4
            : 1.5,

          ease: 'easeInOut'
        },

        opacity: {
          duration: 0.8,

          delay:
            isOpening &&
            !shouldReduceMotion
              ? 1
              : 0,

          ease: 'easeOut'
        }
      }}
      className={`absolute left-0 top-0 z-30 h-full w-full origin-top border-t ${styles.envelopeFlapTop}`}
      style={{
        clipPath:
          'polygon(0 0, 50% 50%, 100% 0)',

        backfaceVisibility: 'visible'
      }}
    />
  );
}

function WaxSeal({
  initials,
  isOpening,
  shouldReduceMotion
}) {
  return (
    <motion.div
      initial={{
        x: '-50%',
        y: '-50%'
      }}
      animate={
        isOpening
          ? {
              x: '-50%',
              y: '-50%',
              opacity: 0,
              scale: 1.5
            }
          : {
              x: '-50%',
              y: '-50%',
              opacity: 1,
              scale: 1
            }
      }
      transition={{
        duration: shouldReduceMotion
          ? 0.3
          : 0.8
      }}
      className="absolute left-1/2 top-1/2 z-40"
    >
      <motion.div
        animate={
          shouldReduceMotion ||
          isOpening
            ? undefined
            : {
                boxShadow:
                  waxSealPulse.boxShadow
              }
        }
        transition={
          shouldReduceMotion ||
          isOpening
            ? undefined
            : waxSealPulse.transition
        }
        className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#600]/60 bg-gradient-to-br from-[#880000] to-[#550000] shadow-2xl transition-transform duration-300 hover:scale-105 md:h-20 md:w-20"
      >
        <div className="flex h-[85%] w-[85%] items-center justify-center rounded-full border border-[#900] bg-[#700] opacity-80">
          {initials ? (
            <span className="font-serif text-xs font-bold italic text-[#D4AF37] drop-shadow-md md:text-lg">
              {initials}
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="font-serif text-base text-[#D4AF37] md:text-xl"
            >
              ✦
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function WeddingEnvelope({
  wedding = {},
  step = 0,
  onOpen,
  isDark = false
}) {
  const shouldReduceMotion =
    useReducedMotion();

  const styles = getStyles(isDark);

  const weddingData = useMemo(
    () => getWeddingData(wedding),
    [wedding]
  );

  const {
    groomName,
    brideName,
    eventDate,
    shortDate,
    initials
  } = weddingData;

  const isOpening = step === 1;
  const isVisible = step < 2;

  const coupleName = useMemo(() => {
    if (
      groomName &&
      brideName
    ) {
      return `${groomName} y ${brideName}`;
    }

    return (
      groomName ||
      brideName ||
      ''
    );
  }, [
    brideName,
    groomName
  ]);

  const openLabel = coupleName
    ? `Abrir invitación de ${coupleName}`
    : 'Abrir invitación de boda';

  function handleOpen() {
    if (
      step !== 0 ||
      typeof onOpen !== 'function'
    ) {
      return;
    }

    onOpen();
  }

  function handleKeyDown(event) {
    if (
      event.key !== 'Enter' &&
      event.key !== ' '
    ) {
      return;
    }

    event.preventDefault();

    handleOpen();
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="wedding-envelope-scene"
          exit={envelopeSceneExit}
          className={`fixed inset-0 z-[999] flex items-center justify-center p-6 transition-colors duration-700 ${styles.bg}`}
          style={{
            perspective: '2000px'
          }}
        >
          <motion.div
            role="button"
            tabIndex={
              step === 0
                ? 0
                : -1
            }
            aria-label={openLabel}
            aria-disabled={
              step !== 0
            }
            onClick={handleOpen}
            onKeyDown={handleKeyDown}
            animate={
              isOpening
                ? {
                    rotateX:
                      shouldReduceMotion
                        ? 0
                        : 25,

                    y:
                      shouldReduceMotion
                        ? 0
                        : '15%',

                    scale:
                      shouldReduceMotion
                        ? 1
                        : 0.9
                  }
                : {
                    rotateX: 0,
                    y: 0,
                    scale: 1
                  }
            }
            transition={{
              duration:
                shouldReduceMotion
                  ? 0.4
                  : 2.5,

              ease: 'easeInOut',

              delay:
                isOpening &&
                !shouldReduceMotion
                  ? 0.5
                  : 0
            }}
            className={`group relative mx-auto h-[240px] w-[90vw] max-w-[340px] shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#BF953F] focus-visible:ring-offset-4 md:h-[350px] md:w-[500px] md:max-w-none ${
              step === 0
                ? 'cursor-pointer'
                : 'cursor-default'
            } ${
              isDark
                ? 'focus-visible:ring-offset-[#050505]'
                : 'focus-visible:ring-offset-[#F9F7F2]'
            }`}
            style={{
              transformStyle:
                'preserve-3d'
            }}
          >
            <EnvelopeBody
              isDark={isDark}
            />

            <InvitationCard
              groomName={groomName}
              brideName={brideName}
              eventDate={eventDate}
              shortDate={shortDate}
              isOpening={isOpening}
            />

            <EnvelopeTopFlap
              isDark={isDark}
              isOpening={isOpening}
              shouldReduceMotion={
                shouldReduceMotion
              }
            />

            <WaxSeal
              initials={initials}
              isOpening={isOpening}
              shouldReduceMotion={
                shouldReduceMotion
              }
            />
          </motion.div>

          {step === 0 && (
            <motion.p
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 0.75,
                y: 0
              }}
              transition={{
                delay: 1,
                duration: 0.8
              }}
              className={`absolute bottom-10 px-6 text-center text-[10px] font-bold uppercase tracking-[0.35em] ${styles.textSecondary}`}
            >
              Toca el sello para abrir
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WeddingEnvelope;