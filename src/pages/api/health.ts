// src/pages/api/health.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { json } from '../../lib/security';
const env = cfEnv as unknown as Env;
export const GET: APIRoute = async ({ locals }) => { const started = Date.now(); try { await env.DB.prepare('SELECT 1 ok').first(); await env.NEWS_KV.put('health:last', new Date().toISOString(), { expirationTtl: 120 }); return json({ ok: true, services: { d1: true, kv: true, durableObjects: Boolean(env.TRAFFIC_DO) }, latencyMs: Date.now() - started }); } catch (error) { return json({ ok: false, error: error instanceof Error ? error.message : 'unknown' }, { status: 503 }); } };
