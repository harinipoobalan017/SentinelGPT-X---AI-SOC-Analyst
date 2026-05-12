import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import StatsGrid from '../components/dashboard/StatsGrid';
import ThreatFeed from '../components/dashboard/ThreatFeed';
import SIEMChart from '../components/dashboard/SIEMChart';
import AIChat from '../components/dashboard/AIChat';

export default function Dashboard() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-stroke bg-surface/20 backdrop-blur-sm">
          <div>
            <h1 className="text-sm font-semibold text-text-primary font-body">Security Operations Center</h1>
            <p className="text-xs text-muted font-mono">{dateStr} · {timeStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-threat-critical/10 border border-threat-critical/30">
              <div className="w-1.5 h-1.5 rounded-full bg-threat-critical animate-pulse" />
              <span className="text-[11px] text-threat-critical font-mono font-medium">3 CRITICAL ALERTS</span>
            </motion.div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-stroke">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
              <span className="text-[11px] text-muted font-mono">AI ONLINE</span>
            </div>
            <Link to="/">
              <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #89AACC, #4E85BF)' }}>
                <span className="text-xs font-display italic text-white">A</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <StatsGrid />
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Threat Feed */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="xl:col-span-5 bg-surface/30 border border-stroke rounded-2xl p-5 flex flex-col" style={{ minHeight: 480 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-text-primary font-body">Live Threat Feed</h2>
                  <p className="text-xs text-muted font-mono">Real-time attack detection</p>
                </div>
                <Link to="/analysis">
                  <button className="text-[10px] font-mono px-3 py-1 rounded-full border border-stroke text-muted hover:text-text-primary transition-all">
                    Analyze →
                  </button>
                </Link>
              </div>
              <div className="flex-1 min-h-0"><ThreatFeed /></div>
            </motion.div>

            {/* AI Chat */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="xl:col-span-4" style={{ minHeight: 480 }}>
              <AIChat />
            </motion.div>

            {/* Right col */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="xl:col-span-3 flex flex-col gap-4">
              {/* Quick Actions */}
              <div className="bg-surface/30 border border-stroke rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-text-primary font-body mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Upload Log File', icon: '📁' },
                    { label: 'Scan URL', icon: '🔗' },
                    { label: 'Check Hash', icon: '#' },
                    { label: 'Analyze Email', icon: '📧' },
                  ].map((action) => (
                    <Link key={action.label} to="/analysis">
                      <motion.div whileHover={{ x: 3 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-stroke/40 hover:border-stroke hover:bg-surface/50 cursor-pointer transition-all">
                        <span className="text-sm w-6 text-center">{action.icon}</span>
                        <span className="text-xs text-muted font-body">{action.label}</span>
                        <svg className="w-3 h-3 text-stroke ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Top Attack Sources */}
              <div className="bg-surface/30 border border-stroke rounded-2xl p-4 flex-1">
                <h3 className="text-xs font-semibold text-text-primary font-body mb-3">Top Attack Sources</h3>
                <div className="space-y-3">
                  {[
                    { country: 'Russia', flag: '🇷🇺', count: 847, pct: 90 },
                    { country: 'China', flag: '🇨🇳', count: 623, pct: 66 },
                    { country: 'USA', flag: '🇺🇸', count: 412, pct: 44 },
                    { country: 'Germany', flag: '🇩🇪', count: 287, pct: 30 },
                    { country: 'Iran', flag: '🇮🇷', count: 198, pct: 21 },
                  ].map((item) => (
                    <div key={item.country}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">{item.flag}</span>
                        <span className="text-[11px] text-muted font-body flex-1">{item.country}</span>
                        <span className="text-[10px] text-text-primary font-mono">{item.count}</span>
                      </div>
                      <div className="h-1 bg-stroke/30 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full accent-gradient rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* SIEM Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
            style={{ height: 280 }}>
            <SIEMChart />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
