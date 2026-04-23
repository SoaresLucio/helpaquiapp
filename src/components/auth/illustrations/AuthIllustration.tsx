import React from 'react';
import { motion } from 'framer-motion';

const float = {
  animate: { y: [0, -8, 0] },
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
};

export const LoginIllustration: React.FC = () => (
  <motion.svg
    viewBox="0 0 320 240"
    className="w-full max-w-xs mx-auto"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="loginGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6c2ea0" />
        <stop offset="100%" stopColor="#2b439b" />
      </linearGradient>
    </defs>
    <motion.circle cx="160" cy="120" r="80" fill="url(#loginGrad)" opacity="0.1" {...float} />
    <motion.rect x="100" y="80" width="120" height="100" rx="14" fill="url(#loginGrad)" opacity="0.95"
      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 0.95 }} transition={{ duration: 0.5, delay: 0.2 }}
    />
    <rect x="116" y="104" width="88" height="10" rx="5" fill="white" opacity="0.85" />
    <rect x="116" y="124" width="60" height="8" rx="4" fill="white" opacity="0.6" />
    <rect x="116" y="142" width="88" height="22" rx="11" fill="white" opacity="0.9" />
    <motion.circle cx="240" cy="70" r="12" fill="#6c2ea0" opacity="0.4"
      animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
    />
    <motion.circle cx="80" cy="180" r="8" fill="#2b439b" opacity="0.4"
      animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
    />
  </motion.svg>
);

export const RegisterIllustration: React.FC = () => (
  <motion.svg
    viewBox="0 0 320 240"
    className="w-full max-w-xs mx-auto"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="regGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6c2ea0" />
        <stop offset="100%" stopColor="#2b439b" />
      </linearGradient>
    </defs>
    <motion.circle cx="160" cy="120" r="85" fill="url(#regGrad)" opacity="0.1" {...float} />
    <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <circle cx="120" cy="110" r="26" fill="url(#regGrad)" />
      <circle cx="120" cy="100" r="9" fill="white" opacity="0.95" />
      <path d="M104 130 Q120 118 136 130 L136 142 L104 142 Z" fill="white" opacity="0.95" />
    </motion.g>
    <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}>
      <circle cx="200" cy="130" r="22" fill="url(#regGrad)" opacity="0.85" />
      <circle cx="200" cy="122" r="7" fill="white" opacity="0.95" />
      <path d="M186 146 Q200 136 214 146 L214 156 L186 156 Z" fill="white" opacity="0.95" />
    </motion.g>
    <motion.circle cx="250" cy="80" r="6" fill="#6c2ea0"
      animate={{ y: [0, -10, 0], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.circle cx="70" cy="170" r="8" fill="#2b439b"
      animate={{ y: [0, 8, 0], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
    />
  </motion.svg>
);
