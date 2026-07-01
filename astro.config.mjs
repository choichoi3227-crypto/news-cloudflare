import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  site: 'https://example.com',
  security: { checkOrigin: true },
  vite: { build: { sourcemap: false } }
});
