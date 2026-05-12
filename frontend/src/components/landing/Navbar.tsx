import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Analysis', href: '/analysis' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface/80 px-2 py-2 transition-all duration-300 ${scrolled ? 'shadow-md shadow-black/20' : ''}`}
      >
        {/* Logo */}
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative w-9 h-9 flex items-center justify-center cursor-pointer"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(135deg, #89AACC, #4E85BF)', padding: '1.5px' }}
            >
              <div className="w-full h-full rounded-full bg-bg" />
            </div>
            <span className="relative z-10 font-display italic text-[13px] text-text-primary">S</span>
          </motion.div>
        </Link>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-stroke mx-1" />

        {/* Nav links */}
        {NAV_LINKS.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link key={link.label} to={link.href}>
              <motion.span
                whileHover={{ scale: 1.02 }}
                className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 font-body transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-text-primary bg-stroke/50'
                    : 'text-muted hover:text-text-primary hover:bg-stroke/50'
                }`}
              >
                {link.label}
              </motion.span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-stroke mx-1" />

        {/* CTA */}
        <Link to="/login?tab=register">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="relative group rounded-full text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 font-body font-medium overflow-hidden"
          >
            <span className="absolute inset-0 accent-gradient opacity-100 group-hover:opacity-90 transition-opacity" />
            <span className="relative text-white flex items-center gap-1.5">
              Get Access
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </span>
          </motion.button>
        </Link>
      </motion.div>
    </nav>
  );
}
