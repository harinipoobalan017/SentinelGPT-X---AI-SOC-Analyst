require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Threat = require('./models/Threat');
const AnalysisReport = require('./models/AnalysisReport');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinelgpt';

const sampleThreats = [
  { type: 'SQL Injection', severity: 'critical', sourceIP: '185.220.101.45', country: 'RU', target: '/api/auth', status: 'new', description: 'Classic union-based SQLi attempt on authentication endpoint', iocs: ["185.220.101.45", "' OR 1=1--"], mitigations: ["Block IP", "Parameterize queries"] },
  { type: 'Spear Phishing', severity: 'high', sourceIP: '23.94.56.12', country: 'CN', target: 'user@corp.com', status: 'investigating', description: 'Credential-harvesting email with spoofed paypal.com domain', iocs: ["paypa1.com"], mitigations: ["Block domain"] },
  { type: 'Port Scan', severity: 'medium', sourceIP: '91.108.4.67', country: 'DE', target: '10.0.0.1:1-1024', status: 'new', description: 'Full TCP SYN scan across internal IP range', iocs: [], mitigations: ["Rate limit SYN packets"] },
  { type: 'Brute Force SSH', severity: 'high', sourceIP: '104.21.89.102', country: 'US', target: ':22', status: 'investigating', description: '847 failed login attempts in 3 minutes', iocs: ["104.21.89.102"], mitigations: ["Fail2Ban", "Disable password auth"] },
  { type: 'XSS Attempt', severity: 'medium', sourceIP: '45.33.72.191', country: 'NL', target: '/search?q=', status: 'resolved', description: 'Reflected XSS via search parameter — blocked by WAF', iocs: ["<script>alert(1)</script>"], mitigations: ["WAF rule update"] },
  { type: 'Malware C2 Beacon', severity: 'critical', sourceIP: '198.98.51.189', country: 'IR', target: 'host:8080', status: 'new', description: 'Cobalt Strike beacon traffic identified via JA3 fingerprint', iocs: ["198.98.51.189:8080"], mitigations: ["Quarantine host", "Block C2 IP"] },
  { type: 'Data Exfiltration', severity: 'critical', sourceIP: '77.88.55.66', country: 'RU', target: '/api/export', status: 'investigating', description: 'Unusual outbound data transfer — 2.3GB to unknown endpoint', iocs: ["77.88.55.66"], mitigations: ["Kill network connections"] },
  { type: 'Log4Shell Attempt', severity: 'high', sourceIP: '134.209.82.11', country: 'SG', target: 'User-Agent header', status: 'resolved', description: 'CVE-2021-44228 exploitation attempt — patched endpoint', iocs: ["${jndi:ldap://134.209.82.11/a}"], mitigations: ["Patch log4j"] },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[SEED] Connected to DB.');

    await User.deleteMany({});
    await Threat.deleteMany({});
    await AnalysisReport.deleteMany({});
    console.log('[SEED] Cleared existing data.');

    // Create Admin User
    const admin = await User.create({
      username: 'admin',
      email: 'admin@sentinel.com',
      password: 'password123',
      role: 'admin',
    });
    console.log('[SEED] Created admin user: admin@sentinel.com / password123');

    // Create Threats distributed over the last 24 hours
    const threatsToInsert = [];
    for (let i = 0; i < 40; i++) {
      const template = sampleThreats[Math.floor(Math.random() * sampleThreats.length)];
      
      // Random hour between 0 and 24 hours ago
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - hoursAgo);
      timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

      threatsToInsert.push({
        ...template,
        assignedTo: admin._id,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    await Threat.insertMany(threatsToInsert);
    console.log(`[SEED] Inserted ${threatsToInsert.length} threats.`);

    // Create some analysis reports
    await AnalysisReport.create([
      { userId: admin._id, inputType: 'log', inputData: 'POST /api/auth HTTP/1.1...', aiResponse: { attackType: 'SQLi', severity: 'critical', confidence: 97, explanation: 'SQLi attempt', mitigations: [], recommendations: [], iocs: [] } },
      { userId: admin._id, inputType: 'url', inputData: 'https://paypa1.com', aiResponse: { attackType: 'Phishing', severity: 'high', confidence: 94, explanation: 'Phishing domain', mitigations: [], recommendations: [], iocs: [] } },
    ]);
    console.log('[SEED] Inserted sample analysis reports.');

    console.log('[SEED] Database seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[SEED] Error:', err);
    process.exit(1);
  }
}

seed();
