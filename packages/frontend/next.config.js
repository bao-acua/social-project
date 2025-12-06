/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['shared', 'backend'],
  typescript: {
    // Skip type checking during build (types are checked during development)
    // This is necessary because Next.js tries to check backend source files
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig

