export type GeneratedArticle = { title: string; dek: string; body: string; category: string; tags: string[]; seo: { title: string; description: string; canonicalPath: string; focusKeyword?: string; schema: Record<string, unknown> } };

export async function generateArticle(env: Env, topic: string, angle = '언론사형 심층 기사'): Promise<GeneratedArticle> {
  if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
  const prompt = `당신은 한국어 디지털 언론사 편집장입니다. 애드센스 정책을 준수하고 E-E-A-T, 신뢰도, 검색 의도, 구조화 데이터에 최적화된 기사를 JSON만으로 작성하세요. 주제: ${topic}. 관점: ${angle}. 필드: title, dek, body(HTML article body), category, tags(string[]), seo{title,description,canonicalPath,schema}. 과장, 허위, 선정성, 저작권 침해 금지.`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent?key=${env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.55, responseMimeType: 'application/json' } }) });
  if (!res.ok) throw new Error(`Gemini request failed: ${res.status}`);
  const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response');
  return JSON.parse(text) as GeneratedArticle;
}
