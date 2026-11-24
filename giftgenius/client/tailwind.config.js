/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette, refined from the brief for better contrast and cohesion
        lavender: {
          50: '#F6F3FF',
          100: '#EDE7FE',
          200: '#DDD3FD',
          300: '#C4B3FB',
          400: '#A78BFA', // brand primary
          500: '#8B6CF0',
          600: '#7551D9',
        },
        blush: {
          50: '#FFF1F7',
          100: '#FDE4EF',
          200: '#FBCFE2',
          300: '#F9A8D4', // brand secondary
          400: '#F27BB8',
        },
        cream: {
          DEFAULT: '#FFFBF5',
          dark: '#F7F0E4',
        },
        plum: {
          400: '#7A5C98',
          500: '#664A82',
          600: '#553C6E', // brand accent
          700: '#43305A',
          800: '#322344',
        },
        ink: '#292533',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(85, 60, 110, 0.12)',
        lift: '0 12px 36px -10px rgba(85, 60, 110, 0.22)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
