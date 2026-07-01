// src/pages/api/admin/generate.ts
import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { generateArticle } from '../../../lib/gemini';
import { upsertArticle } from '../../../lib/articles';
import { assertAdmin, json } from '../../../lib/security';
import { seoScore } from '../../../lib/seo';
const env = cfEnv as unknown as Env;
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    assertAdmin(request, env);
    const { topic, angle } = await request.json() as { topic?: string; angle?: string };
    if (!topic || topic.length < 3) return json({ error: 'topic is required' }, { status: 400 });
    const article = await generateArticle(env, topic, angle);
    const saved = await upsertArticle(env, { ...article, seo: article.seo, status: 'draft' });
    const audit = seoScore({ title: article.seo.title || article.title, description: article.seo.description || article.dek, body: article.body, focusKeyword: article.seo.focusKeyword || article.category });
    await env.DB.prepare('INSERT INTO seo_audits (id, article_id, score, checks_json) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), saved.id, audit.score, JSON.stringify(audit.checks)).run();
    return json({ ok: true, ...saved, status: 'draft', seoAudit: audit });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: error instanceof Error ? error.message : 'unknown error' }, { status: 500 });
  }
};
