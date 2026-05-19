import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  turbopack: {
    root: __dirname,
  },
  
  // Server configuration for long-running API routes
  // Note: API route timeout is configured in the route file itself using export const maxDuration = 300
  
  // Experimental features
  experimental: {
    // Turbopack is now the default build system in Next.js 16
  },
  
  // Proxy all API calls to the Go backend
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_GATEWAY_URL is required but not set');
    }
    return [
      // API routes are handled by Next.js App Router (defined in src/app/api/)
      // Only proxy unmatched paths to gateway
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
      // Health check endpoint (public, no auth required)
      {
        source: '/health',
        destination: `${apiUrl}/health`,
      },
    ];
  },
  
  // Security headers including Content Security Policy
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isDevelopment
              ? [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed for dev
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: blob: https:",
                  "font-src 'self' data:",
                  "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*",
                  "media-src 'self' blob: data:",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "frame-ancestors 'none'",
                  "upgrade-insecure-requests",
                ].join('; ')
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline'", // unsafe-inline for Next.js inline scripts
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: blob: https:",
                  "font-src 'self' data:",
                  "connect-src 'self' https://*.lexiassist.com wss://*.lexiassist.com",
                  "media-src 'self' blob: data:",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "frame-ancestors 'none'",
                  "upgrade-insecure-requests",
                ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
          ...(!isDevelopment ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }] : []),
        ],
      },
    ];
  },
  
  // Image optimization remote patterns — built dynamically from env vars at build time
  images: {
    remotePatterns: (() => {
      const patterns: { protocol: 'http' | 'https'; hostname: string; port?: string; pathname?: string }[] = [];

      // Derive pattern from API gateway URL (for API-served avatars/assets)
      const apiUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
      if (apiUrl) {
        try {
          const url = new URL(apiUrl);
          patterns.push({
            protocol: url.protocol.replace(':', '') as 'http' | 'https',
            hostname: url.hostname,
            ...(url.port ? { port: url.port } : {}),
          });
        } catch {
          /* ignore invalid URL */
        }
      }

      // Optional external CDN for user uploads (S3, CloudFront, etc.)
      const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
      if (cdnUrl) {
        try {
          const url = new URL(cdnUrl);
          patterns.push({
            protocol: url.protocol.replace(':', '') as 'http' | 'https',
            hostname: url.hostname,
            ...(url.port ? { port: url.port } : {}),
            ...(url.pathname && url.pathname !== '/' ? { pathname: `${url.pathname}/**` } : {}),
          });
        } catch {
          /* ignore invalid URL */
        }
      }

      return patterns;
    })(),
  },
  
  // Disable strict mode in development for better debugging
  reactStrictMode: true,
};

export default nextConfig;
