import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/api/',
        '/dashboard',
        '/settings',
        '/chat-assistant',
        '/reading-assistant',
        '/writing-assistant',
        '/text-to-speech',
        '/flashcards',
        '/quizzes',
        '/materials',
        '/goals',
      ],
    },
    sitemap: baseUrl ? `${baseUrl}/sitemap.xml` : undefined,
  };
}
