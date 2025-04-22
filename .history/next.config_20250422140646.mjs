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

  // Simplified rewrites
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/:path*",
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

  // Turn off trailing slash
  trailingSlash: false,

  // React strict mode for better development
  reactStrictMode: true,
};

export default nextConfig;
