/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './containers/**/*.{js,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        display: ['Anton_400Regular'],
        brutal: ['BebasNeue_400Regular'],
        ops: ['BlackOpsOne_400Regular'],
        mono: ['SpaceMono_400Regular'],
        'mono-bold': ['SpaceMono_700Bold'],
      },
      colors: {
        black: '#0A0A0A',
        white: '#FAFAFA',
        pink: '#FF2E63',
        green: '#BAFF29',
        blue: '#00D4FF',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        info: {
          DEFAULT: 'var(--info)',
          foreground: 'var(--info-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--surface-foreground)',
        },
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0 #FF2E63',
        'brutal-md': '4px 4px 0 #FF2E63',
        'brutal-lg': '6px 6px 0 #FF2E63',
        'brutal-xl': '8px 8px 0 #FF2E63',
        'brutal-sm-black': '2px 2px 0 #0A0A0A',
        'brutal-md-black': '4px 4px 0 #0A0A0A',
        'brutal-lg-black': '6px 6px 0 #0A0A0A',
        'brutal-xl-black': '8px 8px 0 #0A0A0A',
        'brutal-sm-green': '2px 2px 0 #BAFF29',
        'brutal-md-green': '4px 4px 0 #BAFF29',
        'brutal-lg-green': '6px 6px 0 #BAFF29',
        'brutal-xl-green': '8px 8px 0 #BAFF29',
        none: 'none',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
