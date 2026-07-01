// src/pages/api/view.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { json } from '../../lib/security';
const env = cfEnv as unknown as Env;
export const POST: APIRoute = async ({ request, locals }) => {
  const { articleId } = await request.json() as { articleId?: string };
  if (!articleId) return json({ error: 'articleId required' }, { status: 400 });
  await env.DB.prepare('UPDATE articles SET views = views + 1 WHERE id = ?').bind(articleId).run();
  const id = env.TRAFFIC_DO.idFromName(articleId);
  const stub = env.TRAFFIC_DO.get(id);
  const res = await stub.fetch('https://traffic.local/view', { method: 'POST', body: JSON.stringify({ articleId }) });
  return json(await res.json());
};
