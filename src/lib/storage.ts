import { chunkBase64, sha256Hex } from './security';
export async function putBase64Asset(env: Env, base64: string, prefix = 'asset') {
  const normalized = base64.replace(/^data:[^;]+;base64,/, '');
  const hash = await sha256Hex(normalized);
  const chunks = chunkBase64(normalized);
  await Promise.all(chunks.map((chunk, index) => env.NEWS_KV.put(`${prefix}:${hash}:${index}`, chunk)));
  await env.NEWS_KV.put(`${prefix}:${hash}:manifest`, JSON.stringify({ hash, chunks: chunks.length, encoding: 'base64', createdAt: new Date().toISOString() }));
  return { hash, chunks: chunks.length, keys: chunks.map((_, index) => `${prefix}:${hash}:${index}`) };
}
export async function getBase64Asset(env: Env, hash: string, prefix = 'asset') {
  const manifest = await env.NEWS_KV.get<{ chunks: number }>(`${prefix}:${hash}:manifest`, 'json');
  if (!manifest) return null;
  const chunks = await Promise.all(Array.from({ length: manifest.chunks }, (_, index) => env.NEWS_KV.get(`${prefix}:${hash}:${index}`)));
  return chunks.join('');
}
