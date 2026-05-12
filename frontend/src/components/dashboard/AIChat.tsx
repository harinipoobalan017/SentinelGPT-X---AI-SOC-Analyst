import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  typing?: boolean;
}

const DEMO_RESPONSES: Record<string, string> = {
  default: `## Threat Analysis Complete

**Attack Classification:** SQL Injection (CWE-89)
**Severity:** 🔴 CRITICAL

### What Happened
An attacker attempted to inject malicious SQL code through the \`/api/auth\` endpoint. The payload \`' OR 1=1--\` was detected in the username field.

### Risk Assessment
- **Confidentiality Impact:** HIGH — Database contents exposed
- **Integrity Impact:** HIGH — Potential data manipulation  
- **Availability Impact:** MEDIUM — Service disruption possible

### Recommended Actions
1. ✅ Parameterized queries / prepared statements
2. ✅ Input validation and sanitization
3. ✅ WAF rule: block common SQLi patterns
4. ✅ Review all endpoints accepting user input
5. ✅ Audit database access logs for exfiltration

### Indicators of Compromise
\`\`\`
Source IP: 185.220.101.45 (Tor exit node)
User-Agent: sqlmap/1.7.8
Payload: ' OR 1=1-- 
\`\`\``,
  phishing: `## Phishing Email Analysis

**Classification:** Spear Phishing (T1566.001)
**Severity:** 🟠 HIGH — Credential Harvesting Attempt

### Email Indicators
- **Sender spoofing:** Domain typosquat detected (\`paypa1.com\` vs \`paypal.com\`)
- **Urgency language:** "Immediate action required" — social engineering tactic
- **Malicious link:** Redirects to credential-harvesting page
- **Attachment:** Excel macro dropper detected

### MITRE ATT&CK Mapping
- T1566.001 — Spear Phishing Attachment
- T1204.002 — Malicious File Execution

### Response Steps
1. ✅ Quarantine email immediately
2. ✅ Block sender domain at gateway
3. ✅ Alert all users about campaign
4. ✅ Reset credentials if clicked`,
};

const QUICK_PROMPTS = [
  'Analyze this SQL injection attempt',
  'Is this email a phishing attempt?',
  'Explain CVE-2024-1234',
  'Scan IP 185.220.101.45',
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello, I'm **SentinelGPT** — your AI SOC analyst. Paste logs, URLs, email headers, or malware hashes and I'll analyze them instantly. What threat are you investigating?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Demo AI response
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const isPhishing = text.toLowerCase().includes('phish') || text.toLowerCase().includes('email');
    const response = isPhishing ? DEMO_RESPONSES.phishing : DEMO_RESPONSES.default;

    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() },
    ]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/## (.*)/g, '<h2 class="text-sm font-semibold text-text-primary mt-3 mb-1">$1</h2>')
      .replace(/### (.*)/g, '<h3 class="text-xs font-semibold text-muted mt-2 mb-1 uppercase tracking-wider">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-medium">$1</strong>')
      .replace(/`(.*?)`/g, '<code class="text-cyber-green bg-surface/80 px-1 py-0.5 rounded text-[10px] font-mono">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-surface border border-stroke rounded-lg p-3 mt-2 mb-2 text-[10px] font-mono text-cyber-green overflow-x-auto"><code>$1</code></pre>')
      .replace(/✅ (.*)/g, '<div class="flex items-start gap-2 my-0.5"><span class="text-cyber-green text-xs mt-0.5">✓</span><span class="text-xs text-muted">$1</span></div>')
      .replace(/- (.*)/g, '<div class="flex items-start gap-2 my-0.5 ml-2"><span class="text-muted text-xs mt-1">•</span><span class="text-xs text-muted">$1</span></div>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="flex flex-col h-full bg-surface/30 rounded-2xl border border-stroke overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stroke bg-surface/50">
        <div className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #89AACC, #4E85BF)' }}>
          <span className="text-[11px] font-display italic text-white">S</span>
        </div>
        <div>
          <p className="text-xs font-medium text-text-primary font-body">SentinelGPT AI</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-cyber-green animate-pulse" />
            <p className="text-[10px] text-muted font-mono">Online • Demo Mode</p>
          </div>
        </div>
        <div className="ml-auto px-2 py-1 rounded-full bg-surface border border-stroke">
          <span className="text-[10px] text-muted font-mono">GPT-4o Ready</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1"
                  style={{ background: 'linear-gradient(135deg, #89AACC, #4E85BF)' }}>
                  <span className="text-[9px] font-display italic text-white">S</span>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-stroke/50 text-text-primary font-body rounded-tr-sm'
                    : 'bg-surface border border-stroke text-muted rounded-tl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                ) : (
                  <p className="font-body">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #89AACC, #4E85BF)' }}>
                <span className="text-[9px] font-display italic text-white">S</span>
              </div>
              <div className="bg-surface border border-stroke rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-muted"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
        {QUICK_PROMPTS.map((prompt) => (
          <button key={prompt} onClick={() => sendMessage(prompt)}
            className="flex-shrink-0 text-[10px] text-muted px-3 py-1.5 rounded-full border border-stroke hover:border-stroke/80 hover:text-text-primary transition-all font-body whitespace-nowrap">
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-stroke">
        <div className="flex gap-2 bg-surface border border-stroke rounded-xl p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste logs, URLs, hashes, or describe a threat..."
            rows={2}
            className="flex-1 bg-transparent text-xs text-text-primary placeholder-muted resize-none outline-none font-body px-2 py-1"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="self-end w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
            style={{ background: input.trim() ? 'linear-gradient(135deg, #89AACC, #4E85BF)' : 'transparent', border: input.trim() ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-muted text-center mt-2 font-body">Enter to send • Shift+Enter for newline</p>
      </div>
    </div>
  );
}
