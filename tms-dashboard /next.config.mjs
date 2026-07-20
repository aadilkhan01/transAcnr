/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disables the nft trace-collection step that fails in App Router-only projects on Next.js 14
  outputFileTracing: false,
};
export default nextConfig;
