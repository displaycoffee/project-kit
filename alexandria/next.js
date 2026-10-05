/* Packages */
import path from 'path';

/* Next.js config for Alexandria projects: pass the project folder (__dirname in next.config.ts) and any project-specific options */
/* Note: options passed in are merged in, and lists like transpilePackages and sassOptions.loadPaths are added to rather than replaced */
export const createNextConfig = (projectPath, config = {}) => {
	// Shared workspace folder (e.g. C:\Users\adria\projects) that holds node_modules and package-lock.json
	// Note: Next only looks for a lockfile inside the project's Git repo, so without this the dev server can't find next
	const workspaceRoot = config.turbopack?.root ?? path.join(projectPath, '..');

	return {
		reactCompiler: true,
		// Type-check Link hrefs, router.push() and redirect() against the real routes in app/
		typedRoutes: true,
		...config,
		// @displaycoffee packages that ship TypeScript source. Workspace packages are compiled automatically locally, but on Vercel
		// they're installed from npm into node_modules, which Next doesn't compile unless they're listed here
		transpilePackages: ['@displaycoffee/alexandria', '@displaycoffee/scripts', ...(config.transpilePackages ?? [])],
		outputFileTracingRoot: config.outputFileTracingRoot ?? workspaceRoot,
		// Lets Sass @use files from src without relative paths, e.g. @use '_core/styles/_theme'
		sassOptions: {
			...config.sassOptions,
			loadPaths: [path.join(projectPath, 'src'), ...(config.sassOptions?.loadPaths ?? [])],
		},
		turbopack: {
			...config.turbopack,
			root: workspaceRoot,
		},
	};
};
