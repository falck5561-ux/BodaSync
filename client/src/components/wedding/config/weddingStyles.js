export const BLACK_TEXTURE =
  "bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]";

export const PAPER_TEXTURE =
  "bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]";

export const STARDUST_TEXTURE =
  "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]";

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
    surface: '#fdfbf7',
    primary: '#111111',
    secondary: '#9e7a32',
    gold: '#c5a059',
    lightGold: '#fff3cc',
    darkGold: '#7a5a1b'
  }
};

export function getStyles(isDark = false) {
  return {
    bg: isDark
      ? `bg-[#050505] ${BLACK_TEXTURE}`
      : `bg-[#F9F7F2] ${PAPER_TEXTURE}`,

    textPrimary: isDark ? 'text-[#FDFBF7]' : 'text-[#111111]',

    textSecondary: isDark ? 'text-[#C5A059]' : 'text-[#9E7A32]',

    glassBox: isDark
      ? 'bg-[#0a0a0a]/50 backdrop-blur-[30px] border border-t-white/10 border-l-white/10 border-b-[#C5A059]/20 border-r-[#C5A059]/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(197,160,89,0.05)]'
      : 'bg-[#FFFFFF]/50 backdrop-blur-[30px] border border-t-white/60 border-l-white/60 border-b-[#9E7A32]/20 border-r-[#9E7A32]/20 shadow-[0_20px_50px_rgba(158,122,50,0.1),inset_0_0_20px_rgba(255,255,255,0.5)]',

    goldGradient: isDark
      ? 'bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#AA7C11] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]'
      : 'bg-clip-text text-transparent bg-gradient-to-r from-[#9E7A32] via-[#C5A059] to-[#7A5A1B] drop-shadow-[0_2px_10px_rgba(158,122,50,0.2)]',

    dividerLine: isDark
      ? 'from-transparent via-[#C5A059]/50 to-transparent'
      : 'from-transparent via-[#9E7A32]/40 to-transparent',

    innerCard: isDark
      ? 'bg-[#050505]/80 backdrop-blur-md border border-[#C5A059]/20'
      : 'bg-[#FDFBF7]/90 backdrop-blur-md border border-[#9E7A32]/20',

    envelopeBase: isDark
      ? `bg-[#0A0A0A] border-[#1a1a1a] ${BLACK_TEXTURE} opacity-90`
      : `bg-[#EAE6DE] border-[#D4AF37]/30 ${PAPER_TEXTURE}`,

    envelopeFlapSide: isDark
      ? `bg-[#111] border-[#222] ${BLACK_TEXTURE}`
      : `bg-[#E0DCD4] border-[#D4AF37]/20 ${PAPER_TEXTURE}`,

    envelopeFlapBottom: isDark
      ? `bg-[#141414] border-[#222] ${BLACK_TEXTURE}`
      : `bg-[#D6D1C7] border-[#D4AF37]/20 ${PAPER_TEXTURE}`,

    envelopeFlapTop: isDark
      ? `bg-[#1A1A1A] border-[#333] ${BLACK_TEXTURE}`
      : `bg-[#EAE6DE] border-[#D4AF37]/30 ${PAPER_TEXTURE}`,

    envelopeShadow: isDark
      ? 'shadow-[0_-10px_40px_rgba(0,0,0,0.9)]'
      : 'shadow-[0_-5px_25px_rgba(184,134,11,0.15)]',

    sectionBorder: isDark ? 'border-white/5' : 'border-black/5',

    mutedText: isDark ? 'text-gray-400' : 'text-gray-600',

    cardBackground: isDark
      ? 'bg-[#111]/80 border-white/10'
      : 'bg-white/80 border-black/10',

    overlay: isDark
      ? 'bg-black/95 backdrop-blur-[40px]'
      : 'bg-[#F9F7F2]/95 backdrop-blur-[40px]'
  };
}

export function getGoldColor(isDark = false) {
  return isDark
    ? WEDDING_COLORS.dark.secondary
    : WEDDING_COLORS.light.secondary;
}

export function getBackgroundColor(isDark = false) {
  return isDark
    ? WEDDING_COLORS.dark.background
    : WEDDING_COLORS.light.background;
}

export default getStyles;