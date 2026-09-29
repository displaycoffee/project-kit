# @displaycoffee/tokens

Design token generation with [Style Dictionary](https://styledictionary.com), plus helpers that shape the generated `theme.json` for the app and build scripts.

### Install

```
npm install --save-dev @displaycoffee/tokens
```

### tokens-generate

Add it as a script in `package.json`:

```json
"generate:tokens": "tokens-generate"
```

It runs from the project root and expects this layout:

- **src/_core/tokens/*.json** - The token source files.
- **src/_core/styles/_root.scss** - Generated. CSS custom properties on `:root`, including the alternate theme. Only import this once, since it outputs CSS.
- **src/_core/styles/_theme.scss** - Generated. Sass variables that point to the custom properties, safe to `@use` anywhere.
- **src/_core/tokens/theme.json** - Generated. Resolved values grouped by category, for scripts (e.g. `{ "color": { "bg": "#fdfdfd", "bg-dark": "#1a1a1a" } }`).

For a Vite dev server, a plugin can re-run it when token files change. The script's path is exported as `@displaycoffee/tokens/generate`:

```js
import { fileURLToPath } from 'url';

const scriptPath = fileURLToPath(import.meta.resolve('@displaycoffee/tokens/generate'));
```

### Token options

- Exclude from `scss` files by adding `"$extensions": { "sass": false }`. The token still goes to `theme.json`.
- Add as a static variable in `scss` files by adding `"$extensions": { "static": true }`. The `breakpoint`, `font`, and `spacing` tokens are static by default, so they stay plain Sass values and are left out of `:root`.
- Customize a value for dark mode by using `"$extensions": { "dark": "#ffffff" }`. This only applies to tokens that end up in `:root`.
- Themes are set with the `setting.theme` tokens. `setting.theme.default` is the theme `$value` is written for (`light` or `dark`). For a dark-first project, set it to `dark` and use `"$extensions": { "light": "#ffffff" }` instead. Set `setting.theme.system` to `false` if only a manual `[data-theme]` toggle should switch themes, not the OS setting.
- Set a value to `false` to leave it unset (`$name: false` in Sass). The build fails if another token references an unset token.

### Helpers

Each helper takes the generated `theme.json` and returns data for the app and build scripts. Every token group is optional, so a project without one gets an empty list (or the default settings).

```ts
import { getFonts } from '@displaycoffee/tokens';
import themeJson from '../tokens/theme.json' with { type: 'json' };

export const fonts = getFonts(themeJson);
```

- **getFallbacks(themeJson)** - Fallback `@font-face` details from the `fallback` tokens.
- **getFavicons(themeJson)** - Favicon links and manifest icons from the `favicon` tokens.
- **getFonts(themeJson)** - `@font-face` and preload details from the `font` tokens. Supports local fonts like `local('Courier New')`.
- **getSettings(themeJson)** - Theme settings (`default`, `alternate`, `system`) from the `setting` tokens.

The helpers are plain JavaScript, so Node build scripts can import them directly. Types (`Fallback`, `Favicon`, `Font`, `Settings`, `ThemeMode`) are exported for TypeScript projects.
