/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          canvas: '#F7FBFF',
          sky: '#EAF4FF',
          panel: '#FFFFFF',
          border: '#CFE0EE',
          text: '#355E4B',
          brown: '#6B4F3A',
          blue: '#4B9CD3',
          blueDeep: '#3479A8',
          green: '#6FA67A',
          greenDeep: '#4E7A57',
          sand: '#F3ECE4',
          warning: '#D97757',
          success: '#4F8B64',
          danger: '#C95F5F',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['"Source Sans 3"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 24px 70px -35px rgba(75, 156, 211, 0.35)',
        soft: '0 18px 40px -24px rgba(53, 94, 75, 0.2)',
        card: '0 20px 45px -28px rgba(107, 79, 58, 0.22)',
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(circle at top left, rgba(75, 156, 211, 0.24), transparent 34%), radial-gradient(circle at top right, rgba(111, 166, 122, 0.18), transparent 30%), linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(234, 244, 255, 0.88))',
        'panel-glow':
          'linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(234, 244, 255, 0.92))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.55' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(1.7)', opacity: '0' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
        ripple: 'ripple 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
}
