/** @type {import('next').NextConfig} */
const nextConfig = {
     images: {
        remotePatterns: [
        {
            protocol: 'https',
            hostname: 'foremost-product-2025.s3.ap-southeast-1.amazonaws.com',
            pathname: '/img-product/**',
        },
        ],
    },
};

export default nextConfig;
