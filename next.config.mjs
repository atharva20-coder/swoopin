/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com', // Handles cdninstagram.com subdomains
      },
      {
        protocol: 'https',
        hostname: 'instagram.frpr5-1.fna.fbcdn.net', // Handles fbcdn.net subdomains
      },
    ],
  },
};

export default nextConfig;
