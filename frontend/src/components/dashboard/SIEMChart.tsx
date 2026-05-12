import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { apiFetch } from '../../lib/api';

const formatChartData = (backendData: any[]) => {
  const map = new Map();
  const now = new Date();
  // Initialize last 24 hours
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600000);
    const hour = d.getHours();
    map.set(hour, {
      time: hour.toString().padStart(2, '0') + ':00',
      critical: 0, high: 0, medium: 0, low: 0, total: 0
    });
  }

  // Populate actual data
  backendData.forEach((item: any) => {
    const hour = item._id.hour;
    const sev = item._id.severity;
    if (map.has(hour)) {
      const existing = map.get(hour);
      existing[sev] = item.count;
      existing.total += item.count;
    }
  });

  return Array.from(map.values());
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-stroke rounded-xl p-3 shadow-xl">
      <p className="text-xs text-muted font-mono mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-[11px] font-mono">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted capitalize">{entry.name}:</span>
          <span className="text-text-primary font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function SIEMChart() {
  const [data, setData] = useState<any[]>([]);
  const [typesData, setTypesData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'types'>('timeline');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiFetch('/dashboard/siem');
        setData(formatChartData(res.data));
        
        // Compute types data from general stats or threats endpoint if available.
        // For simplicity, we aggregate from the SIEM timeline logic or fetch generic type counts
        const typeRes = await apiFetch('/threats?limit=100');
        const typesMap: Record<string, number> = {};
        typeRes.threats.forEach((t: any) => {
          typesMap[t.type] = (typesMap[t.type] || 0) + 1;
        });
        const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#89AACC', '#BF5AF2', '#32ADE6'];
        const mappedTypes = Object.entries(typesMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([type, count], i) => ({ type, count, color: colors[i % colors.length] }));
        
        setTypesData(mappedTypes);
      } catch (err) {
        console.error('Failed to load SIEM data', err);
      }
    };
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface/30 border border-stroke rounded-2xl p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium text-text-primary font-body">SIEM Analytics</h3>
          <p className="text-xs text-muted font-mono">Last 24 hours · Live</p>
        </div>
        <div className="flex gap-1 bg-surface border border-stroke rounded-lg p-1">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`text-[10px] px-3 py-1 rounded-md font-mono transition-all ${activeTab === 'timeline' ? 'bg-stroke/70 text-text-primary' : 'text-muted hover:text-text-primary'}`}
          >Timeline</button>
          <button
            onClick={() => setActiveTab('types')}
            className={`text-[10px] px-3 py-1 rounded-md font-mono transition-all ${activeTab === 'types' ? 'bg-stroke/70 text-text-primary' : 'text-muted hover:text-text-primary'}`}
          >By Type</button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        {activeTab === 'timeline' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9500" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF9500" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#89AACC" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#89AACC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#878787', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fill: '#878787', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="medium" stroke="#89AACC" strokeWidth={1.5}
                fill="url(#medGrad)" name="medium" />
              <Area type="monotone" dataKey="high" stroke="#FF9500" strokeWidth={1.5}
                fill="url(#highGrad)" name="high" />
              <Area type="monotone" dataKey="critical" stroke="#FF3B30" strokeWidth={2}
                fill="url(#criticalGrad)" name="critical" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typesData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#878787', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="type" tick={{ fill: '#878787', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                tickLine={false} axisLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} name="count"
                fill="url(#barGrad)">
                {typesData.map((entry, index) => (
                  <rect key={`rect-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      {activeTab === 'timeline' && (
        <div className="flex gap-4 mt-4 pt-4 border-t border-stroke/40">
          {[
            { label: 'Critical', color: '#FF3B30' },
            { label: 'High', color: '#FF9500' },
            { label: 'Medium', color: '#89AACC' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-muted font-mono">{item.label}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
            <span className="text-[10px] text-muted font-mono">Live</span>
          </div>
        </div>
      )}
    </div>
  );
}
