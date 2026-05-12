import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';

interface Stat {
  label: string;
  value: string | number;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
  subtext?: string;
}

const STATS: Stat[] = [
  { label: 'Total Threats', value: '2,847', change: '+12%', positive: false, icon: '🛡️', color: '#FF3B30', subtext: 'vs yesterday' },
  { label: 'Active Incidents', value: '24', change: '-3', positive: true, icon: '⚡', color: '#FF9500', subtext: 'from 27' },
  { label: 'Resolved Today', value: '183', change: '+8%', positive: true, icon: '✅', color: '#34C759', subtext: 'vs yesterday' },
  { label: 'AI Analyses', value: '1,204', change: '+24%', positive: true, icon: '🤖', color: '#89AACC', subtext: 'this session' },
  { label: 'Avg. Response', value: '1.8s', change: '-0.3s', positive: true, icon: '⏱️', color: '#BF5AF2', subtext: 'MTTR improved' },
  { label: 'Blocked IPs', value: '847', change: '+15', positive: true, icon: '🚫', color: '#32ADE6', subtext: 'auto-blocked' },
];

export default function StatsGrid() {
  const [statsData, setStatsData] = useState<Stat[]>(STATS);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiFetch('/dashboard/stats');
        setStatsData([
          { label: 'Total Threats', value: data.totalThreats.toLocaleString(), change: 'Live', positive: false, icon: '🛡️', color: '#FF3B30', subtext: 'all time' },
          { label: 'Active Incidents', value: data.activeIncidents, change: 'Open', positive: false, icon: '⚡', color: '#FF9500', subtext: 'investigating' },
          { label: 'Resolved Today', value: data.resolvedToday, change: 'Today', positive: true, icon: '✅', color: '#34C759', subtext: 'closed' },
          { label: 'AI Analyses', value: data.totalAnalyses.toLocaleString(), change: 'Total', positive: true, icon: '🤖', color: '#89AACC', subtext: 'reports' },
          { label: 'Critical Severity', value: data.criticalCount, change: 'High', positive: false, icon: '🚨', color: '#BF5AF2', subtext: 'critical alerts' },
          { label: 'High Severity', value: data.highCount, change: 'Warn', positive: false, icon: '⚠️', color: '#32ADE6', subtext: 'high alerts' },
        ]);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {statsData.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="group bg-surface/40 border border-stroke/50 rounded-xl p-4 hover:bg-surface hover:border-stroke transition-all duration-200 relative overflow-hidden"
        >
          {/* Glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
            style={{ background: `radial-gradient(circle at top left, ${stat.color}08, transparent 60%)` }}
          />
          <div className="flex items-start justify-between mb-3">
            <span className="text-lg">{stat.icon}</span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${stat.positive ? 'text-cyber-green' : 'text-threat-critical'}`}
              style={{ background: stat.positive ? 'rgba(0,255,135,0.1)' : 'rgba(255,59,48,0.1)' }}
            >
              {stat.change}
            </span>
          </div>
          <p className="text-xl font-display italic text-text-primary mb-0.5" style={{ color: stat.color }}>{stat.value}</p>
          <p className="text-[10px] text-muted font-body leading-tight">{stat.label}</p>
          {stat.subtext && <p className="text-[9px] text-stroke/70 font-mono mt-1">{stat.subtext}</p>}
        </motion.div>
      ))}
    </div>
  );
}
