import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const WORDS = ['Analyze.', 'Protect.', 'Respond.'];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const DURATION = 2700;

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      setCount(Math.floor(eased * 100));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => onComplete(), 400);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % WORDS.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-bg flex flex-col overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-0 right-0 h-px opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent, #89AACC, transparent)',
            animation: 'scan 2s linear infinite',
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(137,170,204,1) 1px, transparent 1px), linear-gradient(90deg, rgba(137,170,204,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top-left label */}
      <motion.div
        className="absolute top-8 left-8 md:top-12 md:left-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <span className="text-xs text-muted uppercase tracking-[0.3em] font-body">
          SentinelGPT X
        </span>
      </motion.div>

      {/* Top-right system status */}
      <motion.div
        className="absolute top-8 right-8 md:top-12 md:right-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
          <span className="text-xs text-muted uppercase tracking-[0.2em] font-mono">
            SYSTEM BOOT
          </span>
        </div>
      </motion.div>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Logo mark */}
        <motion.div
          className="mb-12 relative"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="w-20 h-20 rounded-full relative flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(135deg, #89AACC, #4E85BF)', padding: '2px' }}
            >
              <div className="w-full h-full rounded-full bg-bg" />
            </div>
            <div
              className="absolute inset-0 rounded-full opacity-50"
              style={{
                background: 'conic-gradient(from 0deg, #89AACC, #4E85BF, transparent)',
                animation: 'spin 3s linear infinite',
              }}
            />
            <span className="relative z-10 font-display italic text-2xl text-text-primary">S</span>
          </div>
        </motion.div>

        {/* Cycling word */}
        <div className="h-16 md:h-20 lg:h-24 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80 block"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {WORDS[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Subtitle */}
        <motion.p
          className="mt-4 text-xs text-muted uppercase tracking-[0.4em] font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          AI-Powered SOC Platform
        </motion.p>
      </div>

      {/* Bottom */}
      <div className="px-8 pb-8 md:px-12 md:pb-12 flex items-end justify-between">
        {/* Bottom-left: boot log */}
        <div className="hidden md:flex flex-col gap-1">
          {['Initializing threat engine...', 'Loading AI modules...', 'Connecting to feeds...'].map((line, i) => (
            <motion.p
              key={i}
              className="terminal-text text-[10px] opacity-50"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: count > i * 33 ? 0.5 : 0, x: count > i * 33 ? 0 : -10 }}
              transition={{ duration: 0.3 }}
            >
              {'>'} {line}
            </motion.p>
          ))}
        </div>

        {/* Bottom-right: counter */}
        <div className="ml-auto text-right">
          <span className="text-6xl md:text-8xl lg:text-9xl font-display loading-counter text-text-primary leading-none">
            {String(count).padStart(3, '0')}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-stroke/50">
        <motion.div
          className="h-full accent-gradient origin-left"
          style={{
            scaleX: count / 100,
            boxShadow: '0 0 8px rgba(137,170,204,0.35)',
          }}
        />
      </div>
    </motion.div>
  );
}
