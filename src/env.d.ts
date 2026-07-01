/// <reference types="astro/client" />

declare namespace App {
  interface Locals { runtime: { env: Env } }
}

interface Env {
  DB: D1Database;
  NEWS_KV: KVNamespace;
  SESSION: KVNamespace;
  TRAFFIC_DO: DurableObjectNamespace;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  SITE_NAME?: string;
  ADMIN_TOKEN?: string;
}
