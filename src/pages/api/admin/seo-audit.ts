import type { APIRoute } from 'astro';
import { seoScore } from '../../../lib/seo';
import { assertAdmin, json } from '../../../lib/security';
type Body = { title?: unknown; description?: unknown; body?: unknown; focusKeyword?: string };
export const POST: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, locals.runtime.env); const body = await request.json() as Body; return json(seoScore({ title: String(body.title || ''), description: String(body.description || ''), body: String(body.body || ''), focusKeyword: body.focusKeyword })); } catch (e) { if (e instanceof Response) return e; return json({ error: 'failed' }, { status: 500 }); } };
