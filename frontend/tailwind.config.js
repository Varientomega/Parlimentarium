/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                colors: {
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        },
                        // Modern futuristic color palette
                        glass: {
                                100: 'rgba(255, 255, 255, 0.05)',
                                200: 'rgba(255, 255, 255, 0.1)',
                                300: 'rgba(255, 255, 255, 0.15)',
                                400: 'rgba(255, 255, 255, 0.2)',
                                500: 'rgba(255, 255, 255, 0.25)',
                        },
                        neon: {
                                blue: '#00d4ff',
                                purple: '#8b5cf6',
                                pink: '#ff006e',
                                green: '#39ff14',
                                orange: '#ff8c00',
                                cyan: '#00ffff',
                        },
                        cyber: {
                                dark: '#0a0a0b',
                                darker: '#060607',
                                light: '#1a1a1d',
                                accent: '#2d2d30',
                        }
                },
                backdropBlur: {
                        xs: '2px',
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out',
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'float': 'float 6s ease-in-out infinite',
                        'glow': 'glow 2s ease-in-out infinite alternate',
                        'shimmer': 'shimmer 2s linear infinite',
                        'slide-up': 'slide-up 0.5s ease-out',
                        'slide-down': 'slide-down 0.5s ease-out',
                        'fade-in': 'fade-in 0.6s ease-out',
                        'scale-in': 'scale-in 0.4s ease-out',
                },
                keyframes: {
                        'accordion-down': {
                                from: { height: '0' },
                                to: { height: 'var(--radix-accordion-content-height)' }
                        },
                        'accordion-up': {
                                from: { height: 'var(--radix-accordion-content-height)' },
                                to: { height: '0' }
                        },
                        'float': {
                                '0%, 100%': { transform: 'translateY(0px)' },
                                '50%': { transform: 'translateY(-10px)' }
                        },
                        'glow': {
                                '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
                                '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.6)' }
                        },
                        'shimmer': {
                                '0%': { backgroundPosition: '-200% center' },
                                '100%': { backgroundPosition: '200% center' }
                        },
                        'slide-up': {
                                '0%': { transform: 'translateY(20px)', opacity: '0' },
                                '100%': { transform: 'translateY(0)', opacity: '1' }
                        },
                        'slide-down': {
                                '0%': { transform: 'translateY(-20px)', opacity: '0' },
                                '100%': { transform: 'translateY(0)', opacity: '1' }
                        },
                        'fade-in': {
                                '0%': { opacity: '0' },
                                '100%': { opacity: '1' }
                        },
                        'scale-in': {
                                '0%': { transform: 'scale(0.95)', opacity: '0' },
                                '100%': { transform: 'scale(1)', opacity: '1' }
                        }
                },
                boxShadow: {
                        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                        'neon': '0 0 5px currentColor, 0 0 20px currentColor, 0 0 40px currentColor',
                        'cyber': '0 0 20px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(139, 92, 246, 0.1)',
                        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
                },
                fontFamily: {
                        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
                        'display': ['Inter Display', 'Inter', 'system-ui', 'sans-serif'],
                        'body': ['Inter', 'system-ui', 'sans-serif'],
                },
                backgroundImage: {
                        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                        'cyber-grid': 'linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
                        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                },
                backgroundSize: {
                        'cyber-grid': '20px 20px',
                },
                spacing: {
                        '18': '4.5rem',
                        '88': '22rem',
                },
        }
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }) {
      addUtilities({
        '.glass-effect': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.3)',
          'backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.cyber-border': {
          'border': '1px solid transparent',
          'background': 'linear-gradient(90deg, rgba(139, 92, 246, 0.4), rgba(0, 212, 255, 0.4)) border-box',
          '-webkit-mask': 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          '-webkit-mask-composite': 'xor',
          'mask-composite': 'exclude',
        },
        '.text-shimmer': {
          'background': 'linear-gradient(90deg, #fff 25%, rgba(255,255,255,0.5) 50%, #fff 75%)',
          'background-size': '200% auto',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'animation': 'shimmer 2s linear infinite',
        },
        '.hover-lift': {
          'transition': 'transform 0.3s ease, box-shadow 0.3s ease',
        },
        '.hover-lift:hover': {
          'transform': 'translateY(-4px) scale(1.02)',
          'box-shadow': '0 20px 40px rgba(139, 92, 246, 0.3)',
        },
      })
    }
  ],
};