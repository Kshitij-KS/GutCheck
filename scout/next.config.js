// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',   // Required for Cloud Run Docker deployment
  serverExternalPackages: ['pdf-parse'],
};

module.exports = nextConfig;
