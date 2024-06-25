/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase, { defaultConfig }) => {
  // Load environment-specific .env files
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    require('dotenv').config({ path: '.env.local' });
  } else {
    require('dotenv').config({ path: '.env.production' });
  }

  // Define custom Next.js configuration
  const nextConfig = {
    images: {
      domains: ["localhost"],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "cdn.sanity.io",
          port: "",
        },
      ],
    },
    ...defaultConfig, // Spread the default configuration
  };

  return nextConfig; // Return the combined configuration
};
