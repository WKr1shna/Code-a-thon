/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#D72638",
        secondary: "#1A1A2E",
        accent: "#F4A261",
        success: "#2DC653",
        background: "#F8F9FA",
        navy: {
          50: '#f2f2f5',
          100: '#e6e6eb',
          200: '#cccccc',
          300: '#b3b3b8',
          400: '#80808a',
          500: '#4d4d5c',
          600: '#1A1A2E',
          700: '#171729',
          800: '#121220',
          900: '#0d0d17',
        },
        severity: {
          normal: "#2DC653",
          low: "#F4A261",
          medium: "#FF6B35",
          high: "#D72638",
          critical: "#6B0F1A"
        }
      },
      animation: {
        'pulse-fast': 'pulse-critical 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'pulse-critical': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        }
      }
    },
  },
  plugins: [],
}
