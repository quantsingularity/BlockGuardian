/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        // Only lint during development, not during production build
        ignoreDuringBuilds: false,
    },
    images: {
        unoptimized: true,
    },
};

module.exports = nextConfig;
