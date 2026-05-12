import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🛡️',
    title: 'Threat Intelligence',
    desc: 'Real-time feed of global attack patterns, IOCs, and CVEs with AI-powered correlation.',
    tag: 'LIVE',
    color: '#89AACC',
  },
  {
    icon: '🤖',
    title: 'AI SOC Analyst',
    desc: 'Upload any log, URL, or malware report. Get human-readable analysis in seconds.',
    tag: 'GPT-4',
    color: '#00FF87',
  },
  {
    icon: '📊',
    title: 'SIEM Dashboard',
    desc: 'Visualize your security posture with real-time charts and incident timelines.',
    tag: 'REAL-TIME',
    color: '#BF5AF2',
  },
  {
    icon: '🔍',
    title: 'Incident Reports',
    desc: 'AI-generated structured reports with attack classification, severity, and mitigation steps.',
    tag: 'AUTO',
    color: '#FF9500',
  },
];

const STATS = [
  { value: '10M+', label: 'Threats Analyzed' },
  { value: '99.7%', label: 'Detection Rate' },
  { value: '<2s', label: 'Response Time' },
];

export default function Features() {
  return (
    <section className="bg-bg py-20 md:py-28 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #89AACC, transparent)' }} />

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: '-100px' }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em] font-body">Platform Capabilities</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display italic leading-tight text-text-primary mb-4">
            Security that <em className="font-display italic not-italic" style={{ color: '#89AACC' }}>thinks</em>
          </h2>
          <p className="text-sm md:text-base text-muted max-w-md font-body">
            Enterprise-grade AI that analyzes threats, classifies attacks, and recommends actions—automatically.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-16">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group relative bg-surface border border-stroke rounded-3xl p-8 overflow-hidden cursor-default"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at top left, ${feat.color}08, transparent 60%)` }}
              />

              {/* Gradient border on hover */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `linear-gradient(hsl(var(--surface)), hsl(var(--surface))) padding-box, linear-gradient(135deg, ${feat.color}60, transparent) border-box`, border: '1px solid transparent' }}
              />

              <div className="flex items-start justify-between mb-6">
                <span className="text-3xl">{feat.icon}</span>
                <span
                  className="text-[10px] font-mono font-medium px-2 py-1 rounded-full border"
                  style={{ color: feat.color, borderColor: `${feat.color}40`, background: `${feat.color}10` }}
                >
                  {feat.tag}
                </span>
              </div>
              <h3 className="text-xl font-body font-semibold text-text-primary mb-3">{feat.title}</h3>
              <p className="text-sm text-muted leading-relaxed font-body">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-6 border border-stroke rounded-2xl p-8 bg-surface/50"
        >
          {STATS.map((stat, i) => (
            <div key={i} className={`text-center ${i < STATS.length - 1 ? 'border-r border-stroke' : ''}`}>
              <div className="text-3xl md:text-4xl font-display italic accent-gradient-text mb-2">{stat.value}</div>
              <div className="text-xs text-muted uppercase tracking-[0.2em] font-body">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="relative group rounded-full text-sm px-8 py-3.5 font-body font-medium overflow-hidden"
            >
              <span className="absolute inset-0 accent-gradient" />
              <span className="relative text-white flex items-center gap-2">
                Try it live
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
