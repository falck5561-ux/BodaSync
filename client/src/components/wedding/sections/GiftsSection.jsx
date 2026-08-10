import React, { useState } from 'react';
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

function getGiftData(wedding = {}) {
  const gifts = wedding.gifts || {};

  return {
    message: cleanText(
      gifts.message ||
        wedding.giftMessage
    ),

    bankName: cleanText(
      gifts.bankName ||
        wedding.bankName
    ),

    accountHolder: cleanText(
      gifts.accountHolder ||
        wedding.accountHolder
    ),

    accountNumber: cleanText(
      gifts.accountNumber ||
        wedding.accountNumber
    ),

    clabe: cleanText(
      gifts.clabe ||
        wedding.clabe
    )
  };
}

async function copyText(value) {
  const text = cleanText(value);

  if (!text) {
    return false;
  }

  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard?.writeText
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continuamos con el método alternativo.
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const textarea = document.createElement('textarea');

    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);

    textarea.select();

    const copied = document.execCommand('copy');

    textarea.remove();

    return copied;
  } catch {
    return false;
  }
}

function BankField({
  label,
  value,
  copyable = false,
  copied = false,
  onCopy,
  isDark = false
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  if (!value) {
    return null;
  }

  return (
    <motion.div
      variants={fadeInUp}
      className={`rounded-2xl border p-5 text-left ${
        isDark
          ? 'border-white/10 bg-black/25'
          : 'border-black/5 bg-white/50'
      }`}
    >
      <p
        className={`mb-2 text-[9px] font-black uppercase tracking-[0.3em] ${styles.textSecondary}`}
      >
        {label}
      </p>

      <div className="flex items-center justify-between gap-4">
        <p
          className={`min-w-0 break-all font-sans text-sm font-semibold sm:text-base ${styles.textPrimary}`}
        >
          {value}
        </p>

        {copyable && (
          <motion.button
            type="button"
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    scale: 1.05
                  }
            }
            whileTap={{
              scale: 0.95
            }}
            onClick={onCopy}
            className={`shrink-0 rounded-full border px-4 py-2 text-[8px] font-black uppercase tracking-[0.2em] transition ${
              copied
                ? 'border-green-500/30 bg-green-500/10 text-green-600'
                : isDark
                  ? 'border-white/10 bg-white/5 text-[#FCF6BA] hover:border-[#C5A059]/40'
                  : 'border-black/10 bg-white text-[#8A6927] hover:border-[#9E7A32]/40'
            }`}
          >
            {copied ? 'Copiado' : 'Copiar'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export function GiftsSection({
  wedding = {},
  isDark = false,
  title = 'Mesa de regalos',
  eyebrow = 'Un detalle para nosotros',
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  const [copiedField, setCopiedField] = useState('');

  const gifts = getGiftData(wedding);

  const hasBankInformation = Boolean(
    gifts.bankName ||
      gifts.accountHolder ||
      gifts.accountNumber ||
      gifts.clabe
  );

  const hasGiftInformation = Boolean(
    gifts.message ||
      hasBankInformation
  );

  if (!hasGiftInformation) {
    return null;
  }

  async function handleCopy(field, value) {
    const copied = await copyText(value);

    if (!copied) {
      return;
    }

    setCopiedField(field);

    window.setTimeout(() => {
      setCopiedField((currentField) =>
        currentField === field
          ? ''
          : currentField
      );
    }, 1800);
  }

  return (
    <section
      aria-labelledby="gifts-section-title"
      className={`relative overflow-hidden px-6 py-28 ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-20 ${
          isDark
            ? BLACK_TEXTURE
            : PAPER_TEXTURE
        }`}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] ${
          isDark
            ? 'bg-[#C5A059]/7'
            : 'bg-[#9E7A32]/8'
        }`}
      />

      <motion.div
        variants={containerStagger}
        initial={
          shouldReduceMotion
            ? false
            : 'hidden'
        }
        whileInView="visible"
        viewport={{
          once: true,
          margin: '-80px'
        }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <motion.div
          variants={fadeInUp}
          aria-hidden="true"
          className="mb-8 text-6xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
        >
          🎁
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className={`mb-4 text-[9px] font-black uppercase tracking-[0.45em] ${styles.textSecondary}`}
        >
          {eyebrow}
        </motion.p>

        <motion.h2
          id="gifts-section-title"
          variants={fadeInUp}
          className={`font-serif text-4xl font-light tracking-tight sm:text-5xl ${styles.goldGradient}`}
        >
          {title}
        </motion.h2>

        {gifts.message && (
          <motion.p
            variants={fadeInUp}
            className={`mx-auto mt-8 max-w-xl font-serif text-base italic leading-relaxed sm:text-lg ${styles.textPrimary}`}
          >
            {gifts.message}
          </motion.p>
        )}

        {hasBankInformation && (
          <motion.div
            variants={fadeInUp}
            className={`mx-auto mt-12 max-w-xl rounded-[3rem] p-7 sm:p-10 ${styles.glassBox}`}
          >
            <div className="mb-8 text-center">
              <p
                className={`text-[9px] font-black uppercase tracking-[0.4em] ${styles.textSecondary}`}
              >
                Datos bancarios
              </p>

              <div
                aria-hidden="true"
                className={`mx-auto mt-5 h-px w-20 bg-gradient-to-r ${styles.dividerLine}`}
              />
            </div>

            <div className="flex flex-col gap-4">
              <BankField
                label="Banco"
                value={gifts.bankName}
                isDark={isDark}
              />

              <BankField
                label="Titular"
                value={gifts.accountHolder}
                isDark={isDark}
              />

              <BankField
                label="Número de cuenta"
                value={gifts.accountNumber}
                copyable
                copied={
                  copiedField ===
                  'accountNumber'
                }
                onCopy={() =>
                  handleCopy(
                    'accountNumber',
                    gifts.accountNumber
                  )
                }
                isDark={isDark}
              />

              <BankField
                label="CLABE"
                value={gifts.clabe}
                copyable
                copied={
                  copiedField === 'clabe'
                }
                onCopy={() =>
                  handleCopy(
                    'clabe',
                    gifts.clabe
                  )
                }
                isDark={isDark}
              />
            </div>
          </motion.div>
        )}

        <motion.div
          aria-hidden="true"
          variants={fadeInUp}
          className={`mx-auto mt-14 h-px w-28 bg-gradient-to-r ${styles.dividerLine}`}
        />
      </motion.div>
    </section>
  );
}

export default GiftsSection;