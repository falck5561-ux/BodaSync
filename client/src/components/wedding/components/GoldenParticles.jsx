import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const PARTICLE_COUNT = 40;

function createSeededValue(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;

  return value - Math.floor(value);
}

function createParticle(index) {
  const positionSeed = createSeededValue(index + 1);
  const durationSeed = createSeededValue(index + 51);
  const delaySeed = createSeededValue(index + 101);
  const scaleSeed = createSeededValue(index + 151);
  const driftSeed = createSeededValue(index + 201);
  const sizeSeed = createSeededValue(index + 251);

  return {
    id: `golden-particle-${index + 1}`,
    left: positionSeed * 100,
    duration: 15 + durationSeed * 20,
    delay: delaySeed * 15,
    scale: 0.4 + scaleSeed * 0.6,
    drift: driftSeed * 100 - 50,
    size: 2 + sizeSeed * 2
  };
}

function createParticles() {
  return Array.from(
    { length: PARTICLE_COUNT },
    (_, index) => createParticle(index)
  );
}

export function GoldenParticles({ isDark = false }) {
  const shouldReduceMotion = useReducedMotion();

  const particles = useMemo(() => createParticles(), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden"
    >
      {particles.map((particle) => {
        const particleColor = isDark
          ? 'bg-[#FCF6BA] shadow-[0_0_10px_#FCF6BA]'
          : 'bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]';

        if (shouldReduceMotion) {
          return (
            <div
              key={particle.id}
              className={`absolute rounded-full opacity-20 blur-[1px] ${particleColor}`}
              style={{
                left: `${particle.left}%`,
                top: `${(particle.left * 1.7) % 100}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                transform: `scale(${particle.scale})`
              }}
            />
          );
        }

        return (
          <motion.div
            key={particle.id}
            initial={{
              y: '110vh',
              x: 0,
              opacity: 0,
              scale: particle.scale
            }}
            animate={{
              y: '-10vh',
              x: [0, particle.drift, particle.drift * -0.35],
              opacity: [0, isDark ? 0.7 : 0.4, 0]
            }}
            transition={{
              y: {
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'linear'
              },
              x: {
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeInOut'
              },
              opacity: {
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            }}
            className={`absolute rounded-full blur-[1px] ${particleColor}`}
            style={{
              left: `${particle.left}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`
            }}
          />
        );
      })}
    </div>
  );
}

export default GoldenParticles;