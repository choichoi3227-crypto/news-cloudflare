import type { APIRoute } from 'astro';
import { json } from '../../lib/security';
export const POST: APIRoute = async ({ request, locals }) => {
  const { articleId } = await request.json() as { articleId?: string };
  if (!articleId) return json({ error: 'articleId required' }, { status: 400 });
  await locals.runtime.env.DB.prepare('UPDATE articles SET views = views + 1 WHERE id = ?').bind(articleId).run();
  const id = locals.runtime.env.TRAFFIC_DO.idFromName(articleId);
  const stub = locals.runtime.env.TRAFFIC_DO.get(id);
  const res = await stub.fetch('https://traffic.local/view', { method: 'POST', body: JSON.stringify({ articleId }) });
  return json(await res.json());
};
