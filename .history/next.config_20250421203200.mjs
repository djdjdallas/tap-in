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
  // Add this option to skip server-side generation for pages with client components
  staticPageGenerationTimeout: 120,
  // Add redirects for custom routes
  async redirects() {
    return [
      {
        source: "/u/:username",
        destination: "/:username",
        permanent: true,
      },
    ];
  },
  // Explicitly enable app directory
  reactStrictMode: true,
};

export default nextConfig;
