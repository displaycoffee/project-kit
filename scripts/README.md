# @displaycoffee/scripts

Shared utility functions and React hooks. The files ship as TypeScript source, so the project's bundler compiles them.

### Install

```
npm install @displaycoffee/scripts
```

Requires `react` and `react-dom` 19. `@tanstack/react-router` is only needed for `hooks-tanstack`.

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
- **stripHTML(string)** - Removes HTML tags and newlines.
- **truncate(string, limit)** - Cuts a string to `limit` characters, ending with `...`.

### utilsBrowser

These use `window` / `document`, so only call them in `useEffect` or event handlers, never during render.

- **getPage()** - Path of the parent page (e.g. `/page-two` from `/page-two/child-page-one`).
- **isSticky(element, stickyClass)** - Toggles `stickyClass` while the element is stuck. Returns a cleanup function that stops observing.
- **scrollTo(e?, selector?, offset?)** - Smooth scrolls to an element (or the top) and moves focus to it.
- **setAttributes(element, attributes)** - Sets several attributes at once.

### hooks

- **useFormattedId()** - `useId()` formatted for HTML ids and `aria-*` attributes (e.g. `R-1`).
- **useRespond(bp, rule = 'min-width')** - Whether a media query matches, updating on change. Renders as `false` on the server, then updates after hydration.

### hooks-tanstack

- **useViewTransition()** - Returns a click handler that runs a TanStack Router navigation (or a state update) inside a View Transition, waiting briefly for visible images to load.
