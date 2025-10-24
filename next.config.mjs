/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Turbopack 설정 (Next.js 16+)
  experimental: {
    turbo: {
      // Turbopack은 기본적으로 Fast Refresh와 파일 감시가 최적화되어 있음
    },
  },
}

export default nextConfig
