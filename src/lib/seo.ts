import type { Article, SeoMetadata } from './types';
export const SITE_DEFAULTS = { name: 'TrustWire Korea', description: '신뢰 기반 디지털 뉴스룸', locale: 'ko_KR' };
export function articleSeo(article: Pick<Article, 'title'|'dek'|'slug'|'category'|'published_at'|'updated_at'>, site = SITE_DEFAULTS.name): SeoMetadata {
  const canonicalPath = `/news/${article.slug}`;
  return { title: `${article.title} | ${site}`, description: article.dek.slice(0, 155), canonicalPath, focusKeyword: article.category, schema: { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title, description: article.dek, datePublished: article.published_at, dateModified: article.updated_at, inLanguage: 'ko-KR', isAccessibleForFree: true, publisher: { '@type': 'Organization', name: site } } };
}
export function siteSchema(site = SITE_DEFAULTS.name) { return { '@context': 'https://schema.org', '@type': 'NewsMediaOrganization', name: site, url: '/', publishingPrinciples: '/legal/editorial-policy', ethicsPolicy: '/legal/editorial-policy', diversityPolicy: '/about' }; }
export function seoScore(input: { title: string; description: string; body: string; focusKeyword?: string }) {
  const checks = [input.title.length >= 20 && input.title.length <= 70, input.description.length >= 80 && input.description.length <= 160, input.body.length >= 1200, !input.focusKeyword || input.body.includes(input.focusKeyword), /<h2|<h3/.test(input.body)];
  return { score: Math.round((checks.filter(Boolean).length / checks.length) * 100), checks: { titleLength: checks[0], descriptionLength: checks[1], articleDepth: checks[2], keywordIncluded: checks[3], headings: checks[4] } };
}
