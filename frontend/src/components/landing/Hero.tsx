import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ROLES = ['SOC Analyst', 'Threat Hunter', 'Incident Responder', 'Security AI'];
const HLS_SRC = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);

  // HLS video setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(HLS_SRC);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = HLS_SRC;
    }
  }, []);

  // Role cycle
  useEffect(() => {
    const interval = setInterval(() => setRoleIndex((i) => (i + 1) % ROLES.length), 2000);
    return () => clearInterval(interval);
  }, []);

  // GSAP entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ ease: 'power3.out' });
      tl.fromTo('.hero-name', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.1 });
      tl.fromTo('.hero-blur', { opacity: 0, filter: 'blur(10px)', y: 20 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: 0.1 }, '-=0.8');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(137,170,204,0.05) 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(137,170,204,1) 1px, transparent 1px), linear-gradient(90deg, rgba(137,170,204,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <div className="hero-blur flex items-center gap-3 mb-8">
          <div className="w-6 h-px bg-cyber-green" />
          <span className="text-xs text-cyber-green uppercase tracking-[0.4em] font-body font-medium">
            AI-Powered Security Operations
          </span>
          <div className="w-6 h-px bg-cyber-green" />
        </div>

        {/* Main heading */}
        <h1 className="hero-name text-6xl md:text-8xl lg:text-[7rem] font-display italic leading-[0.9] tracking-tight text-text-primary mb-6">
          SentinelGPT X
        </h1>

        {/* Role line */}
        <p className="hero-blur text-lg md:text-xl text-muted font-body mb-3">
          Your AI{' '}
          <span
            key={roleIndex}
            className="font-display italic text-text-primary animate-role-fade-in inline-block"
            style={{ color: '#89AACC' }}
          >
            {ROLES[roleIndex]}
          </span>
          {' '}— always on.
        </p>

        {/* Description */}
        <p className="hero-blur text-sm md:text-base text-muted max-w-lg mb-12 leading-relaxed font-body">
          Upload logs, URLs, and malware reports. Get instant AI-powered threat analysis, severity ratings, and actionable mitigation strategies.
        </p>

        {/* CTAs */}
        <div className="hero-blur flex flex-wrap items-center gap-4 justify-center">
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="relative group rounded-full text-sm px-8 py-3.5 font-body font-medium overflow-hidden"
            >
              <span className="absolute inset-0 accent-gradient opacity-100 group-hover:opacity-90 transition-opacity" />
              <span className="relative text-white flex items-center gap-2">
                Launch Dashboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </motion.button>
          </Link>

          <Link to="/analysis">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="relative group rounded-full text-sm px-8 py-3.5 font-body font-medium border-2 border-stroke bg-transparent text-text-primary hover:border-transparent transition-all duration-300"
            >
              <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(hsl(var(--bg)), hsl(var(--bg))) padding-box, linear-gradient(90deg, #89AACC, #4E85BF) border-box', border: '2px solid transparent' }}
              />
              <span className="relative flex items-center gap-2">
                Analyze Threat
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </motion.button>
          </Link>
        </div>

        {/* Live indicator */}
        <motion.div
          className="hero-blur mt-10 flex items-center gap-2 text-xs text-muted font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full bg-cyber-green animate-ping opacity-75" />
            <div className="relative w-2 h-2 rounded-full bg-cyber-green" />
          </div>
          <span className="uppercase tracking-[0.2em]">Live threat monitoring active</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
        <span className="text-xs text-muted uppercase tracking-[0.2em] font-body">Scroll</span>
        <div className="relative w-px h-10 bg-stroke overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full animate-scroll-down"
            style={{ background: 'linear-gradient(to bottom, transparent, #89AACC, transparent)' }} />
        </div>
      </div>
    </section>
  );
}
