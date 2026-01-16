/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Inter', 'Noto Sans SC', 'sans-serif'],
        body: ['Inter', 'Noto Sans SC', 'sans-serif'],
      },
      colors: {
        // 4色配色方案：专业金融仪表盘
        primary: {
          DEFAULT: '#3B82F6', // Trust Blue
          light: '#60A5FA',
          dark: '#2563EB',
        },
        accent: {
          DEFAULT: '#8B5CF6', // Purple accent
          light: '#A78BFA',
          dark: '#7C3AED',
        },
        success: '#10B981', // 利好绿
        warning: '#F59E0B',
        danger: '#EF4444',  // 利空红
        background: {
          DEFAULT: '#F8FAFC',
          dark: '#0F172A',
          card: '#FFFFFF',
        },
        text: {
          DEFAULT: '#1E293B',
          muted: '#475569',
          light: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          dark: '#334155',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 2px 6px -2px rgba(0, 0, 0, 0.08)',
        'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
