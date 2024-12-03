/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {
      config: './tailwind.config.ts',  // Reference your .ts config file here
    },
    autoprefixer: {},
  },
};

export default config;

