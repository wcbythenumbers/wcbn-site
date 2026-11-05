/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/schools/budget',
        destination: '/schools/finances',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
