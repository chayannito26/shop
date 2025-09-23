/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom theme colors using CSS variables
        theme: {
          'bg-primary': 'rgb(var(--color-bg-primary) / <alpha-value>)',
          'bg-secondary': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          'bg-tertiary': 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
          'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
          'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
          'text-tertiary': 'rgb(var(--color-text-tertiary) / <alpha-value>)',
          'border': 'rgb(var(--color-border) / <alpha-value>)',
          'border-hover': 'rgb(var(--color-border-hover) / <alpha-value>)',
          'accent': 'rgb(var(--color-accent) / <alpha-value>)',
          'accent-hover': 'rgb(var(--color-accent-hover) / <alpha-value>)',
          'accent-light': 'rgb(var(--color-accent-light) / <alpha-value>)',
          'success': 'rgb(var(--color-success) / <alpha-value>)',
          'warning': 'rgb(var(--color-warning) / <alpha-value>)',
          'error': 'rgb(var(--color-error) / <alpha-value>)',
          'error-light': 'rgb(var(--color-error-light) / <alpha-value>)',
        }
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
      }
    },
  },
  plugins: [],
};
