/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',    // iPhone SE
        'sm': '640px',    // Small devices
        'md': '768px',    // Tablets
        'lg': '1024px',   // Desktop
        'xl': '1280px',   // Large desktop
        '2xl': '1536px',  // Extra large
      },
      colors: {
        bg: {
          app: '#000000',
          panel: '#1c1c1e',
          elevated: '#2c2c2e',
          input: '#1c1c1e',
          hover: '#2c2c2e',
          // Glassmorphism layers
          glass: {
            light: 'rgba(28, 28, 30, 0.8)',
            medium: 'rgba(44, 44, 46, 0.9)',
            heavy: 'rgba(60, 60, 62, 0.95)',
          },
        },
        text: {
          primary: '#ffffff',
          secondary: '#98989d',
          tertiary: '#636366',
          inverse: '#000000',
        },
        accent: {
          yellow: '#ffd60a',
          blue: '#0a84ff',
          green: '#32d74b',
          red: '#ff453a',
          orange: '#ff9500',
          purple: '#bf5af2',
          pink: '#ff375f',
        },
        border: {
          DEFAULT: '#38383a',
          subtle: '#2c2c2e',
          focus: '#0a84ff',
        },
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        button: '8px',
        modal: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.3)',
        modal: '0 10px 40px rgba(0, 0, 0, 0.5)',
        hover: '0 4px 12px rgba(0, 0, 0, 0.4)',
        lift: '0 8px 24px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px rgba(255, 214, 10, 0.3)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      backdropSaturate: {
        100: '1',
        150: '1.5',
        200: '2',
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        250: '250ms',
        350: '350ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'snappy': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-soft': 'pulse-soft 1.5s ease-in-out infinite',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-yellow': 'linear-gradient(135deg, #ffd60a 0%, #ff9500 100%)',
        'gradient-blue': 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
        'gradient-green': 'linear-gradient(135deg, #32d74b 0%, #30d158 100%)',
      },
    },
  },
  plugins: [],
}
