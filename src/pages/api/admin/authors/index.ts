// src/pages/api/admin/authors/index.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { listAuthors, upsertAuthor } from '../../../../lib/authors';
import { logAdminAction } from '../../../../lib/audit';
import { assertAdmin, clampText, json } from '../../../../lib/security';
const env = cfEnv as unknown as Env;
export const GET: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, env); return json({ authors: await listAuthors(env) }); } catch (e) { if (e instanceof Response) return e; return json({ error: 'failed' }, { status: 500 }); } };
export const POST: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, env); const body = await request.json() as { id?: string; name?: string; bio?: string; role?: string; verified?: boolean }; if (!body.name) return json({ error: 'name required' }, { status: 400 }); const author = await upsertAuthor(env, { id: body.id, name: clampText(body.name, 120), bio: clampText(body.bio, 2000), role: clampText(body.role || 'editor', 50), verified: body.verified }); await logAdminAction(env, 'admin', 'author.upsert', author.id, author); return json({ ok: true, author }); } catch (e) { if (e instanceof Response) return e; return json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 }); } };
