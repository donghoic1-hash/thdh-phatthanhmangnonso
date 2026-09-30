/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          primary: '#38A9E8',
          secondary: '#70C8F3',
          light: '#EAF8FF',
          ultralight: '#F6FCFF',
        },
        heading: '#24506B',
        bodyText: '#405866',
        accentYellow: '#FFD76A',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      aspectRatio: {
        '16/9': '16 / 9',
        '1/1': '1 / 1',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(56, 169, 232, 0.12)',
        'card': '0 10px 30px -5px rgba(36, 80, 107, 0.08)',
        'floating': '0 20px 40px -10px rgba(56, 169, 232, 0.2)',
      }
    },
  },
  plugins: [],
}
