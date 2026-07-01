import { defineMiddleware } from 'astro:middleware';
import { securityHeaders } from './lib/security';

const cachePolicy = (pathname: string) => {
  if (pathname.startsWith('/api/')) return 'no-store';
  if (pathname.endsWith('.xml') || pathname.endsWith('.txt')) return 'public, max-age=300, stale-while-revalidate=600';
  return 'public, max-age=60, stale-while-revalidate=300';
};

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const headers = new Headers(response.headers);
  Object.entries(securityHeaders).forEach(([key, value]) => headers.set(key, value));
  headers.set('cache-control', headers.get('cache-control') || cachePolicy(context.url.pathname));
  headers.set('x-frame-options', 'DENY');
  headers.set('x-newsroom-platform', 'cloudflare-d1-kv-do');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
});
