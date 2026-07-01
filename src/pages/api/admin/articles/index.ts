// src/pages/api/admin/articles/index.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { listAdminArticles, upsertArticle } from '../../../../lib/articles';
import { assertAdmin, clampText, json } from '../../../../lib/security';
import type { AdminArticleInput } from '../../../../lib/types';
const env = cfEnv as unknown as Env;
type Body = Partial<AdminArticleInput>;
export const GET: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, env); return json({ articles: await listAdminArticles(env) }); } catch (e) { if (e instanceof Response) return e; return json({ error: 'failed' }, { status: 500 }); } };
export const POST: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, env); const body = await request.json() as Body; const result = await upsertArticle(env, { title: clampText(body.title, 160), dek: clampText(body.dek, 300), body: clampText(body.body, 200000), category: clampText(body.category, 80), tags: Array.isArray(body.tags) ? body.tags.map((t: unknown) => clampText(t, 40)) : [], slug: body.slug, seo: body.seo, status: body.status }); return json({ ok: true, ...result }); } catch (e) { if (e instanceof Response) return e; return json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 }); } };
