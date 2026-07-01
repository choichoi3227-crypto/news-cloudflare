// src/pages/api/notifications/subscribe.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { json, sha256Hex } from '../../../lib/security';
const env = cfEnv as unknown as Env;
export const POST: APIRoute = async ({ request, locals }) => { const body = await request.json() as { endpoint?: string; keys?: unknown; minViews?: number }; if (!body.endpoint || !body.keys) return json({ error: 'endpoint and keys required' }, { status: 400 }); const id = await sha256Hex(body.endpoint); await env.DB.prepare('INSERT INTO push_subscriptions (id, endpoint, keys_json, min_views, enabled, updated_at) VALUES (?, ?, ?, ?, 1, ?) ON CONFLICT(endpoint) DO UPDATE SET keys_json = excluded.keys_json, min_views = excluded.min_views, enabled = 1, updated_at = excluded.updated_at').bind(id, body.endpoint, JSON.stringify(body.keys), body.minViews || 1000, new Date().toISOString()).run(); return json({ ok: true, id }); };
