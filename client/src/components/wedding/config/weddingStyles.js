export const BLACK_TEXTURE =
  "bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]";

export const PAPER_TEXTURE =
  "bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]";

export const STARDUST_TEXTURE =
  "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]";

/*
 * =========================================================
 * PALETAS BASE
 * =========================================================
 *
 * DARK:
 * Siempre usa la identidad premium de BodaSync.
 *
 * LIGHT:
 * Solo funciona como respaldo.
 * En una boda real los colores vienen de:
 *
 * --wedding-primary
 * --wedding-secondary
 * --wedding-background
 * --wedding-text
 */
export const WEDDING_COLORS = {
  dark: {
    background: '#050505',
    surface: '#0a0a0a',
    primary: '#fdfbf7',
    secondary: '#c5a059',
    gold: '#d4af37',
    lightGold: '#fcf6ba',
    darkGold: '#aa7c11'
  },

  light: {
    background: '#f9f7f2',
    surface: '#ffffff',
    primary: '#9e7a32',
    secondary: '#c5a059',
    text: '#111111'
  }
};

/*
 * =========================================================
 * ESTILOS PÚBLICOS
 * =========================================================
 *
 * IMPORTANTE:
 *
 * En modo oscuro usamos colores fijos.
 *
 * En modo claro usamos las variables CSS que LandingPage
 * recibe desde wedding.theme.
 */
export function getStyles(isDark = false) {
  if (isDark) {
    return {
      bg: `bg-[#050505] ${BLACK_TEXTURE}`,

      textPrimary:
        'text-[#FDFBF7]',

      textSecondary:
        'text-[#C5A059]',

      glassBox:
        'bg-[#0a0a0a]/50 backdrop-blur-[30px] border border-t-white/10 border-l-white/10 border-b-[#C5A059]/20 border-r-[#C5A059]/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(197,160,89,0.05)]',

      goldGradient:
        'bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#AA7C11] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]',

      dividerLine:
        'from-transparent via-[#C5A059]/50 to-transparent',

      innerCard:
        'bg-[#050505]/80 backdrop-blur-md border border-[#C5A059]/20',

      sectionBorder:
        'border-white/5',

      mutedText:
        'text-gray-400',

      cardBackground:
        'bg-[#111]/80 border-white/10',

      overlay:
        'bg-black/95 backdrop-blur-[40px]',

      /*
       * SOBRE.
       *
       * Lo dejamos con el diseño que ya te gustó.
       * No lo estamos rediseñando por el tema.
       */
      envelopeBase:
        `bg-[#0A0A0A] border-[#1a1a1a] ${BLACK_TEXTURE} opacity-90`,

      envelopeFlapSide:
        `bg-[#111] border-[#222] ${BLACK_TEXTURE}`,

      envelopeFlapBottom:
        `bg-[#141414] border-[#222] ${BLACK_TEXTURE}`,

      envelopeFlapTop:
        `bg-[#1A1A1A] border-[#333] ${BLACK_TEXTURE}`,

      envelopeShadow:
        'shadow-[0_-10px_40px_rgba(0,0,0,0.9)]'
    };
  }

  /*
   * =======================================================
   * MODO CLARO
   * =======================================================
   *
   * Aquí ya NO ponemos:
   *
   * #9E7A32
   * #C5A059
   * #F9F7F2
   * #111111
   *
   * como identidad visual principal.
   *
   * Usamos la paleta seleccionada por el cliente.
   */
  return {
    bg: `bg-[var(--wedding-background)] ${PAPER_TEXTURE}`,

    textPrimary:
      'text-[var(--wedding-text)]',

    textSecondary:
      'text-[var(--wedding-primary)]',

    glassBox:
      'bg-white/55 backdrop-blur-[30px] border border-[var(--wedding-secondary)] shadow-[0_20px_50px_rgba(0,0,0,0.08),inset_0_0_20px_rgba(255,255,255,0.45)]',

    /*
     * Los títulos destacados ahora toman:
     *
     * principal → secundario → principal
     */
    goldGradient:
      'bg-clip-text text-transparent bg-gradient-to-r from-[var(--wedding-primary)] via-[var(--wedding-secondary)] to-[var(--wedding-primary)]',

    dividerLine:
      'from-transparent via-[var(--wedding-secondary)] to-transparent',

    innerCard:
      'bg-white/70 backdrop-blur-md border border-[var(--wedding-secondary)]',

    sectionBorder:
      'border-[var(--wedding-secondary)]',

    mutedText:
      'text-[var(--wedding-text)] opacity-70',

    cardBackground:
      'bg-white/75 border-[var(--wedding-secondary)]',

    overlay:
      'bg-[var(--wedding-background)] backdrop-blur-[40px]',

    /*
     * SOBRE CLARO.
     *
     * Se conserva exactamente con la apariencia anterior
     * porque me dijiste que ese diseño estaba bien.
     */
    envelopeBase:
      `bg-[#EAE6DE] border-[#D4AF37]/30 ${PAPER_TEXTURE}`,

    envelopeFlapSide:
      `bg-[#E0DCD4] border-[#D4AF37]/20 ${PAPER_TEXTURE}`,

    envelopeFlapBottom:
      `bg-[#D6D1C7] border-[#D4AF37]/20 ${PAPER_TEXTURE}`,

    envelopeFlapTop:
      `bg-[#EAE6DE] border-[#D4AF37]/30 ${PAPER_TEXTURE}`,

    envelopeShadow:
      'shadow-[0_-5px_25px_rgba(184,134,11,0.15)]'
  };
}

/*
 * Algunos componentes usan este valor directamente
 * mediante style={{ color: ... }}.
 *
 * También los hacemos compatibles con la paleta.
 */
export function getGoldColor(isDark = false) {
  if (isDark) {
    return WEDDING_COLORS.dark.secondary;
  }

  return 'var(--wedding-primary)';
}

export function getPrimaryColor(isDark = false) {
  if (isDark) {
    return WEDDING_COLORS.dark.secondary;
  }

  return 'var(--wedding-primary)';
}

export function getSecondaryColor(isDark = false) {
  if (isDark) {
    return WEDDING_COLORS.dark.lightGold;
  }

  return 'var(--wedding-secondary)';
}

export function getTextColor(isDark = false) {
  if (isDark) {
    return WEDDING_COLORS.dark.primary;
  }

  return 'var(--wedding-text)';
}

export function getBackgroundColor(isDark = false) {
  if (isDark) {
    return WEDDING_COLORS.dark.background;
  }

  return 'var(--wedding-background)';
}

export default getStyles;