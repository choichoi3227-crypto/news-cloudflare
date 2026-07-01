export const GET = ({ site }: { site?: URL }) => new Response(`User-agent: *\nAllow: /\nSitemap: ${site || 'https://example.com'}/sitemap-index.xml\n`, { headers: { 'content-type': 'text/plain' } });
