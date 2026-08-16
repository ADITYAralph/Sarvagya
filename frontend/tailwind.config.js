/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
                nvidia: {
                    green: "#f05e38",
                    black: "#1c1c1a",
                    "deep-slate": "#ffffff",
                    "charcoal-light": "#fcfbfa",
                    gray: "#6e6d6a",
                    white: "#1c1c1a",
                },
                neon: {
                    DEFAULT: "#f05e38",
                    light: "#ff7c5c",
                    dim: "#d04622",
                    glow: "rgba(240, 94, 56, 0.15)",
                },
                canvas: {
                    DEFAULT: "#f6f5f2",
                    light: "#fbfaf8",
                    surface: "#ffffff",
                    "surface-hover": "#fcfbfa",
                    elevated: "#ffffff",
                },
            },
            animation: {
                'shimmer': 'shimmer 2s infinite linear',
                'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'border-glow': 'border-glow 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'fade-in': 'fade-in 0.6s ease-out',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 15px rgba(118, 185, 0, 0.2), 0 0 30px rgba(118, 185, 0, 0.1)' },
                    '50%': { boxShadow: '0 0 25px rgba(118, 185, 0, 0.4), 0 0 50px rgba(118, 185, 0, 0.2)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-6px)' },
                },
                'border-glow': {
                    '0%, 100%': { borderColor: 'rgba(118, 185, 0, 0.2)' },
                    '50%': { borderColor: 'rgba(118, 185, 0, 0.5)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(16px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            boxShadow: {
                'neon': '0 0 15px rgba(240, 94, 56, 0.25)',
                'neon-lg': '0 0 30px rgba(240, 94, 56, 0.2), 0 0 60px rgba(240, 94, 56, 0.08)',
                'neon-sm': '0 0 8px rgba(240, 94, 56, 0.15)',
                'glass': '0 8px 30px rgba(0, 0, 0, 0.03)',
                'glass-lg': '0 16px 40px rgba(0, 0, 0, 0.05)',
                'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            },
            backgroundImage: {
                'mesh-gradient': 'radial-gradient(at 20% 80%, rgba(240, 94, 56, 0.03) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(99, 102, 241, 0.02) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(240, 94, 56, 0.01) 0%, transparent 70%)',
                'mesh-subtle': 'radial-gradient(at 0% 100%, rgba(240, 94, 56, 0.02) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.01) 0%, transparent 50%)',
            },
        },
    },
    plugins: [],
};