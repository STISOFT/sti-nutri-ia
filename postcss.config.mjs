/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind CSS v4 usa @tailwindcss/postcss (no el plugin tailwindcss de v3)
    '@tailwindcss/postcss': {},
  },
};

export default config;
