import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#0A0A12',
          2: '#12111C',
        },
        violet: { DEFAULT: '#7C5CFC', 2: '#5C3AF0' },
        coral: '#FF4D8D',
        lime: '#C6FF4D',
        amber: '#FFB020',
        cyan: '#3EE6E0',
        ink: {
          DEFAULT: '#F5F3FF',
          dim: '#B7AFD9',
          mute: '#6E6890',
        },
        card: 'rgba(255,255,255,0.045)',
        'card-border': 'rgba(255,255,255,0.09)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'quest-gradient': 'linear-gradient(135deg, #7C5CFC 0%, #FF4D8D 100%)',
        'lime-gradient': 'linear-gradient(135deg, #9FFF4D 0%, #C6FF4D 100%)',
        'glow-gradient': 'radial-gradient(circle at 30% 20%, rgba(124,92,252,0.35), transparent 60%)',
      },
      borderRadius: {
        card: '22px',
        pill: '999px',
      },
      boxShadow: {
        'quest-glow': '0 10px 30px -8px rgba(124,92,252,0.55)',
        'lime-glow': '0 0 12px rgba(198,255,77,0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
