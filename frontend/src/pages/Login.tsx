import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';

type Tab = 'login' | 'register';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'register') {
      setTab('register');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const payload = tab === 'login' ? { email, password } : { username, email, password };
      
      const res = await apiFetch(endpoint, { data: payload });
      
      // Store token and user
      localStorage.setItem('sentinel_token', res.token);
      localStorage.setItem('sentinel_user', JSON.stringify(res.user));
      
      setLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(137,170,204,1) 1px, transparent 1px), linear-gradient(90deg, rgba(137,170,204,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(137,170,204,0.06) 0%, transparent 60%)' }} />

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 h-px opacity-10"
          style={{ background: 'linear-gradient(90deg, transparent, #89AACC, transparent)', animation: 'scan 3s linear infinite' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8">
          <Link to="/">
            <div className="w-14 h-14 rounded-full relative flex items-center justify-center mb-4 cursor-pointer">
              <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, #89AACC, #4E85BF)', padding: '2px' }}>
                <div className="w-full h-full rounded-full bg-bg" />
              </div>
              <div className="absolute inset-0 rounded-full opacity-30"
                style={{ background: 'conic-gradient(from 0deg, #89AACC, #4E85BF, transparent)', animation: 'spin 4s linear infinite' }} />
              <span className="relative z-10 font-display italic text-2xl text-text-primary">S</span>
            </div>
          </Link>
          <h1 className="text-2xl font-display italic text-text-primary">SentinelGPT X</h1>
          <p className="text-xs text-muted font-mono mt-1 uppercase tracking-[0.2em]">AI Security Platform</p>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-surface/60 backdrop-blur-xl border border-stroke rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

          {/* Tabs */}
          <div className="flex border-b border-stroke">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-4 text-xs font-body font-medium capitalize transition-all ${
                  tab === t ? 'text-text-primary border-b-2 border-cyber-blue' : 'text-muted hover:text-text-primary'
                }`}
                style={tab === t ? { borderBottomColor: '#89AACC' } : {}}>
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.form key={tab} initial={{ opacity: 0, x: tab === 'login' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onSubmit={handleSubmit} className="space-y-4">

                {tab === 'register' && (
                  <div>
                    <label className="block text-[11px] text-muted font-mono uppercase tracking-wider mb-2">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      placeholder="analyst_01" required
                      className="w-full bg-bg/80 border border-stroke rounded-xl px-4 py-3 text-sm text-text-primary placeholder-muted/40 outline-none focus:border-cyber-blue transition-colors font-body"
                      style={{ ['--tw-ring-color' as any]: '#89AACC' }} />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-muted font-mono uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@company.com" required
                    className="w-full bg-bg/80 border border-stroke rounded-xl px-4 py-3 text-sm text-text-primary placeholder-muted/40 outline-none focus:border-cyber-blue transition-colors font-body" />
                </div>

                <div>
                  <label className="block text-[11px] text-muted font-mono uppercase tracking-wider mb-2">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={8}
                    className="w-full bg-bg/80 border border-stroke rounded-xl px-4 py-3 text-sm text-text-primary placeholder-muted/40 outline-none focus:border-cyber-blue transition-colors font-body" />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs text-threat-critical font-mono bg-threat-critical/10 border border-threat-critical/30 rounded-xl px-4 py-2">
                    {error}
                  </motion.p>
                )}

                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-body font-medium text-white relative overflow-hidden disabled:opacity-60"
                  style={{ background: 'linear-gradient(90deg, #89AACC, #4E85BF)' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                      Authenticating...
                    </span>
                  ) : tab === 'login' ? 'Sign In to SOC' : 'Create Account'}
                </motion.button>

                {/* Hint removed as per request */}
              </motion.form>
            </AnimatePresence>

          </div>
        </motion.div>

        {/* Footer note */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center text-[11px] text-muted font-mono mt-6">
          Protected by JWT · bcrypt · Rate Limiting
        </motion.p>
      </div>
    </div>
  );
}
