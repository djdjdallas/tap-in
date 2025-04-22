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
  // Remove the unstable_excludeFiles option as it's not supported
};

export default nextConfig;
