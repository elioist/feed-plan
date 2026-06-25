/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#fdf6ee',
        surface: '#fffcf8',
        fg: '#2d1f14',
        muted: '#8a7565',
        faint: '#b8a898',
        border: '#e8ddd0',
        accent: '#c45a32',
        'accent-ink': '#8b3a1e',
        chef: '#c45a32',
        'chef-soft': '#fae8df',
        diner: '#8b5fa8',
        'diner-soft': '#f0e8f5',
        herb: '#5a9a6a',
        'herb-soft': '#e8f5eb',
        yolk: '#d4a843',
        'yolk-soft': '#faf3dc',
        morning: '#d4943a',
        'morning-soft': '#fdf0dc',
        noon: '#c45a32',
        'noon-soft': '#fae8df',
        night: '#7a5a9a',
        'night-soft': '#f0e8f5',
      },
      borderRadius: {
        sm: '10px',
        DEFAULT: '16px',
        lg: '22px',
        xl: '28px',
        '2xl': '36px',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'PingFang SC', 'system-ui', 'sans-serif'],
        body: ['PingFang SC', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(60,40,20,0.05), 0 8px 24px rgba(60,40,20,0.08)',
        lg: '0 2px 6px rgba(60,40,20,0.07), 0 18px 44px rgba(60,40,20,0.14)',
      },
    },
  },
  plugins: [],
};
