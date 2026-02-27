/** @type {import('next').NextConfig} */
const nextConfig = {
    // Required for minimal Docker images
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
};

export default nextConfig;

