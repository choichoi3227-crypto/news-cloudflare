// src/pages/api/admin/settings/index.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { getSettings, saveSettings } from '../../../../lib/settings';
import { assertAdmin, json } from '../../../../lib/security';
const env = cfEnv as unknown as Env;
export const GET: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, env); return json({ settings: await getSettings(env) }); } catch (e) { if (e instanceof Response) return e; return json({ error: 'failed' }, { status: 500 }); } };
export const PUT: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, env); const body = await request.json() as Record<string, unknown>; return json({ ok: true, settings: await saveSettings(env, body) }); } catch (e) { if (e instanceof Response) return e; return json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 }); } };
