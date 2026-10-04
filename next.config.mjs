/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { instrumentationHook: true }, // रोज़ का Telegram बैकअप चलाने के लिए
};

export default nextConfig;
