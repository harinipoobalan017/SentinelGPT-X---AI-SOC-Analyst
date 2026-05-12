import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import { jsPDF } from 'jspdf';
import { apiFetch } from '../lib/api';

type AnalysisMode = 'log' | 'url' | 'hash' | 'email';

interface AnalysisResult {
  attackType: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  explanation: string;
  mitigations: string[];
  recommendations: string[];
  iocs: string[];
  confidence: number;
}

const DEMO_RESULTS: Record<AnalysisMode, AnalysisResult> = {
  log: {
    attackType: 'SQL Injection (CWE-89)',
    severity: 'critical',
    explanation: 'The uploaded log file contains multiple SQL injection payloads targeting the authentication endpoint. The attacker used UNION-based injection to enumerate database tables and extract credentials. A total of 47 malicious requests were identified from IP 185.220.101.45 (known Tor exit node) over a 3-minute window.',
    mitigations: ['Parameterize all database queries immediately', 'Block IP 185.220.101.45 at the firewall', 'Enable WAF with SQLi ruleset', 'Rotate all database credentials'],
    recommendations: ['Implement prepared statements across all endpoints', 'Deploy input validation middleware', 'Set up real-time alerting for SQLi patterns', 'Conduct full database audit for exfiltrated data'],
    iocs: ['185.220.101.45', "' OR 1=1--", 'UNION SELECT username,password FROM users', 'sqlmap/1.7.8'],
    confidence: 97,
  },
  url: {
    attackType: 'Phishing / Credential Harvesting',
    severity: 'high',
    explanation: 'The submitted URL is a confirmed phishing page mimicking a PayPal login portal. The domain "paypa1.com" uses a homoglyph attack (1 instead of l). The page collects credentials and redirects to the legitimate site. VirusTotal score: 34/71 engines flagged.',
    mitigations: ['Block domain at DNS and email gateway', 'Alert users who may have visited', 'Submit to Google Safe Browsing', 'File abuse report with registrar'],
    recommendations: ['Enable DMARC/DKIM/SPF on your domain', 'Train users to verify domain spelling', 'Deploy browser isolation for risky URLs', 'Set up credential monitoring on HaveIBeenPwned'],
    iocs: ['paypa1.com', '104.21.89.102', 'SSL cert: Let\'s Encrypt (suspicious for financial site)', 'Redirect to paypal.com after submission'],
    confidence: 94,
  },
  hash: {
    attackType: 'Cobalt Strike Beacon (Malware)',
    severity: 'critical',
    explanation: 'The submitted SHA256 hash matches a known Cobalt Strike beacon variant. This file has been flagged by 58/71 antivirus engines on VirusTotal. It uses reflective DLL injection and communicates with C2 servers on port 443 using malleable C2 profiles to blend with HTTPS traffic.',
    mitigations: ['Quarantine affected endpoint immediately', 'Block C2 IPs at perimeter firewall', 'Revoke all credentials on compromised host', 'Initiate full incident response procedure'],
    recommendations: ['Scan all endpoints for the same hash', 'Review EDR logs for lateral movement', 'Analyze network traffic for C2 beaconing patterns', 'Engage incident response team'],
    iocs: ['sha256:4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b', '198.98.51.189:443', 'JA3: 769,47-53-5-10-49161-49162-49171-49172-50-56-19-4,0-65281-10-11-35-16-5-34-51-43-13-45-28-21,29-23-24-25-256-257,0', 'Cobalt Strike 4.x'],
    confidence: 99,
  },
  email: {
    attackType: 'Business Email Compromise (BEC)',
    severity: 'high',
    explanation: 'The email header analysis reveals sender spoofing — the From field claims "cfo@yourcompany.com" but the actual sending server is "mail.compromised-relay.ru". The email body contains urgency language and requests an immediate wire transfer. This matches BEC attack patterns targeting finance teams.',
    mitigations: ['Do not process the requested wire transfer', 'Report to your financial institution immediately', 'Quarantine email and notify IT security', 'Verify with CFO via phone call'],
    recommendations: ['Enforce DMARC reject policy on your domain', 'Implement two-person approval for wire transfers', 'Train finance team on BEC detection', 'Enable advanced threat protection in email gateway'],
    iocs: ['mail.compromised-relay.ru', 'Reply-To: cfo-urgent@protonmail.com', 'X-Mailer: Zimbra (spoofed)', 'SPF: FAIL, DKIM: FAIL, DMARC: FAIL'],
    confidence: 91,
  },
};

const SEV_COLORS = {
  critical: { color: '#FF3B30', bg: 'rgba(255,59,48,0.1)', border: 'rgba(255,59,48,0.3)' },
  high:     { color: '#FF9500', bg: 'rgba(255,149,0,0.1)', border: 'rgba(255,149,0,0.3)' },
  medium:   { color: '#FFCC00', bg: 'rgba(255,204,0,0.1)', border: 'rgba(255,204,0,0.3)' },
  low:      { color: '#34C759', bg: 'rgba(52,199,89,0.1)', border: 'rgba(52,199,89,0.3)' },
  info:     { color: '#89AACC', bg: 'rgba(137,170,204,0.1)', border: 'rgba(137,170,204,0.3)' },
};

const MODES: { id: AnalysisMode; label: string; icon: string; placeholder: string }[] = [
  { id: 'log',   label: 'Log File',  icon: '📄', placeholder: 'Paste log contents here...\n\n2024-01-15 14:32:01 POST /api/auth HTTP/1.1\nUser-Agent: sqlmap/1.7.8\nBody: username=admin\'OR 1=1--&password=x' },
  { id: 'url',   label: 'URL Scan',  icon: '🔗', placeholder: 'Enter a suspicious URL to analyze...\n\nhttps://paypa1.com/login?redirect=...' },
  { id: 'hash',  label: 'File Hash', icon: '🔑', placeholder: 'Enter SHA256, MD5, or SHA1 hash...\n\n4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b' },
  { id: 'email', label: 'Email',     icon: '📧', placeholder: 'Paste email headers and body here...\n\nFrom: "CFO" <cfo@yourcompany.com>\nReceived: from mail.compromised-relay.ru\nSubject: Urgent Wire Transfer Required' },
];

export default function Analysis() {
  const [mode, setMode] = useState<AnalysisMode>('log');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await apiFetch('/analysis/analyze', {
        data: { inputType: mode, inputData: input }
      });
      setResult(res.analysis);
    } catch (err: any) {
      console.error('Analysis failed', err);
      alert(err.message || 'Analysis failed');
    }
    setLoading(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setInput(ev.target?.result as string || '');
      reader.readAsText(file);
    }
  }, []);

  const handleExportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text('SentinelGPT X - AI Security Report', margin, y);
    y += 10;

    // Meta details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    doc.text(`Severity: ${result.severity.toUpperCase()} | Confidence: ${result.confidence}%`, margin, y + 6);
    y += 20;

    // Attack Type
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text('Threat Classification', margin, y);
    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(result.attackType, margin, y);
    y += 15;

    // Explanation
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text('Executive Summary', margin, y);
    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const splitExplanation = doc.splitTextToSize(result.explanation, 170);
    doc.text(splitExplanation, margin, y);
    y += splitExplanation.length * 5 + 10;

    // IOCs
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text('Indicators of Compromise (IOCs)', margin, y);
    y += 6;
    doc.setFontSize(10);
    result.iocs.forEach((ioc) => {
      doc.text(`• ${ioc}`, margin + 5, y);
      y += 5;
    });
    y += 10;

    // Mitigations
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text('Immediate Mitigations', margin, y);
    y += 6;
    doc.setFontSize(10);
    result.mitigations.forEach((m) => {
      const splitM = doc.splitTextToSize(`• ${m}`, 165);
      doc.text(splitM, margin + 5, y);
      y += splitM.length * 5;
    });
    y += 10;

    // Recommendations
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text('Long-term Recommendations', margin, y);
    y += 6;
    doc.setFontSize(10);
    result.recommendations.forEach((r) => {
      const splitR = doc.splitTextToSize(`• ${r}`, 165);
      doc.text(splitR, margin + 5, y);
      y += splitR.length * 5;
    });

    // Save
    doc.save(`SentinelGPT-Report-${Date.now()}.pdf`);
  };

  const sev = result ? SEV_COLORS[result.severity] : null;

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-stroke bg-surface/20 backdrop-blur-sm">
          <div>
            <h1 className="text-sm font-semibold text-text-primary font-body">AI Threat Analyzer</h1>
            <p className="text-xs text-muted font-mono">Upload artifacts for instant AI analysis</p>
          </div>
          <Link to="/dashboard">
            <button className="text-xs font-body px-4 py-2 rounded-full border border-stroke text-muted hover:text-text-primary hover:border-stroke/80 transition-all">
              ← Dashboard
            </button>
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Mode tabs */}
            <div className="flex gap-2 flex-wrap">
              {MODES.map((m) => (
                <button key={m.id} onClick={() => { setMode(m.id); setInput(''); setResult(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body transition-all border ${
                    mode === m.id
                      ? 'border-transparent text-white'
                      : 'border-stroke text-muted hover:text-text-primary hover:border-stroke/80'
                  }`}
                  style={mode === m.id ? { background: 'linear-gradient(90deg, #89AACC, #4E85BF)' } : {}}>
                  <span>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input panel */}
              <div className="space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
                    dragOver ? 'border-cyber-blue bg-cyber-blue/5' : 'border-stroke bg-surface/30'
                  }`}
                >
                  {dragOver && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-bg/80 z-10">
                      <p className="text-sm text-cyber-blue font-body">Drop file to upload</p>
                    </div>
                  )}
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={MODES.find((m) => m.id === mode)?.placeholder}
                    className="w-full h-64 bg-transparent text-xs text-text-primary placeholder-muted/50 resize-none outline-none font-mono p-5 rounded-2xl"
                  />
                </div>

                {/* File upload */}
                <div className="flex gap-3">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stroke text-muted hover:text-text-primary hover:border-stroke/80 text-xs font-body transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload File
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setInput(ev.target?.result as string || '');
                        reader.readAsText(file);
                      }
                    }} />

                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleAnalyze}
                    disabled={!input.trim() || loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-body font-medium text-white transition-all disabled:opacity-40 relative overflow-hidden"
                    style={{ background: 'linear-gradient(90deg, #89AACC, #4E85BF)' }}>
                    {loading ? (
                      <>
                        <motion.div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Analyze with AI
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Loading animation */}
                <AnimatePresence>
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-surface/50 border border-stroke rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
                        <span className="text-xs text-muted font-mono">AI Analysis in progress...</span>
                      </div>
                      <div className="space-y-2">
                        {['Parsing input artifact...', 'Correlating threat intelligence...', 'Classifying attack vector...', 'Generating mitigation report...'].map((step, i) => (
                          <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.4 }}
                            className="flex items-center gap-2 text-[11px] font-mono text-muted">
                            <span className="text-cyber-green">›</span> {step}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Result panel */}
              <AnimatePresence>
                {result && sev && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-surface/30 border border-stroke rounded-2xl overflow-hidden">
                    {/* Result header */}
                    <div className="px-5 py-4 border-b border-stroke flex items-start justify-between gap-4"
                      style={{ background: `${sev.bg}` }}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-medium uppercase"
                            style={{ color: sev.color, borderColor: sev.border, background: sev.bg }}>
                            {result.severity}
                          </span>
                          <span className="text-[10px] text-muted font-mono">Confidence: {result.confidence}%</span>
                        </div>
                        <h3 className="text-sm font-semibold text-text-primary font-body">{result.attackType}</h3>
                      </div>
                      <div className="text-2xl">
                        {result.severity === 'critical' ? '🚨' : result.severity === 'high' ? '⚠️' : '🔍'}
                      </div>
                    </div>

                    <div className="p-5 space-y-5 overflow-y-auto" style={{ maxHeight: 520 }}>
                      {/* Explanation */}
                      <div>
                        <h4 className="text-[10px] text-muted uppercase tracking-wider font-mono mb-2">Analysis</h4>
                        <p className="text-xs text-muted leading-relaxed font-body">{result.explanation}</p>
                      </div>

                      {/* IOCs */}
                      <div>
                        <h4 className="text-[10px] text-muted uppercase tracking-wider font-mono mb-2">Indicators of Compromise</h4>
                        <div className="space-y-1">
                          {result.iocs.map((ioc, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-threat-critical text-[10px] mt-0.5 font-mono">⚑</span>
                              <code className="text-[10px] text-cyber-green font-mono break-all">{ioc}</code>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mitigations */}
                      <div>
                        <h4 className="text-[10px] text-muted uppercase tracking-wider font-mono mb-2">Immediate Mitigations</h4>
                        <div className="space-y-1.5">
                          {result.mitigations.map((m, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-cyber-green text-xs mt-0.5">✓</span>
                              <p className="text-xs text-muted font-body">{m}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="text-[10px] text-muted uppercase tracking-wider font-mono mb-2">Long-term Recommendations</h4>
                        <div className="space-y-1.5">
                          {result.recommendations.map((r, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-cyber-blue text-xs mt-0.5">→</span>
                              <p className="text-xs text-muted font-body">{r}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Export */}
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleExportPDF}
                        className="w-full py-2.5 rounded-xl text-xs font-body font-medium text-white"
                        style={{ background: 'linear-gradient(90deg, #89AACC, #4E85BF)' }}>
                        Export Incident Report (PDF)
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {!result && !loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-surface/20 border border-stroke/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                    <div className="text-4xl mb-4">🔬</div>
                    <h3 className="text-sm font-semibold text-text-primary font-body mb-2">Ready to analyze</h3>
                    <p className="text-xs text-muted font-body max-w-xs">
                      Paste log data, a suspicious URL, file hash, or email — then click "Analyze with AI" to get an instant security report.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
