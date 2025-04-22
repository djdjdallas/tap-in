/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enhanced experimental settings for improved performance
  experimental: {
    optimizeFonts: true,
    optimizeCss: true,
    scrollRestoration: true,
    legacyBrowsers: false,
  },

  // Static page generation timeout increased
  staticPageGenerationTimeout: 180,

  // Improve mobile loading time with smaller chunks
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Simplified rewrites
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/:path*",
      },
    ];
  },

  // Cache static pages more aggressively
  async headers() {
    return [
      {
        source: "/:username",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        // Additional caching for static assets
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
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
    // Improve image loading performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
  },

  // Turn off trailing slash
  trailingSlash: false,

  // React strict mode for better development
  reactStrictMode: true,

  // Improve initial load performance
  poweredByHeader: false,

  // Add compression for better mobile performance
  compress: true,
};

export default nextConfig;
