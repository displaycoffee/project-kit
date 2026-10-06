# @displaycoffee/scripts

Shared utility functions and React hooks. The files ship as TypeScript source, so the project's bundler compiles them.

### Install

```
npm install @displaycoffee/scripts
```

Requires `react` and `react-dom` 19. `@tanstack/react-router` is only needed for `hooks-tanstack`, and `next` only for `hooks-next`.

- **Vite** - Works without any extra config.
- **Next.js** - Add the package to `transpilePackages` in `next.config.ts`, since Next only compiles TypeScript in `node_modules` for listed packages:

```ts
const nextConfig: NextConfig = {
	transpilePackages: ['@displaycoffee/scripts'],
};
```

### Usage

```ts
import { useFormattedId, useRespond } from '@displaycoffee/scripts/hooks';
import { utils, utilsBrowser } from '@displaycoffee/scripts/utils';
import type { UtilsType } from '@displaycoffee/scripts/utils-types';
```

### utils

Safe anywhere, including server rendering.

- **getLast(value, delimeter?)** - Last item of an array, or of a string split by `delimeter`.
- **handleize(value)** - Formats a string for HTML classes (e.g. `Page One!` to `page-one`).
- **stripHTML(string)** - Removes HTML tags and newlines. Returns an empty string for `null` / `undefined`.
- **truncate(string, limit)** - Cuts a string to `limit` characters, ending with `...`. Returns an empty string for `null` / `undefined`.

### utilsBrowser

These use `window` / `document`, so only call them in `useEffect` or event handlers, never during render.

- **isSticky(element, stickyClass)** - Toggles `stickyClass` while the element is stuck. Returns a cleanup function that stops observing.
- **scrollTo(e?, selector?, offset?)** - Smooth scrolls to an element (or the top) and moves focus to it.
- **setAttributes(element, attributes)** - Sets several attributes at once.
- **setAvailableMinHeight(element)** - Sets the element's `min-height` to the viewport space left around it (e.g. so `main` fills the screen between the header and footer), updating when the page or window resizes. Returns a cleanup function that stops watching.

### hooks

- **useFormattedId()** - `useId()` formatted for HTML ids and `aria-*` attributes (e.g. `R-1`).
- **useRespond(bp, rule = 'min-width')** - Whether a media query matches, updating on change. Renders as `false` on the server, then updates after hydration.

### hooks-tanstack

- **useAvailableMinHeight(ref)** - `setAvailableMinHeight` for a React ref, re-measuring on each route change.
- **useBodyClass(defaultPrefix)** - Adds a `page-*` class to `body` for the current route (e.g. `/some/path` to `page-some-path`), using `page-<defaultPrefix>` on the home page.
- **useViewTransition()** - Returns a click handler that runs a TanStack Router navigation (or a state update) inside a View Transition, waiting briefly for visible images to load.

### hooks-next

For Next.js (App Router) client components.

- **useAvailableMinHeight(ref)** - Same as in `hooks-tanstack`, using `usePathname()`.
- **useBodyClass(defaultPrefix)** - Same as in `hooks-tanstack`, using `usePathname()`. The class is added after hydration, so it isn't in the server HTML on first load.
- **useViewTransition()** - Returns a click handler that runs a `router.push()` navigation (or a state update) inside a View Transition. Since `router.push()` can't be awaited, it waits for the new pathname to render (capped at 2 seconds), then briefly for visible images to load. It also names a new `.content` element when moving between route groups swaps the layout.

### hooks-astro

For React islands in Astro.

- **useAvailableMinHeight(ref)** - Same as in `hooks-tanstack`, re-measuring on `astro:page-load` so an island kept with `transition:persist` updates after `<ClientRouter />` navigations. Outside React, call `utilsBrowser.setAvailableMinHeight()` from a `<script>` instead.
