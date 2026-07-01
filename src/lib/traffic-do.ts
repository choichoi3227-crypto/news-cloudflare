export class TrafficCoordinator implements DurableObject {
  constructor(private state: DurableObjectState, private env: Env) {}
  async fetch(request: Request) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/view') {
      const { articleId } = await request.json() as { articleId: string };
      const key = `views:${articleId}`;
      const views = ((await this.state.storage.get<number>(key)) || 0) + 1;
      await this.state.storage.put(key, views);
      if (views >= 1000) await this.env.NEWS_KV.put(`notify:${articleId}`, JSON.stringify({ articleId, views, at: new Date().toISOString() }));
      return new Response(JSON.stringify({ views }), { headers: { 'content-type': 'application/json' } });
    }
    return new Response('Not found', { status: 404 });
  }
}
