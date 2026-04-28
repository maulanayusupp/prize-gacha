import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app/**/*.{vue,js,ts}',
    './app/components/**/*.{vue,js,ts}',
    './app/pages/**/*.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bungee', 'cursive'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#ffd700',
          light: '#fff700',
          dark: '#ff8c00',
        },
        rarity: {
          common: '#cccccc',
          uncommon: '#00c864',
          rare: '#0096ff',
          epic: '#b400ff',
          legendary: '#ff8c00',
          mythic: '#ff006e',
        },
        bg: {
          deep: '#0a0418',
          mid: '#1a0b2e',
          purple: '#2a0f4f',
        },
      },
      animation: {
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'logo-glow': 'logoGlow 2s ease-in-out infinite alternate',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'rotate-slow': 'spin 8s linear infinite',
        'rotate-fast': 'spin 4s linear infinite',
        'drift': 'drift 60s linear infinite',
        'float-up': 'float-up 8s linear infinite',
        'icon-reveal': 'iconReveal 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'amount-reveal': 'amountReveal 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both',
        'badge-pop': 'badgePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'legendary-pulse': 'legendaryPulse 1.2s infinite',
        'mythic-shine': 'mythicShine 2s infinite',
      },
      keyframes: {
        logoGlow: {
          '0%': { filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' },
          '100%': { filter: 'drop-shadow(0 0 25px rgba(255,165,0,0.9))' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        drift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-1000px)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(110vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.4' },
          '90%': { opacity: '0.4' },
          '100%': { transform: 'translateY(-10vh) rotate(360deg)', opacity: '0' },
        },
        iconReveal: {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        amountReveal: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        badgePop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        legendaryPulse: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(255,140,0,0.6)' },
          '50%': { boxShadow: '0 0 20px rgba(255,140,0,0.8)' },
        },
        mythicShine: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.3)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #ffd700, #ff8c00)',
        'amount-gradient': 'linear-gradient(180deg, #fff700 0%, #ffa500 50%, #ff6b00 100%)',
        'roll-gradient': 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
        'mythic-gradient': 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
        'app-bg': 'radial-gradient(ellipse at top, #1a0b2e 0%, #0a0418 60%, #000 100%)',
      },
    },
  },
}
