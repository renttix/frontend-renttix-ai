/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "saasrental.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },

      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: "",
      },
    ],
  },
  reactStrictMode: false,
  
  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Ignore ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ignore TypeScript errors during builds (use with caution)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
