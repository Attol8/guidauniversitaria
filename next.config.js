/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase, { defaultConfig }) => {
  // Load environment-specific .env files
  const envName = process.env.APP_ENV || (phase === PHASE_DEVELOPMENT_SERVER ? 'local' : 'production');
  require('dotenv').config({ path: `.env.${envName}` });

  const nextConfig = {
    ...defaultConfig,
    images: {
      domains: ["localhost", "picsum.photos", "via.placeholder.com"],
      remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", port: "" }],
    },
  };

  return nextConfig;
};
