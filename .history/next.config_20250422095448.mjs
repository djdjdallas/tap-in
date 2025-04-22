/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: false,
  },
  // Static page generation timeout increased
  staticPageGenerationTimeout: 180,

  // Add rewrites for username routes and other patterns
  async rewrites() {
    return [
      // Handle username routes
      {
        source: "/:username",
        destination: "/:username",
        has: [
          {
            type: "host",
            value: "(?:.*)",
          },
        ],
      },
      // Add additional rewrites as needed
    ];
  },

  // Optional: Add redirects for common paths
  async redirects() {
    return [
      {
        source: "/u/:username",
        destination: "/:username",
        permanent: true,
      },
    ];
  },

  // Ensure that all images can be properly loaded
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    domains: ["fgcfzzrmfavqcwslqilf.supabase.co"],
  },

  // Instruct Vercel to treat username routes as dynamic
  trailingSlash: false,

  // React strict mode for better development
  reactStrictMode: true,
};

export default nextConfig;
