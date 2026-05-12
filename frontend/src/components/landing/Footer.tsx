import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const MARQUEE_TEXT = 'DEFENDING THE FUTURE • POWERED BY AI • ZERO TRUST SECURITY • ';
const HLS_SRC = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';

// Social links removed

export default function Footer() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('hello@sentinelgpt.ai');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // GSAP marquee
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.marquee-inner', {
        xPercent: -50,
        duration: 40,
        ease: 'none',
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, []);

  // Video setup (reuse HLS or fallback)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    import('hls.js').then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        hls.loadSource(HLS_SRC);
        hls.attachMedia(video);
        return () => hls.destroy();
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = HLS_SRC;
      }
    });
  }, []);

  return (
    <footer className="bg-bg pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden relative">
      {/* Background video (flipped) */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
          style={{ transform: 'translate(-50%, -50%) scaleY(-1)' }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Marquee */}
      <div ref={marqueeRef} className="relative z-10 overflow-hidden mb-16 border-y border-stroke/30">
        <div className="py-4 flex">
          <div className="marquee-inner flex whitespace-nowrap">
            {Array(20).fill(MARQUEE_TEXT).map((text, i) => (
              <span key={i} className="text-sm md:text-base font-display italic text-text-primary/30 pr-8 tracking-widest">
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-muted uppercase tracking-[0.3em] mb-4 font-body">Ready to secure your infrastructure?</p>
            <h2 className="text-5xl md:text-7xl font-display italic text-text-primary mb-8 leading-tight">
              Let's talk.
            </h2>

            <div onClick={handleCopy} className="cursor-pointer inline-block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex rounded-full text-base px-10 py-4 font-body font-medium overflow-hidden"
              >
                <span className="absolute inset-0 accent-gradient" />
                <span className="relative text-white flex items-center gap-3">
                  {copied ? 'Copied to clipboard!' : 'hello@sentinelgpt.ai'}
                  {!copied && (
                    <svg className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  )}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Footer bar */}
        <div className="border-t border-stroke/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #89AACC, #4E85BF)' }}>
              <span className="font-display italic text-[11px] text-white">S</span>
            </div>
            <span className="text-xs text-muted font-body">© 2026 SentinelGPT X</span>
          </div>

          {/* Social links removed */}

          <div className="flex items-center gap-2">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-cyber-green animate-ping opacity-75" />
              <div className="relative w-2 h-2 rounded-full bg-cyber-green" />
            </div>
            <span className="text-xs text-muted font-body">Available for projects</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
