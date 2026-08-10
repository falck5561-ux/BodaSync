import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { getStyles } from '../config/weddingStyles';
import {
  getGuestServiceErrorMessage,
  submitGuestBookMessage
} from '../services/guestService';

const MAX_AUTHOR_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 1200;

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeSubmittedMessage(response, fallback) {
  const source =
    response?.guestMessage ||
    response?.data?.guestMessage ||
    response?.messageData ||
    response?.data ||
    response ||
    {};

  return {
    id:
      source.id ||
      source._id ||
      `guest-message-${Date.now()}`,
    author:
      cleanText(source.author || source.name) ||
      fallback.author,
    message:
      cleanText(
        source.message ||
          source.content ||
          source.text
      ) || fallback.message,
    createdAt:
      source.createdAt ||
      source.created_at ||
      new Date().toISOString()
  };
}

export function GuestBookForm({
  slug,
  isDark = false,
  onSubmitted,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  const styles = getStyles(isDark);

  const requestControllerRef = useRef(null);
  const messageInputRef = useRef(null);

  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const sending = status === 'sending';

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
    };
  }, []);

  function clearFeedback() {
    if (error) {
      setError('');
    }

    if (status === 'success' || status === 'error') {
      setStatus('idle');
    }
  }

  function handleMessageChange(event) {
    setMessage(event.target.value);
    clearFeedback();
  }

  function handleAuthorChange(event) {
    setAuthor(event.target.value);
    clearFeedback();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (sending) {
      return;
    }

    const normalizedMessage = cleanText(message);
    const normalizedAuthor = cleanText(author);

    if (!slug) {
      setStatus('error');
      setError('No se pudo identificar esta invitación.');
      return;
    }

    if (!normalizedMessage) {
      setStatus('error');
      setError('Escribe un mensaje para los novios.');
      messageInputRef.current?.focus();
      return;
    }

    if (normalizedMessage.length < 2) {
      setStatus('error');
      setError('El mensaje debe contener al menos 2 caracteres.');
      messageInputRef.current?.focus();
      return;
    }

    if (!normalizedAuthor) {
      setStatus('error');
      setError('Escribe tu nombre o el nombre de tu familia.');
      return;
    }

    if (normalizedAuthor.length < 2) {
      setStatus('error');
      setError(
        'El nombre debe contener al menos 2 caracteres.'
      );
      return;
    }

    requestControllerRef.current?.abort();

    const controller = new AbortController();

    requestControllerRef.current = controller;

    try {
      setStatus('sending');
      setError('');

      const response = await submitGuestBookMessage({
        slug,
        message: normalizedMessage,
        author: normalizedAuthor,
        signal: controller.signal
      });

      if (controller.signal.aborted) {
        return;
      }

      const submittedMessage = normalizeSubmittedMessage(
        response,
        {
          message: normalizedMessage,
          author: normalizedAuthor
        }
      );

      if (typeof onSubmitted === 'function') {
        onSubmitted(submittedMessage);
      }

      setMessage('');
      setAuthor('');
      setStatus('success');
    } catch (requestError) {
      if (requestError?.name === 'AbortError') {
        return;
      }

      setStatus('error');
      setError(
        getGuestServiceErrorMessage(requestError) ||
          'No fue posible enviar el mensaje.'
      );
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
    }
  }

  return (
    <motion.form
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              y: 25
            }
      }
      whileInView={{
        opacity: 1,
        y: 0
      }}
      viewport={{
        once: true,
        margin: '-50px'
      }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }}
      onSubmit={handleSubmit}
      className={`relative z-10 mx-auto mb-16 w-[calc(100%-3rem)] max-w-xl rounded-[2.5rem] p-7 sm:p-10 ${styles.glassBox} ${className}`}
    >
      <header className="mb-8 text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 text-2xl"
        >
          ✍️
        </div>

        <h3
          className={`font-serif text-2xl sm:text-3xl ${styles.goldGradient}`}
        >
          Deja tu firma
        </h3>

        <p
          className={`mx-auto mt-3 max-w-md font-serif text-sm italic leading-relaxed ${styles.mutedText}`}
        >
          Escribe unas palabras para los novios y después
          agrega tu nombre o el nombre de tu familia.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="guest-book-message"
            className={`mb-2 block text-[9px] font-black uppercase tracking-[0.3em] ${styles.textSecondary}`}
          >
            Mensaje para los novios
          </label>

          <textarea
            ref={messageInputRef}
            id="guest-book-message"
            name="message"
            value={message}
            onChange={handleMessageChange}
            disabled={sending}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={7}
            placeholder="Escribe aquí tus buenos deseos, felicitaciones o unas palabras especiales para los novios..."
            className={`w-full resize-none rounded-2xl border px-5 py-4 font-sans text-sm leading-relaxed outline-none transition duration-300 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 disabled:cursor-not-allowed disabled:opacity-60 ${
              isDark
                ? 'border-white/10 bg-black/40 text-white placeholder:text-gray-600'
                : 'border-black/10 bg-white/70 text-black placeholder:text-gray-400'
            }`}
          />

          <div className="mt-2 flex items-center justify-between gap-4">
            <p
              className={`text-[9px] opacity-50 ${styles.textPrimary}`}
            >
              Este mensaje aparecerá en el libro de firmas.
            </p>

            <p
              className={`shrink-0 text-[9px] opacity-50 ${styles.textPrimary}`}
            >
              {message.length}/{MAX_MESSAGE_LENGTH}
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="guest-book-author"
            className={`mb-2 block text-[9px] font-black uppercase tracking-[0.3em] ${styles.textSecondary}`}
          >
            Tu nombre o nombre de la familia
          </label>

          <input
            id="guest-book-author"
            name="author"
            type="text"
            value={author}
            onChange={handleAuthorChange}
            disabled={sending}
            maxLength={MAX_AUTHOR_LENGTH}
            autoComplete="name"
            placeholder="Ejemplo: Familia Hernández"
            className={`w-full rounded-2xl border px-5 py-4 font-sans text-sm outline-none transition duration-300 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 disabled:cursor-not-allowed disabled:opacity-60 ${
              isDark
                ? 'border-white/10 bg-black/40 text-white placeholder:text-gray-600'
                : 'border-black/10 bg-white/70 text-black placeholder:text-gray-400'
            }`}
          />

          <p
            className={`mt-2 text-right text-[9px] opacity-50 ${styles.textPrimary}`}
          >
            {author.length}/{MAX_AUTHOR_LENGTH}
          </p>
        </div>

        {error && (
          <motion.div
            role="alert"
            initial={{
              opacity: 0,
              y: -5
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className={`rounded-2xl border px-5 py-4 text-center text-xs ${
              isDark
                ? 'border-red-400/20 bg-red-950/30 text-red-200'
                : 'border-red-600/20 bg-red-50 text-red-700'
            }`}
          >
            {error}
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            role="status"
            initial={{
              opacity: 0,
              y: -5
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className={`rounded-2xl border px-5 py-4 text-center ${
              isDark
                ? 'border-green-400/20 bg-green-950/30 text-green-200'
                : 'border-green-600/20 bg-green-50 text-green-700'
            }`}
          >
            <strong className="block text-sm">
              ¡Gracias por dejar tu mensaje!
            </strong>

            <span className="mt-1 block text-xs opacity-80">
              Tu firma ya forma parte de este recuerdo.
            </span>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={sending || !slug}
          whileHover={
            sending || shouldReduceMotion
              ? undefined
              : {
                  y: -3,
                  scale: 1.01,
                  boxShadow:
                    '0 20px 45px rgba(197, 160, 89, 0.4)'
                }
          }
          whileTap={
            sending
              ? undefined
              : {
                  scale: 0.98
                }
          }
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#AA7C11] px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-black shadow-[0_15px_35px_rgba(197,160,89,0.3)] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="relative z-10">
            {sending ? 'Guardando mensaje...' : 'Dejar mensaje'}
          </span>
        </motion.button>

        {!slug && (
          <p
            className={`text-center text-xs ${styles.mutedText}`}
          >
            El libro de firmas no está disponible en este
            momento.
          </p>
        )}
      </div>
    </motion.form>
  );
}

export default GuestBookForm;