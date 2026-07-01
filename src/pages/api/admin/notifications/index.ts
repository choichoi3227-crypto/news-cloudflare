// src/pages/api/admin/notifications/index.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { assertAdmin, json } from '../../../../lib/security';
const env = cfEnv as unknown as Env;
export const GET: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, env); const rows = await env.DB.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100').all(); return json({ notifications: rows.results }); } catch (e) { if (e instanceof Response) return e; return json({ error: 'failed' }, { status: 500 }); } };
