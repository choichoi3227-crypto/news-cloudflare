const slugify = (text) => text.toLowerCase().normalize('NFKC').replace(/[^a-z0-9가-힣]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 90);
const titleSlug = (title) => encodeURIComponent(slugify(title) || 'fallback');
const cases = [{ title: '퍼센트 인코딩 테스트 기사', expected: '%ED%8D%BC%EC%84%BC%ED%8A%B8-%EC%9D%B8%EC%BD%94%EB%94%A9-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EA%B8%B0%EC%82%AC' }, { title: 'Cloudflare D1 & SEO 완벽 가이드!', expected: 'cloudflare-d1-seo-%EC%99%84%EB%B2%BD-%EA%B0%80%EC%9D%B4%EB%93%9C' }];
for (const item of cases) { const actual = titleSlug(item.title); if (actual !== item.expected) { console.error(`slug mismatch: ${item.title}\nexpected ${item.expected}\nactual   ${actual}`); process.exit(1); } }
console.log('slug verification passed');
