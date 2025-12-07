import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                'primary-600': 'var(--primary-600)',
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                muted: 'var(--muted)',
                card: 'var(--card)',
                glass: 'var(--glass)',
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
            },
        },
    },
    plugins: [],
};

export default config;
