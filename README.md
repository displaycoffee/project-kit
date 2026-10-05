# Project Kit

A collection of scripts, tokens, and Sass files shared across projects, so a fix only has to be made once. Each folder is its own npm package, published under the `@displaycoffee` scope.

### Packages

- **[alexandria](alexandria)** - [`@displaycoffee/alexandria`](https://www.npmjs.com/package/@displaycoffee/alexandria) - Dev and build scripts (`alexandria dev`, `icons`), a Next.js config helper, and head helpers for Alexandria-based Next.js projects.
- **[burmecia](burmecia)** - [`@displaycoffee/burmecia`](https://www.npmjs.com/package/@displaycoffee/burmecia) - Build scripts (`burmecia src`, `dist`, `public`, `sitemap`) and Vite helpers for Burmecia-based React projects.
- **[scripts](scripts)** - [`@displaycoffee/scripts`](https://www.npmjs.com/package/@displaycoffee/scripts) - Shared utility functions and React hooks.
- **[styles](styles)** - [`@displaycoffee/styles`](https://www.npmjs.com/package/@displaycoffee/styles) - Sass helper functions and mixins.
- **[tokens](tokens)** - [`@displaycoffee/tokens`](https://www.npmjs.com/package/@displaycoffee/tokens) - Style Dictionary token generation (`tokens-generate`) and helpers that shape `theme.json` for the app and build scripts.

### Local development

- This repo lives in the `projects` folder next to the projects that use it. The root `projects/package.json` lists `"project-kit/*"` in its workspaces, so `npm install` from `projects` symlinks each package into `projects/node_modules/@displaycoffee`.
- Projects depend on a version range like `"@displaycoffee/styles": "^1.0.0"`. Inside the workspace, npm links the local copy as long as its version matches the range, so changes here show up in projects right away. Anyone cloning a project on its own gets the published version from npm instead.

### Publishing

1. Update `version` in the package's `package.json` (patch for fixes, minor for additions, major for breaking changes). If it's a major version, or a project starts using something added in the new version, update the ranges in those projects too (e.g. `^1.0.0` to `^1.1.0`).
2. Commit and push.
3. Publish from inside the package folder, e.g. `cd styles && npm publish`. Running `npm publish -w styles` from this folder doesn't work, since the workspaces are set up in `projects/package.json`.
4. Check it with `npm view @displaycoffee/styles version`. A brand-new package can take a few minutes before this stops returning a 404.

Notes:

- Vercel reuses `node_modules` from the previous deploy, and the projects don't commit a lockfile, so npm only upgrades a package when the installed version no longer matches the range. A project that needs a new version but still says `^1.0.0` keeps the cached `1.0.0` and the build fails (e.g. `does not provide an export named 'cssTarget'`). Raising the range fixes it.
- A published version can never be reused, even after unpublishing, so double-check with `npm publish --dry-run` first.
- The root `package.json` is `private` so it never gets published. The packages set `"publishConfig": { "access": "public" }` because scoped packages are private by default.
- `bin` paths can't start with `./` (e.g. `"tokens-generate": "tokens-generate.js"`), or npm quietly removes the command when publishing.
