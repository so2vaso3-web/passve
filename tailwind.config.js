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
        // Modern Dark Mode 2025 Colors with gradients
        'dark-bg': '#0A0E27',        // Background chính - tối hơn một chút
        'dark-bg-secondary': '#0F172A', // Background phụ
        'dark-card': '#1E293B',      // Card/container
        'dark-card-hover': '#263548', // Card hover state
        'dark-card-bright': '#243447', // Card sáng hơn cho input
        'dark-card-glass': 'rgba(30, 41, 59, 0.7)', // Glass morphism
        'dark-border': '#475569',    // Viền sáng hơn để dễ nhìn
        'dark-border-hover': '#64748B', // Border hover
        'dark-text': '#F1F5F9',      // Chữ chính
        'dark-text2': '#CBD5E1',     // Chữ phụ sáng hơn
        'dark-text3': '#94A3B8',     // Chữ phụ tối hơn
        // Modern Gradient Accents
        'neon-green': '#10B981',      // Accent xanh lá neon
        'neon-green-light': '#34D399', // Hover xanh lá sáng
        'neon-green-dark': '#059669',  // Dark variant
        'neon-blue': '#3B82F6',       // Blue accent for variety
        'neon-purple': '#8B5CF6',     // Purple accent
        'neon-glow': 'rgba(16, 185, 129, 0.3)', // Glow effect
        'neon-glow-strong': 'rgba(16, 185, 129, 0.5)', // Strong glow
      },
      fontFamily: {
        heading: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        'gradient-primary-dark': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
        'gradient-radial': 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        'mesh-gradient': 'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.2) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(52, 211, 153, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.1)',
        'neon-sm': '0 0 10px rgba(16, 185, 129, 0.2)',
        'neon-lg': '0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(16, 185, 129, 0.2)',
        'glow': '0 0 15px rgba(52, 211, 153, 0.4)',
        'glow-strong': '0 0 25px rgba(52, 211, 153, 0.6), 0 0 50px rgba(52, 211, 153, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.2)',
        'card-elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'inner-glow': 'inset 0 0 20px rgba(16, 185, 129, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'gradient': 'gradient 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), 0 0 30px rgba(16, 185, 129, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}

