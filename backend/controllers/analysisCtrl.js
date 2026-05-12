const AnalysisReport = require('../models/AnalysisReport');
const Threat = require('../models/Threat');

// Cybersecurity AI system prompt
const SYSTEM_PROMPT = `You are SentinelGPT, an expert AI cybersecurity SOC analyst. 
Analyze the provided input and respond in strict JSON with this schema:
{
  "attackType": "string — specific attack classification (e.g. SQL Injection CWE-89)",
  "severity": "critical|high|medium|low|info",
  "explanation": "string — detailed technical analysis, 2-4 sentences",
  "mitigations": ["array of 4 immediate mitigation actions"],
  "recommendations": ["array of 4 long-term security recommendations"],
  "iocs": ["array of specific indicators of compromise found"],
  "confidence": number between 0-100
}
Be precise, technical, and actionable. Always cite specific CVEs, CWEs, or MITRE ATT&CK TTPs when applicable.`;

// Demo responses for when no API key is configured
const DEMO_RESPONSES = {
  log: {
    attackType: 'SQL Injection (CWE-89) + Automated Scanner',
    severity: 'critical',
    explanation: 'Log analysis reveals a systematic SQL injection campaign using sqlmap targeting the /api/auth endpoint. 47 malicious requests detected from Tor exit node 185.220.101.45 in 3 minutes, using UNION-based extraction to enumerate database schema.',
    mitigations: ['Block 185.220.101.45 at perimeter firewall immediately', 'Parameterize all SQL queries — switch to prepared statements', 'Enable WAF with OWASP Core Rule Set (CRS) SQLi rules', 'Rotate all database credentials and revoke active sessions'],
    recommendations: ['Implement ORM layer (e.g. Mongoose, Sequelize) to prevent raw queries', 'Deploy application-layer rate limiting on auth endpoints', 'Enable SIEM alerting for scanner User-Agent patterns', 'Schedule quarterly penetration testing'],
    iocs: ["185.220.101.45 (Tor exit node)", "sqlmap/1.7.8 User-Agent", "' OR 1=1--", 'UNION SELECT username,password FROM users'],
    confidence: 97,
  },
  url: {
    attackType: 'Phishing — Credential Harvesting (T1566.002)',
    severity: 'high',
    explanation: 'URL analysis confirms a homoglyph phishing site (paypa1.com vs paypal.com). The page clones PayPal UI and exfiltrates credentials via XHR to 104.21.89.102. VirusTotal: 34/71 engines flagged. SSL certificate is valid (Let\'s Encrypt) which lends false legitimacy.',
    mitigations: ['Block domain at DNS resolver and email security gateway', 'Submit to Google Safe Browsing and PhishTank', 'Alert any users who may have visited the URL', 'File abuse complaint with domain registrar'],
    recommendations: ['Enable DMARC, DKIM, SPF on corporate email domain', 'Deploy browser isolation solution for risky domains', 'Implement credential monitoring on HaveIBeenPwned API', 'Train employees to verify domain spelling before entering credentials'],
    iocs: ['paypa1.com', '104.21.89.102', 'SSL: Let\'s Encrypt (issued 2 days ago)', 'Redirect: paypal.com/login after POST'],
    confidence: 94,
  },
  hash: {
    attackType: 'Cobalt Strike Beacon — C2 Malware (T1055.001)',
    severity: 'critical',
    explanation: 'SHA256 hash matches a Cobalt Strike beacon variant (Version 4.x) confirmed by 58/71 VirusTotal engines. Uses reflective DLL injection (T1055.001) and malleable C2 profiles over HTTPS port 443 to evade detection. JA3 fingerprint matches known CS infrastructure.',
    mitigations: ['Quarantine affected endpoint and isolate from network immediately', 'Block C2 IPs 198.98.51.189 and 77.88.55.66 at firewall', 'Revoke all credentials and tokens on compromised host', 'Initiate full incident response and forensic investigation'],
    recommendations: ['Deploy EDR solution with behavioral analysis capabilities', 'Implement network traffic analysis for anomalous TLS patterns', 'Enable application allowlisting to prevent unauthorized code execution', 'Conduct threat hunting across all endpoints for same indicators'],
    iocs: ['sha256:4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b', '198.98.51.189:443 (C2)', 'JA3: 769,47-53-5-10-49161...', 'Cobalt Strike 4.x watermark: 0x5e5b89'],
    confidence: 99,
  },
  email: {
    attackType: 'Business Email Compromise (BEC) — T1566.001',
    severity: 'high',
    explanation: 'Email header analysis reveals sender spoofing — legitimate display name with malicious sending server mail.compromised-relay.ru. SPF, DKIM, and DMARC all FAIL. Email body uses urgency manipulation requesting immediate wire transfer — classic BEC pattern targeting CFO fraud.',
    mitigations: ['Do NOT process the requested wire transfer under any circumstances', 'Quarantine email and report to IT Security immediately', 'Verify with CFO via out-of-band phone call using known number', 'Report to FBI IC3 and notify financial institution'],
    recommendations: ['Enforce DMARC reject policy: p=reject on your domain', 'Implement mandatory dual-approval for all wire transfers over $5,000', 'Deploy AI-based email security gateway with BEC detection', 'Conduct BEC awareness training for finance department'],
    iocs: ['mail.compromised-relay.ru (sending server)', 'Reply-To: cfo-urgent@protonmail.com', 'SPF: FAIL | DKIM: FAIL | DMARC: FAIL', 'X-Originating-IP: 77.88.21.33 (RU)'],
    confidence: 91,
  },
};

const callAI = async (inputType, inputData) => {
  const start = Date.now();

  // If OpenAI key is configured, use real AI
  if (process.env.OPENAI_API_KEY) {
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Input type: ${inputType}\n\nData to analyze:\n${inputData.slice(0, 4000)}` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });
    const result = JSON.parse(completion.choices[0].message.content);
    return { result, latencyMs: Date.now() - start, model: 'gpt-4o' };
  }

  // Demo mode: simulate latency and return realistic mock
  await new Promise((r) => setTimeout(r, 800));
  const demoKey = Object.keys(DEMO_RESPONSES).find((k) => inputType.includes(k)) || 'log';
  return { result: DEMO_RESPONSES[demoKey], latencyMs: Date.now() - start, model: 'demo' };
};

// POST /api/analysis/analyze
exports.analyze = async (req, res, next) => {
  try {
    const { inputType, inputData } = req.body;
    if (!inputType || !inputData)
      return res.status(400).json({ error: 'inputType and inputData are required' });
    if (!['log', 'url', 'hash', 'email'].includes(inputType))
      return res.status(400).json({ error: 'inputType must be log, url, hash, or email' });

    const { result, latencyMs, model } = await callAI(inputType, inputData);

    // Save report
    const report = await AnalysisReport.create({
      userId: req.user?._id,
      inputType,
      inputData: inputData.slice(0, 2000),
      aiResponse: result,
      model,
      latencyMs,
    });

    // Auto-create threat if severity is critical or high
    if (['critical', 'high'].includes(result.severity)) {
      await Threat.create({
        type: result.attackType,
        severity: result.severity,
        description: result.explanation,
        iocs: result.iocs,
        mitigations: result.mitigations,
        status: 'new',
      });
    }

    res.json({ report, analysis: result, latencyMs, model });
  } catch (err) {
    next(err);
  }
};

// GET /api/analysis/reports
exports.getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const reports = await AnalysisReport.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'username email');
    const total = await AnalysisReport.countDocuments();
    res.json({ reports, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
