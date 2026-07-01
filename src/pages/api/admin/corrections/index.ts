// src/pages/api/admin/corrections/index.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { assertAdmin, json } from '../../../../lib/security';
const env = cfEnv as unknown as Env;
export const GET: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, env); const rows = await env.DB.prepare('SELECT * FROM correction_requests ORDER BY created_at DESC LIMIT 100').all(); return json({ corrections: rows.results }); } catch (e) { if (e instanceof Response) return e; return json({ error: 'failed' }, { status: 500 }); } };
