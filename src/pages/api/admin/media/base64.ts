// src/pages/api/admin/media/base64.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { putBase64Asset } from '../../../../lib/storage';
import { assertAdmin, json } from '../../../../lib/security';
const env = cfEnv as unknown as Env;
export const POST: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, env); const { base64, prefix } = await request.json() as { base64?: string; prefix?: string }; if (!base64 || base64.length > 8_000_000) return json({ error: 'base64 required and must be <= 8MB' }, { status: 400 }); return json({ ok: true, asset: await putBase64Asset(env, base64, prefix || 'media') }); } catch (e) { if (e instanceof Response) return e; return json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 }); } };
