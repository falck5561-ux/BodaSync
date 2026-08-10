export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT = [0.25, 0.1, 0.25, 1];

export const viewportOnce = {
  once: true,
  margin: '-50px'
};

export const containerStagger = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export const fadeInUp = {
  hidden: {
    y: 50,
    opacity: 0,
    filter: 'blur(5px)'
  },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 1.2,
      ease: EASE_OUT_EXPO
    }
  }
};

export const fadeIn = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: 'easeInOut'
    }
  }
};

export const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1,
      ease: EASE_OUT_EXPO
    }
  }
};

export const slideInFromLeft = {
  hidden: {
    x: -50,
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 1,
      ease: EASE_OUT_EXPO
    }
  }
};

export const slideInFromRight = {
  hidden: {
    x: 50,
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 1,
      ease: EASE_OUT_EXPO
    }
  }
};

export const dividerReveal = {
  hidden: {
    scaleX: 0
  },
  visible: {
    scaleX: 1,
    transition: {
      duration: 1.5,
      ease: 'easeInOut'
    }
  }
};

export const pageEntrance = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.5,
      ease: EASE_OUT_EXPO
    }
  }
};

export const envelopeSceneExit = {
  opacity: 0,
  transition: {
    duration: 1.5,
    ease: 'easeInOut'
  }
};

export const modalBackdrop = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: 'easeIn'
    }
  }
};

export const modalContent = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 24,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 10,
    transition: {
      duration: 0.3
    }
  }
};

export const floatingAnimation = {
  y: [-4, 4, -4],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const reverseFloatingAnimation = {
  y: [4, -4, 4],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const rotateContinuously = {
  rotate: 360,
  transition: {
    duration: 30,
    repeat: Infinity,
    ease: 'linear'
  }
};

export const pulseAnimation = {
  scale: [1, 1.12, 1],
  transition: {
    duration: 2.2,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const scrollIndicatorAnimation = {
  y: [0, 15, 0],
  opacity: [0.1, 0.6, 0.1],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const audioBarAnimations = [
  {
    height: [4, 16, 4],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  {
    height: [4, 20, 4],
    transition: {
      duration: 1.2,
      delay: 0.2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  {
    height: [4, 12, 4],
    transition: {
      duration: 0.8,
      delay: 0.4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
];

export const waxSealPulse = {
  boxShadow: [
    '0 0 0 0 rgba(191, 149, 63, 0)',
    '0 0 0 10px rgba(191, 149, 63, 0.2)',
    '0 0 0 0 rgba(191, 149, 63, 0)'
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const galleryCardHover = {
  y: -15,
  scale: 1.02
};

export const itineraryCardHover = {
  y: -8,
  transition: {
    duration: 0.5,
    ease: EASE_OUT_EXPO
  }
};