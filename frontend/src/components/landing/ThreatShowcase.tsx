import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const LIVE_THREATS = [
  { id: 1, type: 'SQL Injection', severity: 'critical', ip: '185.220.101.45', country: 'RU', time: '2s ago', target: '/api/auth' },
  { id: 2, type: 'Phishing Email', severity: 'high', ip: '23.94.56.12', country: 'CN', time: '15s ago', target: 'inbox' },
  { id: 3, type: 'Port Scan', severity: 'medium', ip: '91.108.4.67', country: 'DE', time: '43s ago', target: ':443' },
  { id: 4, type: 'Brute Force', severity: 'high', ip: '104.21.89.102', country: 'US', time: '1m ago', target: '/admin' },
  { id: 5, type: 'XSS Attempt', severity: 'medium', ip: '45.33.72.191', country: 'NL', time: '2m ago', target: '/search' },
  { id: 6, type: 'Malware Hash', severity: 'critical', ip: '198.98.51.189', country: 'IR', time: '3m ago', target: 'endpoint' },
];

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  critical: { label: 'CRITICAL', color: '#FF3B30', bg: 'rgba(255,59,48,0.1)', dot: 'bg-threat-critical' },
  high:     { label: 'HIGH',     color: '#FF9500', bg: 'rgba(255,149,0,0.1)', dot: 'bg-threat-high' },
  medium:   { label: 'MEDIUM',   color: '#FFCC00', bg: 'rgba(255,204,0,0.1)', dot: 'bg-threat-medium' },
  low:      { label: 'LOW',      color: '#34C759', bg: 'rgba(52,199,89,0.1)', dot: 'bg-threat-low' },
};

export default function ThreatShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);
  const [activeThreat, setActiveThreat] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax columns
      if (col1Ref.current && col2Ref.current) {
        gsap.to(col1Ref.current, {
          y: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
        gsap.to(col2Ref.current, {
          y: 80,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-bg py-20 md:py-28 relative overflow-hidden">
      {/* Radar effect in background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-5 pointer-events-none">
        <div className="absolute inset-0 rounded-full border border-cyber-green/30" />
        <div className="absolute inset-[20%] rounded-full border border-cyber-green/20" />
        <div className="absolute inset-[40%] rounded-full border border-cyber-green/15" />
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ background: 'conic-gradient(from 0deg, rgba(0,255,135,0.1), transparent 60%, transparent)', animation: 'radar-sweep 4s linear infinite' }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div ref={contentRef}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-stroke" />
                <span className="text-xs text-muted uppercase tracking-[0.3em] font-body">Live Threat Intelligence</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display italic leading-tight text-text-primary mb-6">
                Real threats. <br />
                <em style={{ color: '#00FF87', fontStyle: 'normal' }} className="font-display italic">Real time.</em>
              </h2>
              <p className="text-sm md:text-base text-muted max-w-sm leading-relaxed font-body mb-8">
                Monitor your attack surface 24/7. Every threat is automatically classified, enriched with threat intelligence, and escalated to the right team.
              </p>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Threats blocked today', value: '2,847', color: '#FF3B30' },
                  { label: 'AI analyses run', value: '14,209', color: '#89AACC' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-surface border border-stroke rounded-2xl p-4">
                    <div className="text-2xl font-display italic mb-1" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-xs text-muted font-body">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Live threat feed */}
          <div className="relative">
            {/* Terminal header */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="bg-surface border border-stroke rounded-2xl overflow-hidden"
            >
              {/* Terminal bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-stroke">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-threat-critical/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-threat-medium/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-threat-low/70" />
                </div>
                <span className="flex-1 text-center text-xs text-muted font-mono">sentinel-threat-feed.live</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
                  <span className="text-xs text-cyber-green font-mono">LIVE</span>
                </div>
              </div>

              {/* Threat list */}
              <div className="divide-y divide-stroke/50">
                {LIVE_THREATS.map((threat, i) => {
                  const sev = SEVERITY_CONFIG[threat.severity];
                  return (
                    <motion.div
                      key={threat.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      viewport={{ once: true }}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      onClick={() => setActiveThreat(activeThreat === threat.id ? null : threat.id)}
                      className="px-4 py-3 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0`}
                          style={{ backgroundColor: sev.color, boxShadow: `0 0 6px ${sev.color}` }} />
                        <span
                          className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded"
                          style={{ color: sev.color, background: sev.bg }}
                        >{sev.label}</span>
                        <span className="text-xs text-text-primary font-mono flex-1">{threat.type}</span>
                        <span className="text-[10px] text-muted font-mono">{threat.time}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 ml-5 pl-3">
                        <span className="text-[10px] text-muted font-mono">{threat.ip}</span>
                        <span className="text-[10px] text-stroke font-mono">→</span>
                        <span className="text-[10px] text-muted font-mono">{threat.target}</span>
                        <span className="text-[10px] text-muted font-mono ml-auto">[{threat.country}]</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-stroke flex items-center justify-between">
                <span className="text-[10px] text-muted font-mono">Showing last 6 of 2,847 threats</span>
                <span className="text-[10px] text-cyber-blue font-mono cursor-pointer hover:text-cyber-blue-light">View all →</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
