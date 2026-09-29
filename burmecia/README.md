# @displaycoffee/burmecia

Build scripts and Vite helpers for projects based on [Burmecia](https://github.com/displaycoffee/burmecia), a React/TypeScript template.

### Install

```
npm install --save-dev @displaycoffee/burmecia @displaycoffee/tokens vite
```

Requires Node 22.18 or newer, since the scripts import the project's TypeScript data files directly.

### Commands

Run these from the project root (npm scripts do this automatically). They follow the Burmecia folder layout: data in `src/_core/data`, tokens in `src/_core/tokens`, and routes read from `src/components/navigation/scripts/navigation.ts`.

- **burmecia src** - Builds `src/index.html` from the included HTML template, filling in the `head` (meta tags, favicons, theme colors, font preloads, and preloaded `@font-face` styles) and `body` targets from `src/_core/data`.
- **burmecia dist** - Post-processes `dist/index.html` after `vite build`: loads CSS without blocking render and moves the preloaded styles after the scripts.
- **burmecia public** - Builds `public/manifest.json` from the site, favicon, and color data.
- **burmecia sitemap** - Generates `vite.sitemap.js` for `vite-plugin-sitemap`, using the internal navigation items that have `includeInSitemap` set. The `public/assets` folders (including each folder in `assets/images`) are excluded.

Example `package.json` scripts:

```json
"generate:dev": "burmecia src && npx prettier --write src/index.html",
"generate:dist": "burmecia dist && npx prettier --write dist/index.html --ignore-path /dev/null",
"generate:public": "burmecia public && npx prettier --write public/manifest.json",
"generate:sitemap": "burmecia sitemap && npx prettier --write vite.sitemap.js",
"generate:tokens": "tokens-generate",
"build": "npm run generate:tokens && npm run generate:sitemap && npm run generate:dev && vite build && npm run generate:dist && npm run generate:public"
```

### Vite helpers

```js
import { assetFileNames, chunkFileNames, entryFileNames, tokensWatch } from '@displaycoffee/burmecia/vite';
```

- **tokensWatch()** - A dev-only plugin that re-runs `tokens-generate` from [`@displaycoffee/tokens`](https://www.npmjs.com/package/@displaycoffee/tokens) whenever a token file in `src/_core/tokens` changes.
- **assetFileNames(file)** - Names CSS by route (e.g. `assets/css/styles.page-two.[hash].css`) and other assets by their own name.
- **chunkFileNames(file)** - Names route chunks by route instead of `index` (e.g. `assets/js/bundle.page-two.lazy.[hash].js`).
- **entryFileNames()** - Names the entry bundle `assets/js/bundle.[hash].js`.
- **getRouteName(filePath)** - Gets the route folder a file belongs to, skipping `(group)` folders. Used by the naming helpers.

Pass the naming helpers to `build.rollupOptions.output` in `vite.config.js`.
