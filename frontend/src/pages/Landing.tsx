import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingScreen from '../components/landing/LoadingScreen';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import ThreatShowcase from '../components/landing/ThreatShowcase';
import Footer from '../components/landing/Footer';

export default function Landing() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen key="loading" onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Navbar />
          <Hero />
          <Features />
          <ThreatShowcase />
          <Footer />
        </motion.div>
      )}
    </>
  );
}
