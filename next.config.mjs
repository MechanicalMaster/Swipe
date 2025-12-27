/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    // Build-time flag for Diagnostics feature
    // Set to 'true' to include diagnostics in the build
    NEXT_PUBLIC_ENABLE_DIAGNOSTICS: process.env.NEXT_PUBLIC_ENABLE_DIAGNOSTICS || '',
  },
};

export default nextConfig;

