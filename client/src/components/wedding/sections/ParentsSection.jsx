import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

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

function firstText(...values) {
  for (const value of values) {
    const normalizedValue = cleanText(value);

    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return '';
}

function normalizeParents(wedding = {}) {
  const groomParents = Array.isArray(wedding.padresNovio)
    ? wedding.padresNovio
    : [];

  const brideParents = Array.isArray(wedding.padresNovia)
    ? wedding.padresNovia
    : [];

  return {
    groom: {
      father: firstText(
        wedding.parents?.groom?.father,
        wedding.parents?.groomFather,
        wedding.groomFather,
        groomParents[0]
      ),

      mother: firstText(
        wedding.parents?.groom?.mother,
        wedding.parents?.groomMother,
        wedding.groomMother,
        groomParents[1]
      )
    },

    bride: {
      father: firstText(
        wedding.parents?.bride?.father,
        wedding.parents?.brideFather,
        wedding.brideFather,
        brideParents[0]
      ),

      mother: firstText(
        wedding.parents?.bride?.mother,
        wedding.parents?.brideMother,
        wedding.brideMother,
        brideParents[1]
      )
    }
  };
}

function ParentName({
  children,
  isDark
}) {
  const styles = getStyles(isDark);

  if (!children) {
    return null;
  }

  return (
    <motion.p
      variants={fadeInUp}
      className={`font-serif text-xl font-light leading-relaxed md:text-2xl ${styles.textPrimary}`}
    >
      {children}
    </motion.p>
  );
}

function ParentsCard({
  title,
  father,
  mother,
  isDark = false,
  delay = 0
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  const hasFather = Boolean(father);
  const hasMother = Boolean(mother);

  if (!hasFather && !hasMother) {
    return null;
  }

  return (
    <motion.article
      variants={containerStagger}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{
        once: true,
        margin: '-70px'
      }}
      transition={{
        delay
      }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -8,
              scale: 1.01
            }
      }
      className={`group relative overflow-hidden rounded-[2.5rem] p-10 text-center shadow-2xl transition-shadow duration-500 hover:shadow-[0_20px_60px_rgba(197,160,89,0.2)] md:p-12 ${styles.glassBox}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-[80px] ${
          isDark
            ? 'bg-[#C5A059]/10'
            : 'bg-[#9E7A32]/10'
        }`}
      />

      <motion.div
        variants={fadeInUp}
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                scale: 1.1,
                rotate: 5
              }
        }
        className={`relative z-10 mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border text-2xl shadow-inner ${
          isDark
            ? 'border-white/10 bg-[#C5A059]/10'
            : 'border-black/5 bg-[#9E7A32]/10'
        }`}
      >
        <span aria-hidden="true">🕊️</span>
      </motion.div>

      <motion.p
        variants={fadeInUp}
        className={`relative z-10 mb-8 text-[10px] font-black uppercase tracking-[0.35em] ${styles.textSecondary}`}
      >
        {title}
      </motion.p>

      <div className="relative z-10 flex flex-col items-center">
        <ParentName isDark={isDark}>
          {father}
        </ParentName>

        {hasFather && hasMother && (
          <motion.span
            aria-hidden="true"
            variants={fadeInUp}
            className={`my-4 font-serif text-3xl font-light italic opacity-50 ${styles.textSecondary}`}
          >
            &
          </motion.span>
        )}

        <ParentName isDark={isDark}>
          {mother}
        </ParentName>
      </div>

      <motion.div
        aria-hidden="true"
        variants={fadeInUp}
        className={`relative z-10 mx-auto mt-8 h-px w-20 bg-gradient-to-r ${styles.dividerLine}`}
      />
    </motion.article>
  );
}

export function ParentsSection({
  wedding = {},
  isDark = false,
  title = 'Con la bendición de nuestros padres',
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  const parents = useMemo(
    () => normalizeParents(wedding),
    [wedding]
  );

  const groomName = firstText(
    wedding.groomName,
    wedding.novio
  );

  const brideName = firstText(
    wedding.brideName,
    wedding.novia
  );

  const hasGroomParents = Boolean(
    parents.groom.father ||
      parents.groom.mother
  );

  const hasBrideParents = Boolean(
    parents.bride.father ||
      parents.bride.mother
  );

  if (!hasGroomParents && !hasBrideParents) {
    return null;
  }

  const groomParentsTitle = groomName
    ? `Padres de ${groomName}`
    : 'Padres del novio';

  const brideParentsTitle = brideName
    ? `Padres de ${brideName}`
    : 'Padres de la novia';

  return (
    <section
      aria-labelledby="parents-section-title"
      className={`relative overflow-hidden px-6 py-20 md:px-8 ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.05),transparent_60%)]'
            : 'bg-[radial-gradient(circle_at_center,rgba(158,122,50,0.06),transparent_60%)]'
        }`}
      />

      <motion.header
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 20
              }
        }
        whileInView={{
          opacity: 1,
          y: 0
        }}
        viewport={{
          once: true,
          margin: '-60px'
        }}
        transition={{
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="relative z-10 mx-auto mb-14 max-w-2xl text-center"
      >
        <p
          className={`mb-4 text-[9px] font-black uppercase tracking-[0.45em] md:text-[10px] ${styles.textSecondary}`}
        >
          Nuestras familias
        </p>

        <h2
          id="parents-section-title"
          className={`font-serif text-3xl font-light leading-tight md:text-5xl ${styles.goldGradient}`}
        >
          {title}
        </h2>
      </motion.header>

      <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
        {hasGroomParents && (
          <ParentsCard
            title={groomParentsTitle}
            father={parents.groom.father}
            mother={parents.groom.mother}
            isDark={isDark}
          />
        )}

        {hasBrideParents && (
          <ParentsCard
            title={brideParentsTitle}
            father={parents.bride.father}
            mother={parents.bride.mother}
            isDark={isDark}
            delay={0.15}
          />
        )}
      </div>
    </section>
  );
}

export default ParentsSection;