/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          app: '#000000',
          panel: '#1c1c1e',
          elevated: '#2c2c2e',
          input: '#1c1c1e',
          hover: '#2c2c2e',
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
      },
    },
  },
  plugins: [],
}
