/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone", // Required for lightweight production Docker containers
};

module.exports = nextConfig;
