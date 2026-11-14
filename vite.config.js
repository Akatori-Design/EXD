import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// <!--@include name--> in a page is replaced with src/partials/name.html,
// so the header, footer and overlays are written once and shared by every page.
const partials = () => ({
  name: 'exd-partials',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) =>
      html.replace(/<!--@include ([\w-]+)-->/g, (_, name) => readFileSync(resolve(__dirname, 'src/partials', `${name}.html`), 'utf8')),
  },
});

export default defineConfig({
  plugins: [partials()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        artist: resolve(__dirname, 'artist.html'),
        producer: resolve(__dirname, 'producer.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'signup.html'),
        forgot: resolve(__dirname, 'forgot.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        music: resolve(__dirname, 'music.html'),
        release: resolve(__dirname, 'release.html'),
        releaseFlow: resolve(__dirname, 'release-flow.html'),
        album: resolve(__dirname, 'album.html'),
        promoteVerified: resolve(__dirname, 'promote-verified.html'),
        promoteLyricvids: resolve(__dirname, 'promote-lyricvids.html'),
        promoteYoutube: resolve(__dirname, 'promote-youtube.html'),
        promoteCollections: resolve(__dirname, 'promote-collections.html'),
        deal: resolve(__dirname, 'deal.html'),
        support: resolve(__dirname, 'support.html'),
        transfer: resolve(__dirname, 'transfer.html'),
        plan: resolve(__dirname, 'plan.html'),
        artistName: resolve(__dirname, 'artist-name.html'),
        analytics: resolve(__dirname, 'analytics.html'),
        money: resolve(__dirname, 'money.html'),
        promote: resolve(__dirname, 'promote.html'),
        exclusives: resolve(__dirname, 'exclusives.html'),
        settings: resolve(__dirname, 'settings.html'),
        news: resolve(__dirname, 'news.html'),
      },
    },
  },
});
