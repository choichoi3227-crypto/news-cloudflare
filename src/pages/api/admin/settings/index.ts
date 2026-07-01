import type { APIRoute } from 'astro';
import { getSettings, saveSettings } from '../../../../lib/settings';
import { assertAdmin, json } from '../../../../lib/security';
export const GET: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, locals.runtime.env); return json({ settings: await getSettings(locals.runtime.env) }); } catch (e) { if (e instanceof Response) return e; return json({ error: 'failed' }, { status: 500 }); } };
export const PUT: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, locals.runtime.env); const body = await request.json() as Record<string, unknown>; return json({ ok: true, settings: await saveSettings(locals.runtime.env, body) }); } catch (e) { if (e instanceof Response) return e; return json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 }); } };
