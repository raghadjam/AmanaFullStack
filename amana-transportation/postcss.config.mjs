/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    // FIX: Changed from 'tailwindcss' to '@tailwindcss/postcss' 
    // to match the Tailwind CSS v4 requirement and the package.json dependency.
    '@tailwindcss/postcss', 
    'autoprefixer',
  ],
};

export default config;
