import { articleSeo } from './seo';
import { decodeRouteSlug, titleSlug } from './security';
import type { AdminArticleInput, Article, PublicArticle } from './types';

const parseArticle = (row: Article): PublicArticle => ({ ...row, tagsList: JSON.parse(row.tags || '[]'), seo: JSON.parse(row.seo_json || '{}') });

export async function uniqueTitleSlug(env: Env, title: string) {
  const base = titleSlug(title);
  let candidate = base;
  for (let i = 2; i < 100; i++) {
    const exists = await env.DB.prepare('SELECT id FROM articles WHERE slug = ? LIMIT 1').bind(candidate).first<{ id: string }>();
    if (!exists) return candidate;
    candidate = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

export async function listPublished(env: Env, limit = 24, category?: string) {
  const q = category ? env.DB.prepare('SELECT a.*, au.name author_name FROM articles a LEFT JOIN authors au ON au.id = a.author_id WHERE status = ? AND category = ? ORDER BY published_at DESC LIMIT ?').bind('published', category, limit) : env.DB.prepare('SELECT a.*, au.name author_name FROM articles a LEFT JOIN authors au ON au.id = a.author_id WHERE status = ? ORDER BY published_at DESC LIMIT ?').bind('published', limit);
  const rows = await q.all<Article>();
  return rows.results.map(parseArticle);
}

export async function getArticle(env: Env, slug: string) {
  const candidates = Array.from(new Set([slug, encodeURIComponent(decodeRouteSlug(slug)), titleSlug(decodeRouteSlug(slug))]));
  for (const candidate of candidates) {
    const row = await env.DB.prepare('SELECT a.*, au.name author_name FROM articles a LEFT JOIN authors au ON au.id = a.author_id WHERE slug = ? AND status = ?').bind(candidate, 'published').first<Article>();
    if (row) return parseArticle(row);
  }
  return null;
}

export async function searchArticles(env: Env, query: string, limit = 20) {
  const like = `%${query}%`;
  const rows = await env.DB.prepare('SELECT a.*, au.name author_name FROM articles a LEFT JOIN authors au ON au.id = a.author_id WHERE status = ? AND (title LIKE ? OR dek LIKE ? OR body LIKE ?) ORDER BY published_at DESC LIMIT ?').bind('published', like, like, like, limit).all<Article>();
  return rows.results.map(parseArticle);
}

export async function listAdminArticles(env: Env, limit = 50) {
  const rows = await env.DB.prepare('SELECT a.*, au.name author_name FROM articles a LEFT JOIN authors au ON au.id = a.author_id ORDER BY updated_at DESC LIMIT ?').bind(limit).all<Article>();
  return rows.results.map(parseArticle);
}

export async function listTrending(env: Env, limit = 24) {
  const rows = await env.DB.prepare('SELECT a.*, au.name author_name FROM articles a LEFT JOIN authors au ON au.id = a.author_id WHERE status = ? ORDER BY views DESC, published_at DESC LIMIT ?').bind('published', limit).all<Article>();
  return rows.results.map(parseArticle);
}

export async function listByTag(env: Env, tag: string, limit = 24) {
  const rows = await env.DB.prepare('SELECT a.*, au.name author_name FROM articles a LEFT JOIN authors au ON au.id = a.author_id WHERE status = ? AND tags LIKE ? ORDER BY published_at DESC LIMIT ?').bind('published', `%${tag}%`, limit).all<Article>();
  return rows.results.map(parseArticle);
}

export async function listByAuthor(env: Env, authorId: string, limit = 24) {
  const rows = await env.DB.prepare('SELECT a.*, au.name author_name FROM articles a LEFT JOIN authors au ON au.id = a.author_id WHERE status = ? AND author_id = ? ORDER BY published_at DESC LIMIT ?').bind('published', authorId, limit).all<Article>();
  return rows.results.map(parseArticle);
}

export async function upsertArticle(env: Env, input: AdminArticleInput, authorId = 'editorial-ai') {
  const id = crypto.randomUUID();
  const slug = await uniqueTitleSlug(env, input.title);
  const now = new Date().toISOString();
  const seo = { ...articleSeo({ title: input.title, dek: input.dek, slug, category: input.category, published_at: input.status === 'published' ? now : null, updated_at: now }, env.SITE_NAME), ...input.seo, canonicalPath: `/news/${slug}` };
  await env.DB.prepare(`INSERT OR IGNORE INTO authors (id, name, bio, verified) VALUES (?, ?, ?, 1)`).bind(authorId, authorId === 'editorial-ai' ? 'AI 보조 편집팀' : '편집자', '검수된 뉴스룸 작성 계정').run();
  await env.DB.prepare(`INSERT INTO articles (id, slug, title, dek, body, category, tags, author_id, status, hero_base64_chunks, seo_json, published_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, slug, input.title, input.dek, input.body, input.category, JSON.stringify(input.tags || []), authorId, input.status || 'draft', '[]', JSON.stringify(seo), input.status === 'published' ? now : null, now).run();
  return { id, slug, seo };
}

export async function publishArticle(env: Env, id: string) {
  const now = new Date().toISOString();
  return env.DB.prepare('UPDATE articles SET status = ?, published_at = COALESCE(published_at, ?), updated_at = ? WHERE id = ?').bind('published', now, now, id).run();
}

export async function archiveArticle(env: Env, id: string) {
  return env.DB.prepare('UPDATE articles SET status = ?, updated_at = ? WHERE id = ?').bind('archived', new Date().toISOString(), id).run();
}

export async function recordRevision(env: Env, article: PublicArticle, editor: string, note = '') {
  return env.DB.prepare('INSERT INTO article_revisions (id, article_id, editor, title, dek, body, seo_json, revision_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), article.id, editor, article.title, article.dek, article.body, JSON.stringify(article.seo), note).run();
}
