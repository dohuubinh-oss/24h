/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'http://localhost:5000/api/:path*', // Proxy to Backend API
          },
        ];
    },
    devIndicators: {
        allowedDevOrigins: ['https://3000-firebase-toan24h-1772095691165.cluster-y3k7ko3fang56qzieg3trwgyfg.cloudworkstations.dev'],
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
            port: '',
            pathname: '**',
          },
        ],
    },
};

export default nextConfig;
