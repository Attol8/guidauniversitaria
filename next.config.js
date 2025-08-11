/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase, { defaultConfig }) => {
  // Load environment-specific .env files
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    require('dotenv').config({ path: '.env.local' });
  } else {
    require('dotenv').config({ path: '.env.production' });
  }

  const nextConfig = {
    ...defaultConfig,          // <-- spread FIRST
    images: {
      domains: ["localhost", "picsum.photos", "via.placeholder.com"],
      remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", port: "" }],
    },
  };

  return nextConfig; // Return the combined configuration
};
