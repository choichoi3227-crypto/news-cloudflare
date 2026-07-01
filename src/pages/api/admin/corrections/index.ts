import type { APIRoute } from 'astro';
import { assertAdmin, json } from '../../../../lib/security';
export const GET: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, locals.runtime.env); const rows = await locals.runtime.env.DB.prepare('SELECT * FROM correction_requests ORDER BY created_at DESC LIMIT 100').all(); return json({ corrections: rows.results }); } catch (e) { if (e instanceof Response) return e; return json({ error: 'failed' }, { status: 500 }); } };
