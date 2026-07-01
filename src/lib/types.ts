export type ArticleStatus = 'draft' | 'published' | 'archived';
export type SeoMetadata = { title: string; description: string; canonicalPath: string; focusKeyword?: string; noindex?: boolean; schema: Record<string, unknown> };
export type Article = { id: string; slug: string; title: string; dek: string; body: string; category: string; tags: string; author_id: string; author_name?: string; status: ArticleStatus; hero_base64_chunks: string; seo_json: string; views: number; published_at: string | null; updated_at: string };
export type AdminArticleInput = { title: string; dek: string; body: string; category: string; tags?: string[]; slug?: string; seo?: Partial<SeoMetadata>; heroBase64?: string; status?: ArticleStatus };
export type PublicArticle = Article & { tagsList: string[]; seo: SeoMetadata };
