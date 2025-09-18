/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove rewrites - let frontend handle API calls directly
  images: {
    domains: ['images.unsplash.com', 'pbs.twimg.com', 'scontent.cdninstagram.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: 'LetsGrow',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Social Media Automation SaaS',
  },
}

module.exports = nextConfig