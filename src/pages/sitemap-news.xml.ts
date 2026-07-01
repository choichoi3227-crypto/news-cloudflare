// src/pages/sitemap-news.xml.ts
import { env as cfEnv } from 'cloudflare:workers';
import { listPublished } from '../lib/articles';
import type { PublicArticle } from '../lib/types';
const env = cfEnv as unknown as Env;
export const GET = async ({ locals, site }: { locals: App.Locals; site?: URL }) => { let items: PublicArticle[] = []; try { items = await listPublished(env, 1000); } catch {} const origin = String(site || 'https://example.com').replace(/\/$/, ''); return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items.map((a) => `<url><loc>${origin}/news/${a.slug}</loc><lastmod>${a.updated_at}</lastmod></url>`).join('')}</urlset>`, { headers: { 'content-type': 'application/xml; charset=utf-8' } }); };
