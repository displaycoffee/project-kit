# @displaycoffee/alexandria

Dev and build scripts, a Next.js config helper, and head helpers for projects based on [Alexandria](https://github.com/displaycoffee/alexandria), a Next.js (App Router) template.

### Install

```
npm install @displaycoffee/alexandria @displaycoffee/scripts
npm install --save-dev @displaycoffee/tokens @iconify-json/lucide prettier
```

Requires Node 22.18 or newer. `next`, `react-dom` and `prettier` are peer dependencies.

### Commands

Run these from the project root (npm scripts do this automatically). They follow the Alexandria folder layout: tokens in `src/_core/tokens` and the icon list in `src/_core/data/icons.json`.

- **alexandria dev** - Runs the token and icon generators, starts `next dev --experimental-https`, and re-runs a generator when its sources change (`src/_core/tokens/*.json` except `theme.json`, and `src/_core/data/icons.json`). Extra arguments are passed to `next dev`, e.g. `npm run dev -- --port 3001`. Turbopack has no plugin API, so this runs alongside Next instead of inside `next.config.ts` like `@displaycoffee/burmecia`'s `tokensWatch()` Vite plugin.
- **alexandria icons** - Builds `src/_core/data/icons.ts` with only the icons listed in `icons.json`, so full icon sets never reach the browser. `icons.json` is `{ "<set prefix>": [...names] }`, and each set needs its `@iconify-json/<prefix>` package installed. Icons from `lucide` stay unprefixed (`x`), others are keyed `prefix:name`.

Example `package.json` scripts:

```json
"dev": "alexandria dev",
"generate:icons": "alexandria icons",
"generate:tokens": "tokens-generate",
"build": "npm run generate:tokens && npm run generate:icons && next build"
```

### Next.js config

```ts
import { createNextConfig } from '@displaycoffee/alexandria/next';

export default createNextConfig(__dirname);
```

- **createNextConfig(projectPath, config?)** - Turns on the React Compiler and typed routes, sets `turbopack.root` and `outputFileTracingRoot` to the folder above the project (the shared npm workspace, since Next only looks for a lockfile inside the project's Git repo), transpiles `@displaycoffee/alexandria` and `@displaycoffee/scripts` (they ship TypeScript source), and adds `src` as a Sass load path so styles can `@use '_core/styles/_theme'`. Project-specific options go in `config`; `transpilePackages` and `sassOptions.loadPaths` are added to rather than replaced.

### Head helpers

```ts
import { createHead } from '@displaycoffee/alexandria/layout/head';
import themeJson from '@/_core/tokens/theme.json' with { type: 'json' };

export const head = createHead({ site, themeJson });
```

- **createHead({ site, themeJson })** - Builds everything for the root layout's `<head>` from the tokens and site data (`{ name, description, url }`):
    - `head.metadata.all` and `head.metadata.viewport` - export as `metadata` and `viewport` from `app/layout.tsx` (title template, description, Open Graph, favicons, and a theme color per light / dark theme when the tokens follow the OS).
    - `head.preload.fonts()` - preloads the fonts marked `isPreload`. Call it while rendering the layout.
    - `head.styles.fallbacks()` and `head.styles.fonts()` - `@font-face` rules for the size-adjusted fallback fonts and the theme fonts, for a `<style>` in `<head>`.
