// src/pages/api/admin/metrics/index.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { assertAdmin, json } from '../../../../lib/security';
const env = cfEnv as unknown as Env;
export const GET: APIRoute = async ({ request, locals }) => { try { assertAdmin(request, env); const [articles, views, notifications, drafts] = await Promise.all([env.DB.prepare('SELECT COUNT(*) count FROM articles').first<{ count: number }>(), env.DB.prepare('SELECT COALESCE(SUM(views),0) count FROM articles').first<{ count: number }>(), env.DB.prepare('SELECT COUNT(*) count FROM notifications WHERE status = ?').bind('queued').first<{ count: number }>(), env.DB.prepare('SELECT COUNT(*) count FROM articles WHERE status = ?').bind('draft').first<{ count: number }>()]); return json({ articles: articles?.count || 0, views: views?.count || 0, queuedNotifications: notifications?.count || 0, drafts: drafts?.count || 0 }); } catch (e) { if (e instanceof Response) return e; return json({ error: 'failed' }, { status: 500 }); } };
