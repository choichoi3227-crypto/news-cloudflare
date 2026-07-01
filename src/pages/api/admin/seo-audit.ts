// src/pages/api/admin/seo-audit.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { seoScore } from '../../../lib/seo';
import { assertAdmin, json } from '../../../lib/security';
const env = cfEnv as unknown as Env;
type Body = { title?: unknown; description?: unknown; body?: unknown; focusKeyword?: string };
export const POST: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, env); const body = await request.json() as Body; return json(seoScore({ title: String(body.title || ''), description: String(body.description || ''), body: String(body.body || ''), focusKeyword: body.focusKeyword })); } catch (e) { if (e instanceof Response) return e; return json({ error: 'failed' }, { status: 500 }); } };
