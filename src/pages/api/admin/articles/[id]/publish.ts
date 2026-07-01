// src/pages/api/admin/articles/[id]/publish.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { publishArticle } from '../../../../../lib/articles';
import { assertAdmin, json } from '../../../../../lib/security';
const env = cfEnv as unknown as Env;
export const POST: APIRoute = async ({ request, locals, params }) => { try { assertAdmin(request, env); if (!params.id) return json({ error: 'id required' }, { status: 400 }); await publishArticle(env, params.id); return json({ ok: true, id: params.id, status: 'published' }); } catch (e) { if (e instanceof Response) return e; return json({ error: 'publish failed' }, { status: 500 }); } };
