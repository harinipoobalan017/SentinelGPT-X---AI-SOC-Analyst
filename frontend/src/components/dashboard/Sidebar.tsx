import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { label: 'Threat Feed', href: '/dashboard', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )},
  { label: 'AI Analysis', href: '/analysis', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
    </svg>
  )},
  { label: 'SIEM', href: '/dashboard', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )},
  { label: 'Reports', href: '/dashboard', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )},
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex-shrink-0 h-full bg-surface/50 border-r border-stroke flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-5 border-b border-stroke`}>
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #89AACC, #4E85BF)' }}>
          <span className="font-display italic text-sm text-white">S</span>
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-xs font-semibold text-text-primary font-body">SentinelGPT X</p>
            <p className="text-[9px] text-muted font-mono">SOC Platform</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.label} to={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-stroke/60 text-text-primary'
                    : 'text-muted hover:text-text-primary hover:bg-stroke/30'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="text-xs font-body font-medium truncate">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1 h-4 rounded-full accent-gradient" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Status indicator */}
      {!collapsed && (
        <div className="p-4 border-t border-stroke">
          <div className="bg-surface rounded-xl p-3 border border-stroke/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
              <span className="text-[10px] text-cyber-green font-mono">SYSTEM ACTIVE</span>
            </div>
            <div className="space-y-1">
              {[
                { label: 'Threat Engine', ok: true },
                { label: 'AI Module', ok: true },
                { label: 'Feed Connection', ok: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[9px] text-muted font-mono">{s.label}</span>
                  <span className="text-[9px] font-mono" style={{ color: s.ok ? '#34C759' : '#FF3B30' }}>
                    {s.ok ? '● OK' : '● ERR'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center h-10 border-t border-stroke text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors gap-2 font-body text-xs"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        {!collapsed && <span>Logout</span>}
      </button>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-stroke text-muted hover:text-text-primary transition-colors"
      >
        <svg className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </motion.aside>
  );
}
