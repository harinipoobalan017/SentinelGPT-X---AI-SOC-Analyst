/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        display: ['"Instrument Serif"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: "hsl(var(--bg))",
        surface: "hsl(var(--surface))",
        "text-primary": "hsl(var(--text))",
        muted: "hsl(var(--muted))",
        stroke: "hsl(var(--stroke))",
        accent: "hsl(var(--accent))",
        // Cybersecurity palette
        threat: {
          critical: '#FF3B30',
          high: '#FF9500',
          medium: '#FFCC00',
          low: '#34C759',
          info: '#007AFF',
        },
        cyber: {
          blue: '#89AACC',
          'blue-light': '#4E85BF',
          green: '#00FF87',
          'green-dim': '#00CC6A',
          red: '#FF3B30',
          purple: '#BF5AF2',
          teal: '#32ADE6',
        },
      },
      animation: {
        'scroll-down': 'scroll-down 1.5s ease-in-out infinite',
        'role-fade-in': 'role-fade-in 0.4s ease-out',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'spin-slow': 'spin 8s linear infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        'scroll-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(200%)', opacity: '0' },
        },
        'role-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(137,170,204,0.3)',
        'glow-red': '0 0 20px rgba(255,59,48,0.4)',
        'glow-green': '0 0 20px rgba(0,255,135,0.3)',
      },
    },
  },
  plugins: [],
}