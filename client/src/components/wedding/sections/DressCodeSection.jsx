import React from 'react';
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

function DressCodeOption({
  icon,
  label,
  value,
  isDark = false
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  const cleanValue = cleanText(value);

  if (!cleanValue) {
    return null;
  }

  return (
    <motion.article
      variants={fadeInUp}
      className="group flex flex-1 flex-col items-center text-center"
    >
      <motion.div
        aria-hidden="true"
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                scale: 1.08,
                rotate: 5
              }
        }
        className={`mb-8 flex h-24 w-24 items-center justify-center rounded-full border text-4xl shadow-inner transition-transform duration-500 ${
          isDark
            ? 'border-white/5 bg-black/40'
            : 'border-black/5 bg-white/50'
        }`}
      >
        {icon}
      </motion.div>

      <p
        className={`mb-4 text-[10px] font-black uppercase tracking-[0.4em] ${styles.textSecondary}`}
      >
        {label}
      </p>

      <p
        className={`font-serif text-2xl font-light leading-relaxed md:text-3xl ${styles.textPrimary}`}
      >
        {cleanValue}
      </p>
    </motion.article>
  );
}

export function DressCodeSection({
  wedding = {},
  isDark = false,
  title = 'Código de vestimenta',
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  const dressCode = wedding?.dressCode || {};

  const dressCodeTitle = cleanText(
    dressCode.title ||
      wedding.dressCodeTitle
  );

  const womenDressCode = cleanText(
    dressCode.women ||
      wedding.dressCodeWomen
  );

  const menDressCode = cleanText(
    dressCode.men ||
      wedding.dressCodeMen
  );

  const notes = cleanText(
    dressCode.notes ||
      wedding.dressCodeNotes
  );

  const hasDressCodeInformation = Boolean(
    dressCodeTitle ||
      womenDressCode ||
      menDressCode ||
      notes
  );

  if (!hasDressCodeInformation) {
    return null;
  }

  const hasGenderRecommendations = Boolean(
    womenDressCode || menDressCode
  );

  return (
    <section
      aria-labelledby="dress-code-section-title"
      className={`relative overflow-hidden px-6 py-28 text-center ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-20 ${
          isDark ? BLACK_TEXTURE : PAPER_TEXTURE
        }`}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] ${
          isDark
            ? 'bg-[#C5A059]/8'
            : 'bg-[#9E7A32]/8'
        }`}
      />

      <motion.div
        variants={containerStagger}
        initial={shouldReduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{
          once: true,
          margin: '-80px'
        }}
        className="relative z-10 mx-auto max-w-4xl"
      >
        <motion.div
          variants={fadeInUp}
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  rotate: [0, 5, -5, 0],
                  scale: 1.05
                }
          }
          transition={{
            duration: 1
          }}
          className="mb-10 inline-block text-6xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] md:text-7xl"
        >
          <span aria-hidden="true">🎩</span>
        </motion.div>

        <motion.h2
          id="dress-code-section-title"
          variants={fadeInUp}
          className={`font-serif text-4xl tracking-tight md:text-5xl ${styles.goldGradient}`}
        >
          {title}
        </motion.h2>

        {dressCodeTitle && (
          <motion.p
            variants={fadeInUp}
            className={`mt-6 inline-block border-b pb-4 text-xs font-black uppercase tracking-[0.45em] md:text-sm md:tracking-[0.6em] ${
              isDark
                ? 'border-[#C5A059]/40 text-[#FCF6BA]'
                : 'border-[#9E7A32]/40 text-[#333333]'
            }`}
          >
            {dressCodeTitle}
          </motion.p>
        )}

        {hasGenderRecommendations && (
          <motion.div
            variants={fadeInUp}
            className={`mt-14 w-full rounded-[3rem] p-10 md:rounded-[4rem] md:p-16 ${styles.glassBox}`}
          >
            <div className="flex flex-col items-center justify-center gap-14 md:flex-row md:gap-20">
              {womenDressCode && (
                <DressCodeOption
                  icon="💃"
                  label="Mujeres"
                  value={womenDressCode}
                  isDark={isDark}
                />
              )}

              {womenDressCode && menDressCode && (
                <div
                  aria-hidden="true"
                  className={`hidden h-40 w-px md:block ${
                    isDark
                      ? 'bg-gradient-to-b from-transparent via-white/20 to-transparent'
                      : 'bg-gradient-to-b from-transparent via-black/20 to-transparent'
                  }`}
                />
              )}

              {menDressCode && (
                <DressCodeOption
                  icon="🤵"
                  label="Hombres"
                  value={menDressCode}
                  isDark={isDark}
                />
              )}
            </div>
          </motion.div>
        )}

        {notes && (
          <motion.div
            variants={fadeInUp}
            className={`mx-auto mt-12 max-w-2xl rounded-[2rem] border px-8 py-7 ${
              isDark
                ? 'border-white/10 bg-white/[0.03]'
                : 'border-black/5 bg-white/50'
            }`}
          >
            <p
              className={`mb-3 text-[9px] font-black uppercase tracking-[0.35em] ${styles.textSecondary}`}
            >
              Indicaciones adicionales
            </p>

            <p
              className={`font-serif text-sm italic leading-relaxed md:text-base ${styles.textPrimary}`}
            >
              {notes}
            </p>
          </motion.div>
        )}

        <motion.div
          aria-hidden="true"
          variants={fadeInUp}
          className={`mx-auto mt-12 h-px w-28 bg-gradient-to-r ${styles.dividerLine}`}
        />
      </motion.div>
    </section>
  );
}

export default DressCodeSection;