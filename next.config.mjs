/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/schools/budget',
        destination: '/schools/finances',
        permanent: true,
      },
      {
        source: '/elections/2026',
        destination: '/elections/2027',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
