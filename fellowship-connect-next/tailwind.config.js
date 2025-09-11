/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

const tailwindConfig = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bright-cobalt': '#3C6098',
        'patience': '#E6DDD6',
        'silver-bird': '#FBF5F0',
        'dancing-mist': '#BFC8D8',
        'fibonacci-blue': '#112358',
        'aegean-sky': '#E48B59',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [
    forms,
    typography,
  ],
  // Disable Tailwind's preflight to avoid conflicts with Bootstrap
  corePlugins: {
    preflight: false,
  }
};

export default tailwindConfig;