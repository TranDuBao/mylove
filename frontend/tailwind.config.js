/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color, #FF5C93)',
        secondary: 'var(--secondary-color, #FF8FB1)',
        accent: 'var(--accent-color, #FF4D88)',
        text: 'var(--text-color, #5C3A47)',
      },
      fontFamily: {
        sans: ['Nunito', 'Poppins', 'sans-serif'],
        handwriting: ['var(--handwriting-font, "Dancing Script", cursive)', 'cursive'],
      },
      animation: {
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'aurora': 'aurora 15s ease infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.05)' },
          '35%': { transform: 'scale(1.02)' },
          '45%': { transform: 'scale(1.08)' },
        },
        aurora: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px var(--primary-color))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 30px var(--primary-color))' },
        }
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
