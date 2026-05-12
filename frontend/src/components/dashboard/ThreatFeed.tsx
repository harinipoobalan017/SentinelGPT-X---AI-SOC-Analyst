import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../lib/api';

interface Threat {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  sourceIP: string;
  country: string;
  target: string;
  createdAt: string;
  status: 'new' | 'investigating' | 'resolved';
  description: string;
}

const SEVERITY_CONFIG = {
  critical: { label: 'CRITICAL', color: '#FF3B30', glow: 'rgba(255,59,48,0.4)' },
  high:     { label: 'HIGH',     color: '#FF9500', glow: 'rgba(255,149,0,0.3)' },
  medium:   { label: 'MEDIUM',   color: '#FFCC00', glow: 'rgba(255,204,0,0.3)' },
  low:      { label: 'LOW',      color: '#34C759', glow: 'rgba(52,199,89,0.3)' },
};

const STATUS_CONFIG = {
  new:           { label: 'NEW',           color: '#89AACC' },
  investigating: { label: 'INVESTIGATING', color: '#FF9500' },
  resolved:      { label: 'RESOLVED',      color: '#34C759' },
};

const INITIAL_THREATS: Threat[] = [
  { id: '1', type: 'SQL Injection', severity: 'critical', sourceIP: '185.220.101.45', country: 'RU', target: '/api/auth', timestamp: new Date(Date.now() - 2000), status: 'new', description: 'Classic union-based SQLi attempt on authentication endpoint' },
  { id: '2', type: 'Spear Phishing', severity: 'high', sourceIP: '23.94.56.12', country: 'CN', target: 'user@corp.com', timestamp: new Date(Date.now() - 15000), status: 'investigating', description: 'Credential-harvesting email with spoofed paypal.com domain' },
  { id: '3', type: 'Port Scan', severity: 'medium', sourceIP: '91.108.4.67', country: 'DE', target: '10.0.0.1:1-1024', timestamp: new Date(Date.now() - 43000), status: 'new', description: 'Full TCP SYN scan across internal IP range' },
  { id: '4', type: 'Brute Force SSH', severity: 'high', sourceIP: '104.21.89.102', country: 'US', target: ':22', timestamp: new Date(Date.now() - 60000), status: 'investigating', description: '847 failed login attempts in 3 minutes' },
  { id: '5', type: 'XSS Attempt', severity: 'medium', sourceIP: '45.33.72.191', country: 'NL', target: '/search?q=', timestamp: new Date(Date.now() - 120000), status: 'resolved', description: 'Reflected XSS via search parameter — blocked by WAF' },
  { id: '6', type: 'Malware C2 Beacon', severity: 'critical', sourceIP: '198.98.51.189', country: 'IR', target: 'host:8080', timestamp: new Date(Date.now() - 180000), status: 'new', description: 'Cobalt Strike beacon traffic identified via JA3 fingerprint' },
  { id: '7', type: 'Data Exfiltration', severity: 'critical', sourceIP: '77.88.55.66', country: 'RU', target: '/api/export', timestamp: new Date(Date.now() - 300000), status: 'investigating', description: 'Unusual outbound data transfer — 2.3GB to unknown endpoint' },
  { id: '8', type: 'Log4Shell Attempt', severity: 'high', sourceIP: '134.209.82.11', country: 'SG', target: 'User-Agent header', timestamp: new Date(Date.now() - 600000), status: 'resolved', description: 'CVE-2021-44228 exploitation attempt — patched endpoint' },
];

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${Math.max(secs, 0)}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export default function ThreatFeed() {
  const [threats, setThreats] = useState<Threat[]>(INITIAL_THREATS);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [, setTick] = useState(0);

  // Re-render timestamps
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const loadThreats = async () => {
    try {
      const data = await apiFetch('/dashboard/feed');
      setThreats(data.threats.map((t: any) => ({ ...t, id: t._id })));
    } catch (err) {
      console.error('Failed to load threat feed', err);
    }
  };

  useEffect(() => {
    loadThreats();
    const interval = setInterval(loadThreats, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'all' ? threats : threats.filter((t) => t.severity === filter);
  const selectedThreat = threats.find((t) => t.id === selected);

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] font-mono px-3 py-1 rounded-full border transition-all capitalize ${
              filter === f
                ? 'border-current text-text-primary bg-stroke/50'
                : 'border-stroke text-muted hover:text-text-primary'
            }`}
            style={filter === f && f !== 'all' && SEVERITY_CONFIG[f as keyof typeof SEVERITY_CONFIG] ? { color: SEVERITY_CONFIG[f as keyof typeof SEVERITY_CONFIG].color, borderColor: SEVERITY_CONFIG[f as keyof typeof SEVERITY_CONFIG].color + '60' } : {}}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
          <span className="text-[10px] text-muted font-mono">LIVE</span>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Feed list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <AnimatePresence>
            {filtered.map((threat) => {
              const sev = SEVERITY_CONFIG[threat.severity as keyof typeof SEVERITY_CONFIG] || { label: 'UNKNOWN', color: '#878787', glow: 'rgba(135,135,135,0.3)' };
              const stat = STATUS_CONFIG[threat.status as keyof typeof STATUS_CONFIG] || { label: 'UNKNOWN', color: '#878787' };
              const isSelected = selected === threat.id;
              return (
                <motion.div
                  key={threat.id}
                  layout
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelected(isSelected ? null : threat.id)}
                  className={`group rounded-xl border p-3 cursor-pointer transition-all duration-200 ${
                    isSelected ? 'border-stroke/80 bg-surface' : 'border-stroke/40 bg-surface/30 hover:bg-surface/60 hover:border-stroke'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-1 flex-shrink-0 self-stretch rounded-full mt-0.5"
                      style={{ backgroundColor: sev.color, boxShadow: `0 0 6px ${sev.glow}` }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-text-primary font-body truncate">{threat.type}</span>
                        <span className="flex-shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded"
                          style={{ color: sev.color, background: `${sev.color}15`, border: `1px solid ${sev.color}30` }}>
                          {sev.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted font-mono">
                        <span>{threat.sourceIP}</span>
                        <span className="text-stroke">•</span>
                        <span>[{threat.country}]</span>
                        <span className="text-stroke">→</span>
                        <span className="truncate">{threat.target}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[9px] text-muted font-mono">{timeAgo(threat.createdAt)}</span>
                      <span className="text-[9px] font-mono" style={{ color: stat.color }}>{stat.label}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-stroke/40 text-[11px] text-muted font-body">
                      <p className="mb-2">{threat.description}</p>
                      <div className="flex gap-2">
                        <button className="text-[10px] px-3 py-1 rounded-full font-mono"
                          style={{ color: '#89AACC', background: 'rgba(137,170,204,0.1)', border: '1px solid rgba(137,170,204,0.2)' }}>
                          Analyze with AI →
                        </button>
                        <button className="text-[10px] px-3 py-1 rounded-full border border-stroke text-muted hover:text-text-primary font-mono transition-colors">
                          Mark Resolved
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
