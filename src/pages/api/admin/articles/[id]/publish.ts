import type { APIRoute } from 'astro';
import { publishArticle } from '../../../../../lib/articles';
import { assertAdmin, json } from '../../../../../lib/security';
export const POST: APIRoute = async ({ request, locals, params }) => { try { assertAdmin(request, locals.runtime.env); if (!params.id) return json({ error: 'id required' }, { status: 400 }); await publishArticle(locals.runtime.env, params.id); return json({ ok: true, id: params.id, status: 'published' }); } catch (e) { if (e instanceof Response) return e; return json({ error: 'publish failed' }, { status: 500 }); } };
