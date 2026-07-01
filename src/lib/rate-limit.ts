import { json, sha256Hex } from './security';

export async function rateLimit(request: Request, env: Env, scope: string, limit = 30, windowSeconds = 60) {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const key = `rate:${scope}:${await sha256Hex(ip)}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;
  const current = Number((await env.NEWS_KV.get(key)) || '0') + 1;
  await env.NEWS_KV.put(key, String(current), { expirationTtl: windowSeconds + 10 });
  if (current > limit) return json({ error: 'rate limit exceeded', scope, retryAfter: windowSeconds }, { status: 429, headers: { 'retry-after': String(windowSeconds) } });
  return null;
}
