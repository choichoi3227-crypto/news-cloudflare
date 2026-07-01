// src/pages/api/newsletter/subscribe.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { rateLimit } from '../../../lib/rate-limit';
import { clampText, json, sha256Hex } from '../../../lib/security';
const env = cfEnv as unknown as Env;
export const POST: APIRoute = async ({ request, locals }) => { const limited = await rateLimit(request, env, 'newsletter', 10, 300); if (limited) return limited; const body = await request.json() as { email?: string; source?: string }; const email = clampText(body.email, 254).toLowerCase(); if (!email.includes('@')) return json({ error: 'valid email required' }, { status: 400 }); const id = await sha256Hex(email); await env.DB.prepare('INSERT INTO newsletter_subscribers (id, email, source, status, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at').bind(id, email, clampText(body.source || 'site', 80), 'active', new Date().toISOString()).run(); return json({ ok: true, id }); };
