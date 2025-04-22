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
  // This config tells Next.js to exclude routes from static page generation
  unstable_excludeFiles: ["**/login/page.js", "**/dashboard/**"],
};

export default nextConfig;
