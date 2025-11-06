import { authMiddleware } from '@clerk/nextjs';

// This middleware protects all routes except public ones
export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/webhooks/clerk',
    '/api/health',
    '/sign-in(.*)',
    '/sign-up(.*)',
  ],
  ignoredRoutes: ['/api/webhooks/clerk'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
