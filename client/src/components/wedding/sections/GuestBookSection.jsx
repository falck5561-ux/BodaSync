import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  AnimatePresence,
  motion,
  useReducedMotion
} from 'framer-motion';

import GuestBookForm from '../components/GuestBookForm';

import {
  BLACK_TEXTURE,
  PAPER_TEXTURE,
  getStyles
} from '../config/weddingStyles';

const AUTO_ROTATE_TIME = 5000;

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeMessage(message, index = 0) {
  if (
    !message ||
    typeof message !== 'object'
  ) {
    return null;
  }

  const content = cleanText(
    message.message ||
      message.mensaje ||
      message.content
  );

  const author = cleanText(
    message.author ||
      message.nombre ||
      message.name
  );

  if (!content || !author) {
    return null;
  }

  return {
    ...message,

    _id:
      message._id ||
      message.id ||
      `guest-message-${index}`,

    message: content,
    author,

    createdAt:
      message.createdAt ||
      message.date ||
      null
  };
}

function normalizeMessages(messages = []) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map(normalizeMessage)
    .filter(Boolean);
}

function formatMessageDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  )
    .format(date)
    .toUpperCase();
}

function getMessageKey(message) {
  return String(
    message?._id ||
      message?.id ||
      `${message?.author}-${message?.message}`
  );
}

function mergeMessages(
  currentMessages,
  incomingMessages
) {
  const result = [];
  const seen = new Set();

  [
    ...incomingMessages,
    ...currentMessages
  ].forEach((message, index) => {
    const normalized =
      normalizeMessage(
        message,
        index
      );

    if (!normalized) {
      return;
    }

    const key =
      getMessageKey(
        normalized
      );

    if (seen.has(key)) {
      return;
    }

    seen.add(key);

    result.push(normalized);
  });

  return result;
}

function EmptyGuestBook({
  isDark
}) {
  const styles =
    getStyles(isDark);

  return (
    <div className="px-3 pb-8 pt-4">
      <div
        className={`relative mx-auto max-w-lg overflow-hidden rounded-[2rem] border px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${
          isDark
            ? 'border-[#C5A059]/15 bg-[#0A0A0A]/70'
            : 'border-[#9E7A32]/15 bg-[#F8F3E8]'
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 opacity-[0.16] ${
            isDark
              ? BLACK_TEXTURE
              : PAPER_TEXTURE
          }`}
        />

        <div
          aria-hidden="true"
          className="relative z-10 font-serif text-6xl leading-none text-[#C5A059]/25"
        >
          “
        </div>

        <p
          className={`relative z-10 mt-2 font-serif text-base italic leading-7 ${styles.mutedText}`}
        >
          Aún no hay firmas. Puedes ser la primera persona en dejar unas palabras para los novios.
        </p>
      </div>
    </div>
  );
}

function PaperStack({
  isDark
}) {
  return (
    <>
      <motion.div
        aria-hidden="true"
        animate={{
          rotate: [-2.4, -1.6, -2.4]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`pointer-events-none absolute inset-x-6 bottom-1 top-5 rounded-[2rem] border ${
          isDark
            ? 'border-white/5 bg-[#171717]/60'
            : 'border-[#9E7A32]/10 bg-[#EAE1D0]'
        }`}
      />

      <motion.div
        aria-hidden="true"
        animate={{
          rotate: [2.2, 1.4, 2.2]
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`pointer-events-none absolute inset-x-5 bottom-2 top-3 rounded-[2rem] border shadow-md ${
          isDark
            ? 'border-white/5 bg-[#101010]/80'
            : 'border-[#9E7A32]/10 bg-[#F1E9DA]'
        }`}
      />
    </>
  );
}

function GuestMessagePaper({
  message,
  isDark,
  direction,
  shouldReduceMotion,
  hasSeveral,
  onDragStart,
  onDragEnd
}) {
  const styles =
    getStyles(isDark);

  const date =
    formatMessageDate(
      message.createdAt
    );

  return (
    <motion.article
      key={getMessageKey(message)}
      initial={
        shouldReduceMotion
          ? {
              opacity: 0
            }
          : {
              opacity: 0,
              x:
                direction >= 0
                  ? 90
                  : -90,
              rotate:
                direction >= 0
                  ? 3
                  : -3,
              scale: 0.94
            }
      }
      animate={{
        opacity: 1,
        x: 0,
        rotate: 0,
        scale: 1
      }}
      exit={
        shouldReduceMotion
          ? {
              opacity: 0
            }
          : {
              opacity: 0,
              x:
                direction >= 0
                  ? -90
                  : 90,
              rotate:
                direction >= 0
                  ? -3
                  : 3,
              scale: 0.94
            }
      }
      transition={{
        duration:
          shouldReduceMotion
            ? 0.2
            : 0.65,

        ease: [
          0.16,
          1,
          0.3,
          1
        ]
      }}
      drag={
        hasSeveral
          ? 'x'
          : false
      }
      dragConstraints={{
        left: 0,
        right: 0
      }}
      dragElastic={0.14}
      onDragStart={
        onDragStart
      }
      onDragEnd={
        onDragEnd
      }
      className={`relative flex min-h-[280px] cursor-grab flex-col justify-between overflow-hidden rounded-[2rem] border px-8 pb-8 pt-10 shadow-[0_25px_80px_rgba(0,0,0,0.12)] active:cursor-grabbing sm:min-h-[300px] sm:px-10 sm:pb-10 sm:pt-12 ${
        isDark
          ? 'border-[#C5A059]/15 bg-[#0B0B0B]'
          : 'border-[#9E7A32]/15 bg-[#FBF7ED]'
      }`}
      style={
        isDark
          ? undefined
          : {
              backgroundImage:
                'repeating-linear-gradient(to bottom, transparent 0px, transparent 37px, rgba(158, 122, 50, 0.045) 38px, transparent 39px)'
            }
      }
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-[0.2] ${
          isDark
            ? BLACK_TEXTURE
            : PAPER_TEXTURE
        }`}
      />

      {/*
       * DOBLEZ DE PAPEL
       */}
      <div
        aria-hidden="true"
        className={`absolute right-0 top-0 h-14 w-14 ${
          isDark
            ? 'bg-[#151515]'
            : 'bg-[#EEE3CF]'
        }`}
        style={{
          clipPath:
            'polygon(100% 0, 0 0, 100% 100%)'
        }}
      />

      <div
        aria-hidden="true"
        className={`absolute right-0 top-0 h-14 w-14 border-b border-l ${
          isDark
            ? 'border-white/5 bg-black/20'
            : 'border-[#9E7A32]/10 bg-white/35'
        }`}
        style={{
          clipPath:
            'polygon(100% 0, 100% 100%, 0 100%)'
        }}
      />

      {/*
       * COMILLAS DECORATIVAS
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-7 top-0 font-serif text-[8rem] leading-none text-[#C5A059]/10"
      >
        “
      </div>

      <motion.div
        aria-hidden="true"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                opacity: [
                  0.18,
                  0.3,
                  0.18
                ]
              }
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="pointer-events-none absolute bottom-7 right-7 text-xl text-[#C5A059]/30"
      >
        ✦
      </motion.div>

      <div className="relative z-10 flex flex-1 items-center">
        <p
          className={`max-w-full break-words font-serif text-lg italic leading-8 sm:text-xl sm:leading-9 ${styles.textPrimary}`}
        >
          “{message.message}”
        </p>
      </div>

      <div className="relative z-10 mt-8">
        <div className="h-px w-full bg-gradient-to-r from-[#C5A059]/45 via-[#C5A059]/15 to-transparent" />

        <div className="mt-5 flex items-end justify-between gap-5">
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-[0.28em] ${styles.textSecondary}`}
            >
              — {message.author}
            </p>

            {date && (
              <p
                className={`mt-3 text-[8px] font-bold uppercase tracking-[0.18em] opacity-50 ${styles.textPrimary}`}
              >
                {date}
              </p>
            )}
          </div>

          <span
            aria-hidden="true"
            className="font-serif text-xl italic text-[#C5A059]/45"
          >
            ♡
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function GuestMessageCarousel({
  messages,
  isDark
}) {
  const shouldReduceMotion =
    useReducedMotion();

  const [
    activeIndex,
    setActiveIndex
  ] = useState(0);

  const [
    direction,
    setDirection
  ] = useState(1);

  const [
    paused,
    setPaused
  ] = useState(false);

  const resumeTimerRef =
    useRef(null);

  const hasSeveral =
    messages.length > 1;

  useEffect(() => {
    if (
      activeIndex >
      messages.length - 1
    ) {
      setActiveIndex(0);
    }
  }, [
    activeIndex,
    messages.length
  ]);

  /*
   * ==========================================
   * CARRUSEL AUTOMÁTICO
   * ==========================================
   *
   * Cambia automáticamente cada 5 segundos.
   */
  useEffect(() => {
    if (
      !hasSeveral ||
      paused
    ) {
      return undefined;
    }

    const intervalId =
      window.setInterval(
        () => {
          setDirection(1);

          setActiveIndex(
            (current) =>
              (current + 1) %
              messages.length
          );
        },
        AUTO_ROTATE_TIME
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [
    hasSeveral,
    messages.length,
    paused
  ]);

  useEffect(() => {
    return () => {
      if (
        resumeTimerRef.current
      ) {
        window.clearTimeout(
          resumeTimerRef.current
        );
      }
    };
  }, []);

  const activeMessage =
    messages[activeIndex];

  if (!activeMessage) {
    return (
      <EmptyGuestBook
        isDark={isDark}
      />
    );
  }

  function scheduleResume() {
    if (
      resumeTimerRef.current
    ) {
      window.clearTimeout(
        resumeTimerRef.current
      );
    }

    resumeTimerRef.current =
      window.setTimeout(
        () => {
          setPaused(false);

          resumeTimerRef.current =
            null;
        },
        1800
      );
  }

  function previousMessage() {
    setPaused(true);
    setDirection(-1);

    setActiveIndex(
      (current) =>
        current === 0
          ? messages.length - 1
          : current - 1
    );

    scheduleResume();
  }

  function nextMessage() {
    setPaused(true);
    setDirection(1);

    setActiveIndex(
      (current) =>
        current ===
        messages.length - 1
          ? 0
          : current + 1
    );

    scheduleResume();
  }

  function selectMessage(index) {
    if (
      index === activeIndex
    ) {
      return;
    }

    setPaused(true);

    setDirection(
      index > activeIndex
        ? 1
        : -1
    );

    setActiveIndex(index);

    scheduleResume();
  }

  function handleDragStart() {
    setPaused(true);
  }

  function handleDragEnd(
    event,
    info
  ) {
    const distance =
      info.offset.x;

    const velocity =
      info.velocity.x;

    const shouldChange =
      Math.abs(distance) > 50 ||
      Math.abs(velocity) > 500;

    if (!shouldChange) {
      scheduleResume();
      return;
    }

    if (distance < 0) {
      nextMessage();
      return;
    }

    previousMessage();
  }

  return (
    <div
      className="relative px-4 pb-6 pt-4 sm:px-10"
      onMouseEnter={() =>
        setPaused(true)
      }
      onMouseLeave={() =>
        setPaused(false)
      }
      onFocusCapture={() =>
        setPaused(true)
      }
      onBlurCapture={() =>
        setPaused(false)
      }
    >
      <div className="relative mx-auto max-w-lg px-2 py-4">
        <PaperStack
          isDark={isDark}
        />

        {hasSeveral && (
          <>
            <motion.button
              type="button"
              whileHover={{
                scale: 1.08
              }}
              whileTap={{
                scale: 0.92
              }}
              onClick={
                previousMessage
              }
              aria-label="Firma anterior"
              className={`absolute left-0 top-1/2 z-40 flex h-11 w-11 -translate-x-1/3 -translate-y-1/2 items-center justify-center rounded-full border text-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:-translate-x-1/2 ${
                isDark
                  ? 'border-[#C5A059]/20 bg-black/80 text-[#FCF6BA]'
                  : 'border-[#9E7A32]/15 bg-[#FBF7ED]/95 text-[#8A6927]'
              }`}
            >
              ‹
            </motion.button>

            <motion.button
              type="button"
              whileHover={{
                scale: 1.08
              }}
              whileTap={{
                scale: 0.92
              }}
              onClick={
                nextMessage
              }
              aria-label="Siguiente firma"
              className={`absolute right-0 top-1/2 z-40 flex h-11 w-11 translate-x-1/3 -translate-y-1/2 items-center justify-center rounded-full border text-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:translate-x-1/2 ${
                isDark
                  ? 'border-[#C5A059]/20 bg-black/80 text-[#FCF6BA]'
                  : 'border-[#9E7A32]/15 bg-[#FBF7ED]/95 text-[#8A6927]'
              }`}
            >
              ›
            </motion.button>
          </>
        )}

        <div className="relative z-20">
          <AnimatePresence
            mode="wait"
            initial={false}
            custom={direction}
          >
            <GuestMessagePaper
              key={getMessageKey(
                activeMessage
              )}
              message={
                activeMessage
              }
              isDark={isDark}
              direction={direction}
              shouldReduceMotion={
                shouldReduceMotion
              }
              hasSeveral={
                hasSeveral
              }
              onDragStart={
                handleDragStart
              }
              onDragEnd={
                handleDragEnd
              }
            />
          </AnimatePresence>
        </div>

        {hasSeveral && (
          <div className="relative z-30 mt-7 flex items-center justify-center gap-2">
            {messages.map(
              (
                message,
                index
              ) => (
                <button
                  type="button"
                  key={
                    getMessageKey(
                      message
                    )
                  }
                  onClick={() =>
                    selectMessage(
                      index
                    )
                  }
                  aria-label={`Mostrar firma ${
                    index + 1
                  }`}
                  className={`relative h-2 overflow-hidden rounded-full transition-all duration-500 ${
                    index ===
                    activeIndex
                      ? 'w-9 bg-[#C5A059]/25'
                      : isDark
                        ? 'w-2 bg-white/15'
                        : 'w-2 bg-black/10'
                  }`}
                >
                  {index ===
                    activeIndex && (
                    <motion.span
                      key={`auto-progress-${activeIndex}`}
                      initial={{
                        scaleX: 0
                      }}
                      animate={{
                        scaleX:
                          paused
                            ? 0
                            : 1
                      }}
                      transition={{
                        duration:
                          paused
                            ? 0
                            : AUTO_ROTATE_TIME /
                              1000,

                        ease: 'linear'
                      }}
                      className="absolute inset-0 origin-left rounded-full bg-[#C5A059]"
                    />
                  )}
                </button>
              )
            )}
          </div>
        )}

        {hasSeveral && (
          <div className="relative z-20 mt-4 flex items-center justify-center gap-2">
            <span
              aria-hidden="true"
              className="text-[#C5A059]/60"
            >
              ↔
            </span>

            <p
              className={`text-[8px] font-bold uppercase tracking-[0.22em] opacity-55 ${
                isDark
                  ? 'text-[#FCF6BA]'
                  : 'text-[#8A6927]'
              }`}
            >
              Desliza o espera para ver otra firma
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function GuestBookSection({
  wedding = {},
  messages = [],
  isDark = false
}) {
  const styles =
    getStyles(isDark);

  const initialMessages =
    useMemo(
      () =>
        normalizeMessages(
          messages
        ),
      [messages]
    );

  const [
    localMessages,
    setLocalMessages
  ] = useState(
    initialMessages
  );

  /*
   * Solo existe durante esta visita.
   *
   * Al mandar una firma:
   * - desaparece el formulario.
   *
   * Al hacer F5:
   * - vuelve a aparecer.
   *
   * No usamos localStorage.
   */
  const [
    submittedThisVisit,
    setSubmittedThisVisit
  ] = useState(false);

  const [
    showThanks,
    setShowThanks
  ] = useState(false);

  const thanksTimerRef =
    useRef(null);

  useEffect(() => {
    setLocalMessages(
      (current) =>
        mergeMessages(
          current,
          normalizeMessages(
            messages
          )
        )
    );
  }, [messages]);

  useEffect(() => {
    return () => {
      if (
        thanksTimerRef.current
      ) {
        window.clearTimeout(
          thanksTimerRef.current
        );
      }
    };
  }, []);

  const guestBook =
    wedding?.guestBook || {};

  const title =
    cleanText(
      guestBook.title
    ) ||
    'Libro de firmas';

  const formTitle =
    cleanText(
      guestBook.formTitle
    ) ||
    'Deja tu firma';

  const description =
    cleanText(
      guestBook.message ||
        guestBook.description
    ) ||
    'Escribe unas palabras para los novios y después agrega tu nombre o el nombre de tu familia.';

  const slug =
    cleanText(
      wedding?.slug
    );

  function handleMessageCreated(
    createdMessage
  ) {
    const normalized =
      normalizeMessage(
        createdMessage,
        0
      );

    if (normalized) {
      setLocalMessages(
        (current) =>
          mergeMessages(
            [
              normalized
            ],
            current
          )
      );
    }

    setSubmittedThisVisit(
      true
    );

    setShowThanks(true);

    if (
      thanksTimerRef.current
    ) {
      window.clearTimeout(
        thanksTimerRef.current
      );
    }

    thanksTimerRef.current =
      window.setTimeout(
        () => {
          setShowThanks(false);

          thanksTimerRef.current =
            null;
        },
        3200
      );
  }

  return (
    <section
      aria-labelledby="guest-book-section-title"
      className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-20"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-[0.14] ${
          isDark
            ? BLACK_TEXTURE
            : PAPER_TEXTURE
        }`}
      />

      <motion.div
        aria-hidden="true"
        animate={{
          opacity: [
            0.05,
            0.12,
            0.05
          ],
          scale: [
            1,
            1.08,
            1
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] ${
          isDark
            ? 'bg-[#C5A059]'
            : 'bg-[#D4AF37]'
        }`}
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <AnimatePresence
          mode="wait"
        >
          {!submittedThisVisit && (
            <motion.div
              key="guest-form"
              initial={{
                opacity: 0,
                y: 30
              }}
              whileInView={{
                opacity: 1,
                y: 0
              }}
              viewport={{
                once: true
              }}
              exit={{
                opacity: 0,
                y: -25,
                scale: 0.97,
                height: 0,
                marginBottom: 0
              }}
              transition={{
                duration: 0.6,
                ease: [
                  0.16,
                  1,
                  0.3,
                  1
                ]
              }}
              className="mb-14 overflow-hidden"
            >
              <div className="mb-8 text-center">
                <motion.div
                  aria-hidden="true"
                  initial={{
                    opacity: 0,
                    scale: 0.7
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1
                  }}
                  viewport={{
                    once: true
                  }}
                  transition={{
                    duration: 0.7
                  }}
                  className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#C5A059]/20 font-serif text-xl text-[#C5A059]"
                >
                  ✎
                </motion.div>

                <h2
                  className={`font-serif text-4xl sm:text-5xl ${styles.goldGradient}`}
                >
                  {formTitle}
                </h2>

                <p
                  className={`mx-auto mt-4 max-w-xl font-serif text-sm italic leading-6 sm:text-base ${styles.mutedText}`}
                >
                  {description}
                </p>
              </div>

              <GuestBookForm
                slug={slug}
                wedding={wedding}
                isDark={isDark}
                onSuccess={
                  handleMessageCreated
                }
              />
            </motion.div>
          )}

          {submittedThisVisit &&
            showThanks && (
              <motion.div
                key="guest-thanks"
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: -15,
                  height: 0,
                  marginBottom: 0
                }}
                transition={{
                  duration: 0.5,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1
                  ]
                }}
                className={`relative mx-auto mb-10 max-w-md overflow-hidden rounded-[2rem] border px-7 py-7 text-center shadow-lg ${
                  isDark
                    ? 'border-[#C5A059]/20 bg-[#0A0A0A]/80'
                    : 'border-[#9E7A32]/15 bg-[#FBF7ED]'
                }`}
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 opacity-[0.16] ${
                    isDark
                      ? BLACK_TEXTURE
                      : PAPER_TEXTURE
                  }`}
                />

                <motion.div
                  aria-hidden="true"
                  initial={{
                    scale: 0,
                    rotate: -15
                  }}
                  animate={{
                    scale: 1,
                    rotate: 0
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 220,
                    damping: 16
                  }}
                  className="relative z-10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#C5A059]/25 text-xl text-[#C5A059]"
                >
                  ✓
                </motion.div>

                <p
                  className={`relative z-10 font-serif text-xl ${styles.textPrimary}`}
                >
                  ¡Gracias por tu firma!
                </p>

                <p
                  className={`relative z-10 mt-2 text-xs ${styles.mutedText}`}
                >
                  Tus palabras ya forman parte de este recuerdo.
                </p>
              </motion.div>
            )}
        </AnimatePresence>

        <motion.div
          initial={{
            opacity: 0,
            y: 25
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true,
            margin: '-60px'
          }}
          transition={{
            duration: 0.8
          }}
          className="text-center"
        >
          <div
            aria-hidden="true"
            className="mx-auto mb-5 flex items-center justify-center gap-4"
          >
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#C5A059]/50" />

            <span className="text-sm text-[#C5A059]">
              ✦
            </span>

            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#C5A059]/50" />
          </div>

          <p
            className={`text-[9px] font-black uppercase tracking-[0.4em] ${styles.textSecondary}`}
          >
            Mensajes para los novios
          </p>

          <h2
            id="guest-book-section-title"
            className={`mt-4 font-serif text-3xl sm:text-4xl ${styles.goldGradient}`}
          >
            {title}
          </h2>

          {localMessages.length > 0 && (
            <p
              className={`mt-3 font-serif text-sm italic ${styles.mutedText}`}
            >
              {localMessages.length ===
              1
                ? '1 firma en este libro'
                : `${localMessages.length} firmas en este libro`}
            </p>
          )}
        </motion.div>

        <div className="mt-7">
          <GuestMessageCarousel
            messages={
              localMessages
            }
            isDark={isDark}
          />
        </div>
      </div>
    </section>
  );
}

export default GuestBookSection;