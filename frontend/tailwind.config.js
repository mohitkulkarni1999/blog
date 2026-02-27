import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable dark mode with class
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                dark: {
                    bg: '#0f172a',
                    card: '#1e293b',
                    text: '#f8fafc',
                    border: '#334155'
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
                heading: ['Outfit', 'sans-serif']
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'neon': '0 0 10px rgba(59, 130, 246, 0.5)',
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: theme('colors.gray.800'),
                        a: {
                            color: theme('colors.primary.600'),
                            '&:hover': {
                                color: theme('colors.primary.700'),
                            },
                        },
                        h1: { fontFamily: theme('fontFamily.heading')[0] },
                        h2: { fontFamily: theme('fontFamily.heading')[0] },
                        h3: { fontFamily: theme('fontFamily.heading')[0] },
                        h4: { fontFamily: theme('fontFamily.heading')[0] },
                    },
                },
                dark: {
                    css: {
                        color: theme('colors.gray.200'),
                        a: {
                            color: theme('colors.primary.400'),
                            '&:hover': { color: theme('colors.primary.300') },
                        },
                        h1: { color: theme('colors.gray.100') },
                        h2: { color: theme('colors.gray.100') },
                        h3: { color: theme('colors.gray.100') },
                        h4: { color: theme('colors.gray.100') },
                        strong: { color: theme('colors.gray.100') },
                        code: { color: theme('colors.gray.100') },
                    },
                },
            }),
        },
    },
    plugins: [
        typography,
        forms,
    ],
}
