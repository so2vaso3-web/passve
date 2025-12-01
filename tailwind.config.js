/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Dark Mode 2025 Colors
        'dark-bg': '#0F172A',        // Background chính
        'dark-card': '#1E293B',      // Card/container
        'dark-card-bright': '#243447', // Card sáng hơn cho input
        'dark-border': '#475569',    // Viền sáng hơn để dễ nhìn
        'dark-text': '#F1F5F9',      // Chữ chính
        'dark-text2': '#CBD5E1',     // Chữ phụ sáng hơn
        'neon-green': '#10B981',      // Accent xanh lá neon
        'neon-green-light': '#34D399', // Hover xanh lá sáng
        'neon-glow': 'rgba(16, 185, 129, 0.2)', // Glow effect
      },
      fontFamily: {
        heading: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.1)',
        'neon-sm': '0 0 10px rgba(16, 185, 129, 0.2)',
        'glow': '0 0 15px rgba(52, 211, 153, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'cardHover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), 0 0 30px rgba(16, 185, 129, 0.2)' },
        },
      },
    },
  },
  plugins: [],
}

