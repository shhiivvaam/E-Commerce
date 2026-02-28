/** @type {import('next').NextConfig} */
const nextConfig = {
    // Required for minimal Docker images
    output: 'standalone',
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'cdn.prod.website-files.com' },
            { protocol: 'https', hostname: 'static.nike.com' },
            { protocol: 'https', hostname: 'media.endclothing.com' },
            { protocol: 'https', hostname: 'cdn.dribbble.com' },
        ],
    },
};

export default nextConfig;

