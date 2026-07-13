import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

const MUSIC_URL = '/music/cancion.mp3';
const PAPER_SOUND_URL = '/music/paper.mp3';
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

const BLACK_TEXTURE = "bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]";
const PAPER_TEXTURE = "bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]";

const getStyles = (isDark) => ({
    bg: isDark ? `bg-[#050505] ${BLACK_TEXTURE}` : `bg-[#F9F7F2] ${PAPER_TEXTURE}`,
    textPrimary: isDark ? "text-[#FDFBF7]" : "text-[#111111]",
    textSecondary: isDark ? "text-[#C5A059]" : "text-[#9E7A32]",
    glassBox: isDark
        ? "bg-[#0a0a0a]/50 backdrop-blur-[30px] border border-t-white/10 border-l-white/10 border-b-[#C5A059]/20 border-r-[#C5A059]/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(197,160,89,0.05)]"
        : "bg-[#FFFFFF]/50 backdrop-blur-[30px] border border-t-white/60 border-l-white/60 border-b-[#9E7A32]/20 border-r-[#9E7A32]/20 shadow-[0_20px_50px_rgba(158,122,50,0.1),inset_0_0_20px_rgba(255,255,255,0.5)]",
    goldGradient: isDark
        ? "bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#AA7C11] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
        : "bg-clip-text text-transparent bg-gradient-to-r from-[#9E7A32] via-[#C5A059] to-[#7A5A1B] drop-shadow-[0_2px_10px_rgba(158,122,50,0.2)]",
    dividerLine: isDark
        ? "from-transparent via-[#C5A059]/50 to-transparent"
        : "from-transparent via-[#9E7A32]/40 to-transparent",
    innerCard: isDark
        ? "bg-[#050505]/80 backdrop-blur-md border border-[#C5A059]/20"
        : "bg-[#FDFBF7]/90 backdrop-blur-md border border-[#9E7A32]/20",
    envelopeBase: isDark ? `bg-[#0A0A0A] border-[#1a1a1a] ${BLACK_TEXTURE} opacity-90` : `bg-[#EAE6DE] border-[#D4AF37]/30 ${PAPER_TEXTURE}`,
    envelopeFlapSide: isDark ? `bg-[#111] border-[#222] ${BLACK_TEXTURE}` : `bg-[#E0DCD4] border-[#D4AF37]/20 ${PAPER_TEXTURE}`,
    envelopeFlapBottom: isDark ? `bg-[#141414] border-[#222] ${BLACK_TEXTURE}` : `bg-[#D6D1C7] border-[#D4AF37]/20 ${PAPER_TEXTURE}`,
    envelopeFlapTop: isDark ? `bg-[#1A1A1A] border-[#333] ${BLACK_TEXTURE}` : `bg-[#EAE6DE] border-[#D4AF37]/30 ${PAPER_TEXTURE}`,
    envelopeShadow: isDark ? "shadow-[0_-10px_40px_rgba(0,0,0,0.9)]" : "shadow-[0_-5px_25px_rgba(184,134,11,0.15)]"
});

const containerStagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const fadeInUp = {
    hidden: { y: 50, opacity: 0, filter: "blur(5px)" },
    visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
};

export const GoldenParticles = ({ isDark }) => {
    const particles = Array.from({ length: 40 });
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden h-screen w-screen">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: "110vh", x: Math.random() * window.innerWidth, opacity: 0, scale: Math.random() * 0.6 + 0.4 }}
                    animate={{ y: "-10vh", opacity: [0, isDark ? 0.7 : 0.4, 0], x: `+=${Math.random() * 100 - 50}px` }}
                    transition={{ duration: Math.random() * 20 + 15, repeat: Infinity, delay: Math.random() * 15, ease: "linear" }}
                    className={`absolute w-[3px] h-[3px] rounded-full blur-[1px] ${isDark ? 'bg-[#FCF6BA] shadow-[0_0_10px_#FCF6BA]' : 'bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]'}`}
                />
            ))}
        </div>
    );
};

export const useSmartAudio = (url) => {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef(null);
    const fadeInterval = useRef(null);
    const wasPlayingRef = useRef(false);

    useEffect(() => {
        audioRef.current = new Audio(url);
        audioRef.current.loop = true;
        audioRef.current.volume = 0;

        const handleVisibility = () => {
            if (document.hidden) {
                wasPlayingRef.current = !audioRef.current.paused;
                if (audioRef.current) audioRef.current.pause();
            } else {
                if (wasPlayingRef.current && audioRef.current) audioRef.current.play().catch(() => {});
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            if (fadeInterval.current) clearInterval(fadeInterval.current);
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        };
    }, [url]);

    useEffect(() => {
        if (!audioRef.current) return;
        if (fadeInterval.current) clearInterval(fadeInterval.current);

        if (playing) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) playPromise.catch(() => {});
            fadeInterval.current = setInterval(() => {
                if (audioRef.current && audioRef.current.volume < 0.9) audioRef.current.volume = Math.min(audioRef.current.volume + 0.05, 1);
                else clearInterval(fadeInterval.current);
            }, 200);
        } else {
            fadeInterval.current = setInterval(() => {
                if (audioRef.current && audioRef.current.volume > 0.1) audioRef.current.volume = Math.max(audioRef.current.volume - 0.1, 0);
                else {
                    if (audioRef.current) audioRef.current.pause();
                    clearInterval(fadeInterval.current);
                }
            }, 100);
        }
    }, [playing]);

    return [playing, setPlaying];
};

export const FloatingControls = ({ playing, toggleAudio, isDark, toggleTheme }) => (
    <div className="fixed top-6 right-6 z-[100] flex gap-3">
        <button onClick={toggleTheme} className={`backdrop-blur-2xl border border-white/20 p-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 ${isDark ? 'bg-black/40 text-[#FCF6BA]' : 'bg-white/40 text-[#9E7A32]'}`}>
            {isDark ? '🌙' : '☀️'}
        </button>
        <button onClick={() => toggleAudio(!playing)} className={`backdrop-blur-2xl border border-white/20 p-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 group ${isDark ? 'bg-black/40' : 'bg-white/40'}`}>
            <div className="flex items-center justify-center w-4 h-4 gap-[3px]">
                {playing ? (
                    <>
                        <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} className={`w-[2px] rounded-full ${isDark ? 'bg-[#FCF6BA]' : 'bg-[#9E7A32]'}`} />
                        <motion.div animate={{ height: [4, 20, 4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2, ease: "easeInOut" }} className={`w-[2px] rounded-full ${isDark ? 'bg-[#FCF6BA]' : 'bg-[#9E7A32]'}`} />
                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4, ease: "easeInOut" }} className={`w-[2px] rounded-full ${isDark ? 'bg-[#FCF6BA]' : 'bg-[#9E7A32]'}`} />
                    </>
                ) : ( 
                    <span className={`text-xs ml-[2px] drop-shadow-md ${isDark ? 'text-[#FCF6BA]' : 'text-[#9E7A32]'}`}>▶</span> 
                )}
            </div>
        </button>
    </div>
);

export const Divider = ({ text, isDark }) => {
    const styles = getStyles(isDark);
    return (
        <motion.div initial={{opacity: 0, scale: 0.95}} whileInView={{opacity: 1, scale: 1}} viewport={{once:true}} transition={{duration: 1.5, ease: "easeOut"}} className="py-20 flex flex-col items-center justify-center relative z-20">
            <div className="flex items-center gap-6 w-full justify-center px-4">
                <motion.div initial={{scaleX: 0}} whileInView={{scaleX: 1}} viewport={{once:true}} transition={{duration: 1.5, ease: "easeInOut"}} className={`h-[1px] w-full max-w-[150px] bg-gradient-to-r ${styles.dividerLine} origin-right rounded-full`}></motion.div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isDark ? 'text-[#C5A059]' : 'text-[#9E7A32]'} opacity-80`}>
                        <path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" fill="currentColor"/>
                    </svg>
                </motion.div>
                <motion.div initial={{scaleX: 0}} whileInView={{scaleX: 1}} viewport={{once:true}} transition={{duration: 1.5, ease: "easeInOut"}} className={`h-[1px] w-full max-w-[150px] bg-gradient-to-l ${styles.dividerLine} origin-left rounded-full`}></motion.div>
            </div>
            {text && (
                <motion.p initial={{y:10, opacity:0}} whileInView={{y:0, opacity:1}} viewport={{once:true}} transition={{delay: 0.4, duration: 1, ease: "easeOut"}} className={`${styles.textSecondary} text-[10px] md:text-xs uppercase tracking-[0.5em] mt-8 font-serif font-black text-center px-4 drop-shadow-sm`}>
                    {text}
                </motion.p>
            )}
        </motion.div>
    );
};

export const ElegantDivider = ({ isDark }) => (
    <div className="w-full flex items-center justify-center py-20 px-6 opacity-70 z-20 relative">
        <div className="flex-grow h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent max-w-[200px]"></div>
        <div className="mx-8 flex gap-3 items-center">
            <div className={`w-1.5 h-1.5 rotate-45 ${isDark ? 'bg-[#C5A059]' : 'bg-[#9E7A32]'}`}></div>
            <div className={`w-2 h-2 rotate-45 ${isDark ? 'bg-[#FCF6BA]' : 'bg-[#D4AF37]'} shadow-[0_0_8px_rgba(252,246,186,0.6)]`}></div>
            <div className={`w-1.5 h-1.5 rotate-45 ${isDark ? 'bg-[#C5A059]' : 'bg-[#9E7A32]'}`}></div>
        </div>
        <div className="flex-grow h-[1px] bg-gradient-to-l from-transparent via-[#C5A059] to-transparent max-w-[200px]"></div>
    </div>
);

const CalendarCard = ({ isDark = false, targetDate }) => {
  const styles = getStyles(isDark);
  const eventDate = new Date(targetDate || new Date());
  const year = eventDate.getFullYear();
  const monthIndex = eventDate.getMonth();
  const weddingDay = eventDate.getDate();

  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const monthName = monthNames[monthIndex];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();

  const calendarGrid = [...Array.from({ length: firstDayOfMonth }, () => null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const diff = +new Date(targetDate) - +new Date();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const gold = isDark ? "#C5A059" : "#9E7A32";

  return (
    <div className={`w-full max-w-[360px] mx-auto rounded-[1.25rem] p-5 md:p-6 shadow-2xl relative transition-colors duration-500 ${styles.innerCard}`} style={{ overflow: "hidden" }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none z-0" style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start", paddingRight: 0, paddingTop: 24 }}>
        <div style={{ width: 160, height: 160, borderRadius: "50%", clipPath: "circle(50% at 50% 50%)", overflow: "hidden", transform: "translateX(18%)", filter: "blur(18px)", opacity: isDark ? 0.32 : 0.22, background: `radial-gradient(circle at 30% 30%, ${gold}, rgba(255,255,255,0))`, mixBlendMode: isDark ? "screen" : "normal" }} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col items-center mb-4">
          <span className={`text-3xl md:text-4xl font-serif italic font-light tracking-wide ${styles.textPrimary}`}>{monthName}</span>
          <span className={`text-[10px] tracking-[0.3em] font-bold uppercase mt-1 opacity-70 ${styles.textPrimary}`}>{year}</span>
          <span className="mt-3 text-sm md:text-base font-serif font-semibold" style={{ color: gold, textShadow: "0 1px 6px rgba(0,0,0,0.18)", letterSpacing: "0.02em" }}>Reserva la fecha</span>
        </div>

        <div className="grid grid-cols-7 mb-2 text-center" translate="no" aria-hidden>
          {['D','L','M','M','J','V','S'].map((d, i) => (
            <span key={i} className={`text-[9px] tracking-widest uppercase opacity-60 ${styles.textPrimary}`}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-5">
          {calendarGrid.map((day, i) => {
            const isWeddingDay = day === weddingDay;
            const dayColor = isWeddingDay ? gold : (isDark ? "#FFFFFF" : "#111827");
            return (
              <div key={i} className="aspect-square flex items-center justify-center relative">
                {day && (
                  <>
                    {isWeddingDay && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div className="w-[78%] h-[78%] rounded-full" style={{ border: `2px solid ${gold}`, boxShadow: `0 6px 18px ${isDark ? "rgba(197,160,89,0.12)" : "rgba(158,122,50,0.12)"}`, background: isDark ? "rgba(197,160,89,0.04)" : "rgba(158,122,50,0.03)", zIndex: 0 }} animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 2.2 }} aria-hidden />
                      </div>
                    )}
                    <span className={`text-[12px] md:text-[14px] ${isWeddingDay ? "font-bold" : "font-light"}`} style={{ color: dayColor, zIndex: 20 }}>{day}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className={`border-t pt-4 flex justify-between px-2 ${isDark ? 'border-white/10' : 'border-black/5'}`}>
          {Object.entries({ Días: timeLeft.days, Hrs: timeLeft.hours, Min: timeLeft.minutes, Seg: timeLeft.seconds }).map(([label, value]) => (
            <div key={label} className="flex flex-col items-center">
              <span className={`text-xl md:text-2xl font-serif font-light ${styles.textPrimary}`}>{value.toString().padStart(2, '0')}</span>
              <span className={`text-[8px] uppercase tracking-[0.1em] font-bold opacity-60 ${styles.textPrimary}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PhotoGallery = ({ isDark }) => {
    const [selectedId, setSelectedId] = useState(null);
    const carouselRef = useRef();
    const photos = ["/photos/galeria1.jpg", "/photos/galeria2.jpg", "/photos/galeria3.jpg", "/photos/galeria4.jpg"];
    const overlayStyle = isDark ? "bg-black/95 backdrop-blur-[40px]" : "bg-[#F9F7F2]/95 backdrop-blur-[40px]"; 

    return (
        <div className="w-full overflow-hidden py-8 relative">
            <motion.div initial={{opacity:0}} whileInView={{opacity:1}} transition={{duration: 1.5}} className="flex items-center justify-center gap-4 mb-10 opacity-60">
                <div className={`w-8 h-[1px] ${isDark ? 'bg-[#C5A059]' : 'bg-[#9E7A32]'}`}></div>
                <p className={`text-[9px] tracking-[0.4em] uppercase font-bold ${isDark ? 'text-[#C5A059]' : 'text-[#9E7A32]'}`}>Desliza</p>
                <div className={`w-8 h-[1px] ${isDark ? 'bg-[#C5A059]' : 'bg-[#9E7A32]'}`}></div>
            </motion.div>
            
            <motion.div ref={carouselRef} className="cursor-grab active:cursor-grabbing overflow-hidden flex px-6 md:px-12 py-12 -my-12">
                <motion.div drag="x" dragConstraints={carouselRef} className="flex gap-8 md:gap-14">
                    {photos.map((src, i) => (
                        <motion.div 
                            layoutId={`card-container-${i}`} key={i} onClick={() => setSelectedId(i)}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }} initial={{ opacity: 0, scale: 0.95, y: 40 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ y: -15, scale: 1.02, rotateZ: i % 2 === 0 ? 1 : -1, zIndex: 10 }}
                            className={`min-w-[280px] md:min-w-[340px] h-[400px] md:h-[480px] rounded-[2rem] overflow-hidden relative cursor-pointer group shadow-[0_20px_50px_rgba(0,0,0,0.4)] ${isDark ? 'border border-white/10 bg-[#111]' : 'border border-black/5 bg-[#FFF]'} p-2`}
                        >
                            <div className="w-full h-full relative overflow-hidden rounded-[1.5rem]">
                                <motion.img layoutId={`card-img-${i}`} src={src} alt="Momentos" className="w-full h-full object-cover transform transition-transform duration-[1.5s] ease-out group-hover:scale-110 pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                                <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white border border-white/30 px-8 py-3 rounded-full backdrop-blur-md bg-black/40 shadow-xl">Ampliar</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
            
            <AnimatePresence>
                {selectedId !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} className={`fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 ${overlayStyle}`} onClick={() => setSelectedId(null)}>
                        <motion.div layoutId={`card-container-${selectedId}`} transition={{ type: "spring", stiffness: 150, damping: 25, mass: 0.8 }} className={`relative max-w-[95vw] max-h-[90vh] rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] p-2 ${isDark ? 'bg-[#111] border border-white/10' : 'bg-[#FFF] border border-black/10'}`} onClick={(e) => e.stopPropagation()}>
                            <motion.button initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ delay: 0.3 }} onClick={() => setSelectedId(null)} className="absolute top-6 right-6 z-50 text-white bg-black/40 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/20 shadow-xl">✕</motion.button>
                            <motion.img layoutId={`card-img-${selectedId}`} src={photos[selectedId]} alt="" className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-[1.5rem]" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SongRequest = ({ isDark, slug }) => {
    const styles = getStyles(isDark);
    const [song, setSong] = useState("");
    const [status, setStatus] = useState("idle");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!song.trim()) return;
        try {
            setStatus("sending");
            const response = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: song, type: 'song', author: 'Invitado Web', slug: slug }),
            });
            if (response.ok) { setStatus("success"); setSong(""); setTimeout(() => setStatus("idle"), 5000); } 
            else setStatus("idle");
        } catch (error) { setStatus("idle"); }
    };
    
    return (
        <section className={`py-24 px-6 relative overflow-hidden ${isDark ? 'border-y border-white/5' : 'border-y border-black/5'}`}>
            <div className={`absolute inset-0 opacity-20 ${isDark ? BLACK_TEXTURE : PAPER_TEXTURE}`}></div>
            <motion.div variants={containerStagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`relative z-10 max-w-lg mx-auto text-center p-10 md:p-14 rounded-[3rem] ${styles.glassBox}`}>
                <motion.div variants={fadeInUp} className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#C5A059] to-[#7A5A1B] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(197,160,89,0.4)]"><span className="text-4xl text-black">🎵</span></motion.div>
                <motion.h3 variants={fadeInUp} className={`font-serif text-3xl md:text-4xl mb-4 ${styles.goldGradient}`}>Petición Musical</motion.h3>
                <motion.p variants={fadeInUp} className={`text-sm md:text-base mb-8 italic font-serif leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>"¿Qué canción no puede faltar para que corras a la pista de baile?"</motion.p>
                <AnimatePresence mode="wait">
                    {status === "success" ? (
                        <motion.div key="success" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className={`flex flex-col items-center gap-4 p-8 border rounded-[2rem] ${isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-600/20'} shadow-lg`}>
                            <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-3xl border border-green-500/30">✓</div>
                            <p className={`text-xs uppercase tracking-widest font-black ${isDark ? 'text-green-300' : 'text-green-800'}`}>¡Anotada en la lista!</p>
                            <button onClick={() => setStatus("idle")} className={`text-[10px] uppercase font-bold tracking-[0.2em] underline mt-2 ${styles.textSecondary} hover:text-[#FCF6BA] transition-colors`}>Pedir otra canción</button>
                        </motion.div>
                    ) : (
                        <motion.form key="form" variants={fadeInUp} onSubmit={handleSubmit} className="flex flex-col gap-5" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <input type="text" value={song} onChange={(e) => setSong(e.target.value)} placeholder="Escribe la Canción y el Artista..." className={`w-full rounded-[1.5rem] px-6 py-5 text-base outline-none font-serif transition-all border focus:ring-1 focus:ring-[#C5A059] ${isDark ? 'bg-black/40 text-white border-white/10 placeholder:text-gray-600' : 'bg-white/60 text-black border-black/10 placeholder:text-gray-400'} shadow-inner`} />
                            <button disabled={status === "sending"} type="submit" className="w-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#AA7C11] text-black py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_15px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_20px_40px_rgba(212,175,55,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0">{status === "sending" ? "Enviando..." : "Enviar Petición"}</button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </section>
    );
};

const GuestBookSlider = ({ isDark, messages = [], playing, setPlaying }) => {
    const styles = getStyles(isDark);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [wasMusicPlaying, setWasMusicPlaying] = useState(false);
    
    const audioRef = useRef(null);
    useEffect(() => { audioRef.current = new Audio(PAPER_SOUND_URL); }, []);
    
    const playSound = () => { if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(e => {}); } };
    const handleOpenCard = (msg, uniqueId) => { playSound(); setWasMusicPlaying(playing); if (playing) setPlaying(false); setSelectedMsg({ ...msg, uniqueId }); };
    const handleCloseCard = () => { setSelectedMsg(null); if (wasMusicPlaying) setPlaying(true); };

    const displayMessages = messages.length > 0 ? messages : [
        { message: "El libro aún está en blanco. ¡Sé el primero en escribir tus buenos deseos para nosotros!", author: "Esperando tu mensaje..." },
        { message: "Aquí aparecerán las palabras de cariño de nuestros invitados. ¡Escríbenos!", author: "Los Novios" },
        { message: "Que la vida los llene de amor infinito. ¡Felicidades adelantadas!", author: "Familia" }
    ];
    const marqueeMessages = [...displayMessages, ...displayMessages, ...displayMessages];

    return (
        <section className={`py-20 relative overflow-hidden border-t ${isDark ? 'border-white/5 bg-gradient-to-b from-transparent to-black/50' : 'border-black/5 bg-gradient-to-b from-transparent to-[#F2EFE9]'}`}>
            <div className="relative z-10 max-w-full mx-auto text-center mb-14 px-6">
                <motion.h3 initial={{y: 20, opacity:0}} whileInView={{y:0, opacity:1}} viewport={{once:true}} className={`font-serif text-4xl md:text-5xl mb-4 ${styles.goldGradient}`}>Libro de Firmas</motion.h3>
                <motion.p initial={{y: 20, opacity:0}} whileInView={{y:0, opacity:1}} viewport={{once:true}} transition={{delay: 0.2}} className={`text-[10px] uppercase tracking-[0.4em] font-bold ${styles.textSecondary}`}>Toca una nota para leerla</motion.p>
            </div>
            <div className="relative w-full overflow-hidden flex py-12 -my-12">
                <div className={`absolute left-0 top-0 bottom-0 w-32 z-20 bg-gradient-to-r ${isDark ? 'from-[#050505] to-transparent' : 'from-[#F9F7F2] to-transparent'} pointer-events-none`}></div>
                <div className={`absolute right-0 top-0 bottom-0 w-32 z-20 bg-gradient-to-l ${isDark ? 'from-[#050505] to-transparent' : 'from-[#F9F7F2] to-transparent'} pointer-events-none`}></div>
                <motion.div className="flex gap-10 pl-10 items-center" animate={{ x: "-50%" }} initial={{ x: 0 }} transition={{ ease: "linear", duration: 45, repeat: Infinity }} style={{ width: "max-content" }}>
                    {marqueeMessages.map((msg, i) => {
                        const uniqueId = `msg-${i}-${Math.random()}`;
                        const rotation = i % 2 === 0 ? 4 : -4; 
                        return (
                            <motion.div key={uniqueId} layoutId={uniqueId} onClick={() => handleOpenCard(msg, uniqueId)} whileHover={{ scale: 1.05, rotate: 0, y: -15, zIndex: 30 }} initial={{ rotate: rotation }} className={`shrink-0 w-[320px] h-[240px] p-8 rounded-[2rem] flex flex-col justify-between text-left relative cursor-pointer shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-all duration-300 ${styles.glassBox}`}>
                                <span className={`text-7xl absolute -top-2 left-6 opacity-10 font-serif ${styles.textSecondary}`}>“</span>
                                <div className="relative z-10 overflow-hidden mt-6"><p className={`font-serif italic text-base leading-relaxed mb-2 line-clamp-4 ${styles.textPrimary}`}>"{msg.message || msg.mensaje}"</p></div>
                                <div className="border-t pt-4 border-[#C5A059]/20 relative z-10 flex items-center justify-between mt-4">
                                    <p className={`text-[10px] uppercase tracking-widest font-black ${styles.textSecondary}`}>— {msg.author || msg.nombre}</p>
                                    <span className="opacity-40 text-sm">🖋️</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
            <AnimatePresence>
                {selectedMsg && (
                    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 ${isDark ? 'bg-black/90' : 'bg-[#F9F7F2]/90'} backdrop-blur-[30px]`} onClick={handleCloseCard}>
                        <motion.div layoutId={selectedMsg.uniqueId} transition={{ type: "spring", stiffness: 120, damping: 20 }} className={`w-full max-w-2xl p-14 md:p-20 rounded-[3rem] shadow-[0_0_100px_rgba(197,160,89,0.2)] relative flex flex-col justify-center items-center text-center ${styles.glassBox} bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]`} onClick={(e) => e.stopPropagation()}>
                            <button onClick={handleCloseCard} className={`absolute top-6 right-6 md:top-8 md:right-8 text-xl w-12 h-12 flex items-center justify-center rounded-full border border-[#C5A059]/30 hover:bg-[#C5A059] hover:text-black transition-all duration-300 ${styles.textSecondary}`}>✕</button>
                            <motion.span initial={{ opacity: 0, y: -20 }} animate={{ opacity: 0.15, y: 0 }} transition={{ delay: 0.2 }} className={`text-9xl font-serif absolute top-4 left-10 ${styles.textSecondary}`}>“</motion.span>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative z-10 w-full"><p className={`font-serif italic text-2xl md:text-4xl leading-relaxed mb-12 text-balance ${styles.textPrimary}`}>"{selectedMsg.message || selectedMsg.mensaje}"</p></motion.div>
                            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 1, ease: "easeInOut" }} className={`h-[1px] w-40 bg-gradient-to-r ${styles.dividerLine} mb-8 rounded-full`} />
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center">
                                <p className={`text-xs md:text-sm uppercase tracking-[0.5em] font-black ${styles.textSecondary}`}>{selectedMsg.author || selectedMsg.nombre}</p>
                                <p className={`text-[9px] uppercase tracking-widest mt-3 opacity-50 ${styles.textPrimary} font-bold`}>Invitado Especial</p>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

const LandingPage = ({ onStart, onAdminLogin }) => {
    const { slug } = useParams();
    const [weddingData, setWeddingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0); 
    const [playing, setPlaying] = useSmartAudio(MUSIC_URL);
    const [realMessages, setRealMessages] = useState([]);
    
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('weddingTheme');
            return saved !== null ? JSON.parse(saved) : false;
        }
        return false;
    });

    useEffect(() => { localStorage.setItem('weddingTheme', JSON.stringify(isDark)); }, [isDark]);

    useEffect(() => {
        const fetchWeddingData = async () => {
            try {
                setTimeout(() => {
                    const partesSlug = slug ? slug.split('-') : ["Novio", "y", "Novia", "2026"];
                    const novio = partesSlug[0] ? partesSlug[0].charAt(0).toUpperCase() + partesSlug[0].slice(1) : "Novio";
                    const novia = partesSlug[2] ? partesSlug[2].charAt(0).toUpperCase() + partesSlug[2].slice(1) : "Novia";

                    setWeddingData({
                        novio: novio,
                        novia: novia,
                        iniciales: `${novio.charAt(0)}&${novia.charAt(0)}`,
                        fecha: "2026-07-18T19:00:00-06:00",
                        fechaHero: "18 de Julio, 2026",
                        fechaCorta: "18 . 07 . 2026",
                        lugar: "Campeche, México",
                        mensajePrincipal: "Te elijo a ti para caminar juntos por la vida, para reír hasta que nos duela el estómago y para sostenernos cuando el mundo tiemble.",
                        padresNovio: ["Sr. Josué Manuel Pérez Cheng", "Sra. Nubia del Sugey Ponce"],
                        padresNovia: ["Sr. José Ruben Canales Cruz", "Sra. María del Carmen Mendoza Rodríguez"]
                    });
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Error loading wedding:", error);
                setLoading(false);
            }
        };

        const fetchMessages = async () => {
            try {
                const response = await fetch(`${API_URL}/families/messages?slug=${slug}`); 
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) setRealMessages(data);
                }
            } catch (error) { console.error("Error messages:", error); }
        };

        fetchWeddingData();
        fetchMessages(); 
    }, [slug]);

    const { scrollYProgress } = useScroll();
    const scaleBar = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    const yHero = useTransform(scrollYProgress, [0, 1], [0, -250]); 
    const styles = getStyles(isDark);

    const handleOpen = () => {
        if (step > 0) return;
        setStep(1); 
        setPlaying(true); 
        setTimeout(() => setStep(2), 2800); 
    };

    if (loading || !weddingData) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#050505]' : 'bg-[#F9F7F2]'}`}>
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className={`text-xl font-serif tracking-[0.4em] uppercase ${styles.textSecondary}`}>
                    Preparando Invitación...
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-serif overflow-x-hidden relative selection:bg-[#C5A059] selection:text-black transition-colors duration-[1500ms] ${styles.bg}`}>
            
            <div className={`fixed inset-0 z-0 opacity-[0.15] pointer-events-none ${isDark ? BLACK_TEXTURE : PAPER_TEXTURE}`}></div>
            {step === 2 && <GoldenParticles isDark={isDark} />} 

            {step === 2 && (
                <>
                    <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#AA7C11] via-[#FFF3CC] to-[#AA7C11] origin-left z-[100] shadow-[0_0_20px_#C5A059]" style={{ scaleX: scaleBar }} />
                    <FloatingControls playing={playing} toggleAudio={setPlaying} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
                </>
            )}

            <AnimatePresence mode="wait">
                {step < 2 && (
                    <motion.div key="envelope-scene" exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }} className={`fixed inset-0 z-[999] flex items-center justify-center p-6 perspective-[2000px] transition-colors duration-700 ${styles.bg}`}>
                        <motion.div onClick={handleOpen} animate={step === 1 ? { rotateX: 25, y: "15%", scale: 0.9 } : { rotateX: 0, y: 0, scale: 1 }} transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }} className="relative w-[90vw] max-w-[340px] h-[240px] md:max-w-none md:w-[500px] md:h-[350px] cursor-pointer preserve-3d group shadow-2xl mx-auto" style={{ transformStyle: 'preserve-3d' }}>
                            <div className={`absolute inset-0 rounded-sm border ${styles.envelopeBase}`}></div>
                            
                            <motion.div animate={step === 1 ? { y: "-85%" } : { y: 0 }} transition={{ duration: 2.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.8 }} className="absolute inset-x-4 md:inset-x-6 bottom-0 h-[90%] bg-[#F4F1EA] shadow-[0_-5px_20px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center border border-[#BF953F]/20 z-10 rounded-sm overflow-hidden">
                                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
                                <div className="relative w-full h-full flex flex-col items-center justify-start pt-8 md:pt-16 p-4 text-center">
                                    <p className="text-[#8C6218] text-[9px] md:text-[11px] tracking-[0.4em] uppercase mb-4 md:mb-8 font-bold">Save the Date</p>
                                    
                                    <div className="flex flex-col items-center gap-2 md:gap-4 mb-6 md:mb-10">
                                        <span className="text-4xl md:text-6xl text-[#1a1a1a] font-bold font-serif leading-none tracking-tighter">{weddingData.novio}</span>
                                        <span className="text-2xl md:text-4xl text-[#BF953F] font-serif italic">&</span>
                                        <span className="text-4xl md:text-6xl text-[#1a1a1a] font-bold font-serif leading-none tracking-tighter">{weddingData.novia}</span>
                                    </div>
                                    
                                    <div className="w-12 h-[1px] bg-[#BF953F] mb-4 opacity-50"></div>
                                    <p className="text-[#1a1a1a] text-[10px] md:text-[12px] font-bold tracking-[0.3em] uppercase">{weddingData.fechaCorta}</p>
                                </div>
                            </motion.div>

                            <div className="absolute inset-0 z-20 pointer-events-none">
                                <div className={`absolute inset-0 bg-gradient-to-t z-20 ${isDark ? 'from-black/60' : 'from-[#B8860B]/20'} via-transparent to-transparent`}></div>
                                <div className={`absolute top-0 bottom-0 left-0 w-full h-full border-l ${styles.envelopeFlapSide}`} style={{ clipPath: 'polygon(0 0, 50% 50%, 0 100%)' }}></div>
                                <div className={`absolute top-0 bottom-0 right-0 w-full h-full border-r ${styles.envelopeFlapSide}`} style={{ clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)' }}></div>
                                <div className={`absolute bottom-0 left-0 w-full h-full border-b ${styles.envelopeFlapBottom} ${styles.envelopeShadow}`} style={{ clipPath: 'polygon(0 100%, 50% 50%, 100% 100%)' }}></div>
                            </div>

                            <motion.div animate={step === 1 ? { rotateX: 180, opacity: 0 } : { rotateX: 0, opacity: 1 }} transition={{ rotateX: { duration: 1.5, ease: "easeInOut" }, opacity: { duration: 0.8, delay: 1.0, ease: "easeOut" } }} className={`absolute top-0 left-0 w-full h-full z-30 origin-top border-t ${styles.envelopeFlapTop}`} style={{ clipPath: 'polygon(0 0, 50% 50%, 100% 0)', backfaceVisibility: 'visible' }}></motion.div>

                            <motion.div initial={{ x: "-50%", y: "-50%" }} animate={step === 1 ? { opacity: 0, scale: 1.5, x: "-50%", y: "-50%" } : { opacity: 1, scale: 1, x: "-50%", y: "-50%" }} transition={{ duration: 0.8 }} className="absolute top-1/2 left-1/2 z-40 cursor-pointer">
                                <motion.div animate={{ boxShadow: ["0 0 0 0 rgba(191,149,63,0)", "0 0 0 10px rgba(191,149,63,0.2)", "0 0 0 0 rgba(191,149,63,0)"] }} transition={{ repeat: Infinity, duration: 2 }} className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-[#800] to-[#500] rounded-full flex items-center justify-center border-[3px] border-[#600]/60 shadow-2xl hover:scale-105 transition-transform duration-300">
                                    <div className="w-[85%] h-[85%] border border-[#900] rounded-full flex items-center justify-center opacity-80 bg-[#700]">
                                        <span className="text-[#D4AF37] font-serif font-bold italic text-xs md:text-lg drop-shadow-md">{weddingData.iniciales}</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {step === 2 && (
                <motion.main initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} className={`relative z-10 w-full max-w-[700px] mx-auto shadow-[0_0_200px_rgba(197,160,89,0.15)] min-h-screen transition-colors duration-1000 ${isDark ? 'bg-[#0a0a0a] border-x border-white/5' : 'bg-[#F9F7F2] border-x border-black/5'}`}>
                    <header className="relative h-screen flex flex-col items-center justify-center text-center px-6 z-30 overflow-hidden">
                        <motion.div style={{ y: yHero }} variants={containerStagger} initial="hidden" animate="visible" className="relative z-20 flex flex-col items-center w-full">
                            <motion.div variants={fadeInUp}>
                                <div className="flex items-center gap-6 mb-12 opacity-90">
                                    <div className={`h-[1px] w-16 rounded-full ${isDark ? 'bg-[#C5A059]' : 'bg-[#9E7A32]'}`}></div>
                                    <p className={`text-[10px] md:text-xs tracking-[0.6em] uppercase font-black ${styles.textSecondary} drop-shadow-sm`}>Nuestra Boda</p>
                                    <div className={`h-[1px] w-16 rounded-full ${isDark ? 'bg-[#C5A059]' : 'bg-[#9E7A32]'}`}></div>
                                </div>
                            </motion.div>
                            <motion.h1 variants={containerStagger} className="flex flex-col items-center justify-center w-full relative z-20">
                                <motion.span variants={fadeInUp} animate={{ y: [-4, 4, -4] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className={`text-8xl md:text-[10rem] font-serif tracking-tighter leading-none pb-2 drop-shadow-2xl ${styles.textPrimary}`}>
                                    {weddingData.novio}
                                </motion.span>
                                <motion.span variants={fadeInUp} className={`text-6xl md:text-8xl italic font-serif p-12 -my-8 md:-my-12 leading-relaxed opacity-90 ${styles.goldGradient}`}>&</motion.span>
                                <motion.span variants={fadeInUp} animate={{ y: [4, -4, 4] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className={`text-8xl md:text-[10rem] font-serif tracking-tighter leading-none pt-2 drop-shadow-2xl ${styles.textPrimary}`}>
                                    {weddingData.novia}
                                </motion.span>
                            </motion.h1>
                            <motion.div variants={fadeInUp} className="mt-20 flex flex-col items-center">
                                <div className={`w-[1px] h-20 mb-8 rounded-full bg-gradient-to-b ${isDark ? 'from-[#C5A059] to-transparent' : 'from-[#9E7A32] to-transparent'}`}></div>
                                <p className={`${isDark ? 'text-[#FCF6BA]' : 'text-[#333]'} text-2xl md:text-4xl font-serif italic mb-4 font-light tracking-widest drop-shadow-md`}>{weddingData.fechaHero}</p>
                                <p className={`${styles.textSecondary} text-[10px] md:text-xs uppercase tracking-[0.6em] font-bold`}>{weddingData.lugar}</p>
                            </motion.div>
                        </motion.div>
                        <motion.div animate={{ y: [0, 15, 0], opacity: [0.1, 0.6, 0.1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className={`absolute bottom-10 text-4xl font-light ${styles.textSecondary}`}>|</motion.div>
                    </header>

                    <section className={`px-10 py-32 text-center border-y relative overflow-hidden ${isDark ? 'bg-[#050505] border-white/5' : 'bg-[#EAE6DE] border-black/5'}`}>
                        <div className={`absolute inset-0 opacity-30 mix-blend-overlay ${isDark ? BLACK_TEXTURE : PAPER_TEXTURE}`}></div>
                        <motion.div variants={containerStagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <motion.span variants={fadeInUp} className={`text-[10rem] font-serif block mb-2 leading-none font-black drop-shadow-lg opacity-20 ${styles.textSecondary}`}>“</motion.span>
                            <motion.p variants={fadeInUp} className={`leading-loose text-2xl md:text-4xl italic mb-14 relative z-10 font-serif font-light max-w-2xl mx-auto drop-shadow-md ${isDark ? 'text-[#E0E0E0]' : 'text-[#444]'}`}>
                                "{weddingData.mensajePrincipal}"
                            </motion.p>
                            <motion.div variants={fadeInUp} className={`w-1 h-1 mx-auto rounded-full ${isDark ? 'bg-[#C5A059]' : 'bg-[#9E7A32]'} shadow-[0_0_10px_rgba(197,160,89,0.8)]`}></motion.div>
                        </motion.div>
                    </section>

                    <Divider text="Momentos Inolvidables" isDark={isDark} />
                    <PhotoGallery isDark={isDark} /> 
                    <Divider text="Con la Bendición" isDark={isDark} />

                    <section className="px-8 py-20 text-center">
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 font-serif mb-12 ${styles.textPrimary}`}>
                            <motion.div variants={containerStagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`p-12 rounded-[2.5rem] shadow-2xl hover:shadow-[0_20px_60px_rgba(197,160,89,0.2)] transition-all duration-500 group ${styles.glassBox}`}>
                                <motion.div variants={fadeInUp} className="w-16 h-16 mx-auto mb-8 rounded-full border border-white/10 flex items-center justify-center bg-[#C5A059]/10 shadow-inner group-hover:scale-110 transition-transform duration-500"><span className="text-2xl">🕊️</span></motion.div>
                                <motion.p variants={fadeInUp} className={`${styles.textSecondary} mb-8 uppercase text-[10px] tracking-[0.4em] font-black`}>Padres de {weddingData.novio}</motion.p>
                                <motion.p variants={fadeInUp} className="text-xl md:text-2xl font-light">{weddingData.padresNovio[0]}</motion.p>
                                <motion.p variants={fadeInUp} className={`text-3xl italic opacity-50 my-4 font-light ${styles.textSecondary}`}>&</motion.p>
                                <motion.p variants={fadeInUp} className="text-xl md:text-2xl font-light">{weddingData.padresNovio[1]}</motion.p>
                            </motion.div>
                            <motion.div variants={containerStagger} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{delay: 0.2}} className={`p-12 rounded-[2.5rem] shadow-2xl hover:shadow-[0_20px_60px_rgba(197,160,89,0.2)] transition-all duration-500 group ${styles.glassBox}`}>
                                <motion.div variants={fadeInUp} className="w-16 h-16 mx-auto mb-8 rounded-full border border-white/10 flex items-center justify-center bg-[#C5A059]/10 shadow-inner group-hover:scale-110 transition-transform duration-500"><span className="text-2xl">🕊️</span></motion.div>
                                <motion.p variants={fadeInUp} className={`${styles.textSecondary} mb-8 uppercase text-[10px] tracking-[0.4em] font-black`}>Padres de {weddingData.novia}</motion.p>
                                <motion.p variants={fadeInUp} className="text-xl md:text-2xl font-light">{weddingData.padresNovia[0]}</motion.p>
                                <motion.p variants={fadeInUp} className={`text-3xl italic opacity-50 my-4 font-light ${styles.textSecondary}`}>&</motion.p>
                                <motion.p variants={fadeInUp} className="text-xl md:text-2xl font-light">{weddingData.padresNovia[1]}</motion.p>
                            </motion.div>
                        </div>
                    </section>

                    <ElegantDivider isDark={isDark} />

                    <section className="relative group py-24 mt-12">
                        <div className="relative h-[600px] w-[calc(100%-2rem)] mx-4 overflow-hidden rounded-[3rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] md:h-[800px] md:w-[calc(100%-4rem)] md:mx-8">
                            <motion.img initial={{ scale: 1.15, y: -50 }} whileInView={{ scale: 1, y: 0 }} transition={{ duration: 20, ease: "linear" }} src="/photos/hero.jpg" className="w-full h-full object-cover opacity-70 grayscale brightness-75" />
                            <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#0a0a0a] via-transparent to-[#0a0a0a]/30' : 'from-[#F9F7F2] via-transparent to-[#F9F7F2]/30'}`}></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center px-6 z-20">
                            <motion.div variants={containerStagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full max-w-md mx-auto">
                                <motion.p variants={fadeInUp} className={`text-center ${isDark ? 'text-[#FCF6BA]' : 'text-white'} text-[11px] md:text-[13px] uppercase tracking-[0.6em] mb-12 font-black drop-shadow-2xl`}>Reserva la Fecha</motion.p>
                                
                                <CalendarCard isDark={isDark} targetDate={weddingData.fecha} />
                                
                                <motion.button variants={fadeInUp} onClick={() => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Boda+${weddingData.novio}+%26+${weddingData.novia}&dates=${weddingData.fecha.replace(/[-:]/g, '').split('T')[0]}T190000Z/${weddingData.fecha.replace(/[-:]/g, '').split('T')[0]}T230000Z&location=${weddingData.lugar}`, '_blank')} className="w-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#AA7C11] text-[#0a0a0a] py-6 rounded-full text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_15px_40px_rgba(197,160,89,0.4)] hover:shadow-[0_20px_50px_rgba(197,160,89,0.6)] hover:-translate-y-2 transition-all duration-500 mt-12 relative overflow-hidden group border border-white/50">
                                    <span className="relative z-10 flex justify-center items-center gap-4">Agendar en Calendario <span className="text-lg">📅</span></span>
                                    <div className="absolute inset-0 h-full w-0 bg-white/40 transition-all duration-700 group-hover:w-full"></div>
                                </motion.button>
                            </motion.div>
                        </div>
                    </section>

                    <section className="py-32 px-6 md:px-12 relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-[0.015]"><span className="text-[600px] font-serif">🕒</span></div>
                        <motion.div variants={containerStagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-5xl mx-auto relative z-10">
                            <div className="text-center mb-28">
                                <motion.div variants={fadeInUp} className="w-[1px] h-16 mx-auto bg-gradient-to-b from-transparent to-[#C5A059] mb-8 rounded-full"></motion.div>
                                <motion.p variants={fadeInUp} className={`text-[10px] tracking-[0.6em] uppercase font-black mb-4 opacity-70 ${styles.textSecondary}`}>Nuestro Día</motion.p>
                                <motion.h3 variants={fadeInUp} className={`text-5xl md:text-7xl font-serif font-light tracking-tight ${styles.goldGradient}`}>Itinerario</motion.h3>
                            </div>
                            <div className="relative">
                                <motion.div initial={{ height: 0 }} whileInView={{ height: '100%' }} viewport={{ once: true }} transition={{ duration: 3, ease: "easeInOut" }} className={`absolute left-8 md:left-[50%] md:-ml-[1px] top-0 bottom-0 w-[2px] rounded-full bg-gradient-to-b ${isDark ? 'from-transparent via-[#C5A059]/50 to-transparent' : 'from-transparent via-[#9E7A32]/40 to-transparent'}`}></motion.div>
                                <div className="space-y-16 md:space-y-32">
                                    {[
                                        { t: '19:00 HRS', subtitle: 'MOMENTO 1', title: 'Recepción', icon: '🥂', desc: 'Llegada al majestuoso lobby del salón.' },
                                        { t: '20:00 HRS', subtitle: 'MOMENTO 2', title: 'Ceremonia', icon: '💍', desc: 'Acompáñanos a dar el sí más importante.' },
                                        { t: '21:00 HRS', subtitle: 'MOMENTO 3', title: 'Banquete', icon: '🍽️', desc: 'Cena de gala, brindis y celebración.' },
                                        { t: '23:00 HRS', subtitle: 'MOMENTO 4', title: 'Baile', icon: '✨', desc: 'La pista se abre para festejar toda la noche.' }
                                    ].map((item, i) => {
                                        const isEven = i % 2 === 0;
                                        return (
                                            <motion.div key={i} variants={fadeInUp} className={`relative flex flex-col md:flex-row items-center justify-between group ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                                <div className="hidden md:block md:w-[45%]"></div>
                                                <div className="absolute left-8 md:left-[50%] -translate-x-1/2 flex items-center justify-center z-20">
                                                    <motion.div whileHover={{ scale: 1.15, rotate: 5, boxShadow: "0 0 30px rgba(197,160,89,0.5)" }} className={`w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/20 flex items-center justify-center text-2xl md:text-3xl backdrop-blur-xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-500 ${isDark ? 'bg-[#111]' : 'bg-[#FFF]'}`}>{item.icon}</motion.div>
                                                </div>
                                                <div className={`w-full pl-24 md:pl-0 md:w-[45%] flex ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                                                    <div className={`w-full p-8 md:p-12 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(197,160,89,0.15)] relative overflow-hidden ${styles.glassBox}`}>
                                                        <div className="relative z-10">
                                                            <div className="flex items-center gap-4 mb-6"><div className={`inline-block px-5 py-2 rounded-full text-[9px] md:text-[10px] uppercase font-black tracking-[0.4em] border ${isDark ? 'bg-[#C5A059]/10 border-[#C5A059]/40 text-[#FCF6BA]' : 'bg-[#9E7A32]/5 border-[#9E7A32]/40 text-[#7a5806]'}`}>{item.t}</div></div>
                                                            <p className={`text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold mb-3 ${styles.textSecondary}`}>{item.subtitle}</p>
                                                            <h4 className={`text-3xl md:text-4xl font-serif mb-4 font-light ${styles.textPrimary} drop-shadow-sm`}>{item.title}</h4>
                                                            <p className={`text-sm italic leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </section>

                    <SongRequest isDark={isDark} slug={slug} />

                    <section className={`px-8 py-28 text-center relative overflow-hidden`}>
                        <div className={`absolute inset-0 opacity-20 ${isDark ? BLACK_TEXTURE : PAPER_TEXTURE}`}></div>
                        <motion.div variants={containerStagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative z-10 max-w-4xl mx-auto">
                            <motion.div variants={fadeInUp} whileHover={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 1 }} className="text-6xl md:text-7xl mb-10 inline-block drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]">🎩</motion.div>
                            <motion.h3 variants={fadeInUp} className={`text-4xl md:text-5xl mb-6 font-serif tracking-tight ${styles.goldGradient}`}>Código de Vestimenta</motion.h3>
                            <motion.p variants={fadeInUp} className={`text-xs md:text-sm uppercase tracking-[0.6em] mb-16 font-black border-b-[1px] inline-block pb-4 ${isDark ? 'text-[#FCF6BA] border-[#C5A059]/40' : 'text-[#333] border-[#9E7A32]/40'}`}>Estricto Formal</motion.p>
                            <motion.div variants={fadeInUp} className={`w-full p-12 md:p-20 rounded-[3rem] md:rounded-[4rem] ${styles.glassBox}`}>
                                <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-32 text-center">
                                    <div className="flex flex-col items-center group">
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-8 shadow-inner ${isDark ? 'bg-black/40 border border-white/5' : 'bg-white/40 border border-black/5'} group-hover:scale-105 transition-transform duration-500`}>💃</div>
                                        <p className={`${styles.textSecondary} uppercase text-[10px] tracking-[0.4em] font-black mb-4`}>Mujeres</p>
                                        <p className={`${isDark ? 'text-gray-100' : 'text-gray-900'} text-2xl md:text-3xl font-serif font-light`}>Vestido Largo</p>
                                    </div>
                                    <div className={`hidden md:block w-[1px] h-40 rounded-full ${isDark ? 'bg-gradient-to-b from-transparent via-white/20 to-transparent' : 'bg-gradient-to-b from-transparent via-black/20 to-transparent'}`}></div>
                                    <div className="flex flex-col items-center group">
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-8 shadow-inner ${isDark ? 'bg-black/40 border border-white/5' : 'bg-white/40 border border-black/5'} group-hover:scale-105 transition-transform duration-500`}>🤵</div>
                                        <p className={`${styles.textSecondary} uppercase text-[10px] tracking-[0.4em] font-black mb-4`}>Hombres</p>
                                        <p className={`${isDark ? 'text-gray-100' : 'text-gray-900'} text-2xl md:text-3xl font-serif font-light`}>Traje o Smoking</p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.p variants={fadeInUp} className={`mt-14 text-sm md:text-base italic opacity-70 font-serif ${styles.textPrimary}`}>¡Queremos que luzcan espectaculares y brillen con nosotros!</motion.p>
                        </motion.div>
                    </section>

                    <GuestBookSlider isDark={isDark} messages={realMessages} playing={playing} setPlaying={setPlaying}/>

                    <footer className={`py-24 px-8 text-center relative overflow-hidden border-t ${isDark ? 'bg-[#050505] border-white/10' : 'bg-[#EAE6DE] border-black/5'}`}>
                        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                        <motion.div variants={containerStagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
                            <motion.div variants={fadeInUp} className="w-10 h-10 mb-10 border border-[#C5A059] rounded-full flex items-center justify-center text-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.2)]">⚜️</motion.div>
                            <motion.h3 variants={fadeInUp} className={`text-5xl md:text-6xl font-serif mb-8 tracking-tight drop-shadow-md ${styles.goldGradient}`}>¿Nos acompañas?</motion.h3>
                            <motion.p variants={fadeInUp} className={`text-lg md:text-xl italic mb-16 leading-relaxed opacity-80 font-serif font-light ${styles.textPrimary}`}>"Sería un honor contar con tu presencia y celebrar juntos este nuevo capítulo."</motion.p>
                            <motion.button variants={fadeInUp} whileHover={{ scale: 1.05, boxShadow: "0 25px 60px rgba(197,160,89,0.5)" }} whileTap={{ scale: 0.98 }} onClick={onStart} className="bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#AA7C11] text-[#0a0a0a] font-black py-6 px-16 rounded-full shadow-[0_15px_40px_rgba(197,160,89,0.4)] uppercase tracking-[0.3em] text-[10px] md:text-xs mb-24 relative overflow-hidden group border border-white/40">
                                <span className="relative z-10 flex items-center justify-center gap-4">Confirmar Asistencia <span className="text-xl">🕊️</span></span>
                                <div className="absolute inset-0 h-full w-0 bg-white/40 transition-all duration-700 group-hover:w-full"></div>
                            </motion.button>
                            <motion.div variants={fadeInUp} className="flex flex-col items-center gap-6 w-full">
                                <div className={`w-32 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent`}></div>
                                <button onClick={onAdminLogin} className={`text-[9px] uppercase tracking-[0.4em] font-bold transition-all duration-300 px-6 py-2 rounded-full border border-transparent ${isDark ? 'text-gray-500 hover:text-[#FCF6BA] hover:border-white/10 hover:bg-white/5' : 'text-gray-500 hover:text-[#9E7A32] hover:border-black/10 hover:bg-black/5'}`}>Acceso Wedding Planner</button>
                                <div className={`mt-8 text-[10px] uppercase tracking-[0.5em] font-black opacity-60 ${styles.textSecondary}`}>© 2026 {weddingData.novio} & {weddingData.novia}</div>
                                <div className={`mt-20 w-full pt-12 border-t flex flex-col md:flex-row items-center justify-between gap-8 ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                                    <div className="text-left flex flex-col items-center md:items-start">
                                        <p className={`text-[8px] uppercase tracking-[0.4em] font-bold opacity-50 mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Software & UI Design</p>
                                        <p className={`text-xs font-sans font-bold tracking-[0.3em] ${styles.textPrimary}`}>JOSUE PEREZ PONCE</p>
                                    </div>
                                    <a href="https://wa.me/525642050757?text=Hola,%20me%20gustó%20la%20invitación%20digital,%20quiero%20cotizar%20una." target="_blank" rel="noopener noreferrer" className={`px-8 py-4 rounded-full text-[9px] font-black uppercase tracking-[0.4em] transition-all duration-500 transform hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4 ${isDark ? 'bg-[#111] text-[#FCF6BA] border border-white/10 hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#AA7C11] hover:text-black hover:border-transparent' : 'bg-white text-[#9E7A32] border border-black/10 hover:bg-gradient-to-r hover:from-[#9E7A32] hover:to-[#7A5A1B] hover:text-white hover:border-transparent'}`}>
                                        <span className="text-base">📱</span> Contactar
                                    </a>
                                </div>
                            </motion.div>
                        </motion.div>
                    </footer>
                </motion.main>
            )}
        </div>
    );
};

export default LandingPage;