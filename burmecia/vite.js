/* Packages */
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

/* Paths */
const tokensScriptPath = fileURLToPath(import.meta.resolve('@displaycoffee/tokens/generate'));

/* Vite plugin that rebuilds tokens when a token file changes during dev, so the regenerated Sass hot reloads like any other change */
/* Note: theme.json is generated into the tokens folder, so it's ignored to avoid a rebuild loop */
export const tokensWatch = () => {
	let isRunning = false;
	let isQueued = false;

	return {
		name: 'tokens-watch',
		apply: 'serve',
		configureServer(server) {
			const { logger } = server.config;

			// The dev server runs from the project root, like the npm scripts
			const projectPath = process.cwd();
			const tokensPath = path.resolve(projectPath, 'src/_core/tokens');

			// Run tokens-generate from @displaycoffee/tokens, queuing one more run if a token file changes while it's still building
			const buildTokens = () => {
				if (isRunning) {
					isQueued = true;
					return;
				}

				isRunning = true;
				execFile(process.execPath, [tokensScriptPath], { cwd: projectPath }, (error, _stdout, stderr) => {
					isRunning = false;

					if (error) {
						logger.error(`[tokens] ${stderr || error.message}`, { timestamp: true });
					} else {
						logger.info('[tokens] rebuilt _root.scss, _theme.scss, and theme.json', { timestamp: true });
					}

					if (isQueued) {
						isQueued = false;
						buildTokens();
					}
				});
			};

			// Only rebuild for token source files (not the generated theme.json)
			const handleTokenFile = (file) => {
				const filePath = path.resolve(file);
				const isTokenFile = path.dirname(filePath) === tokensPath && filePath.endsWith('.json') && path.basename(filePath) !== 'theme.json';
				if (isTokenFile) buildTokens();
			};

			server.watcher.add(tokensPath);
			server.watcher.on('add', handleTokenFile);
			server.watcher.on('change', handleTokenFile);
			server.watcher.on('unlink', handleTokenFile);
		},
	};
};

/* Get the route folder a file belongs to, skipping (group) folders, e.g. routes/page-two/index.lazy.tsx is page-two */
export const getRouteName = (filePath) => {
	if (!filePath) return null;
	const segments = filePath.replace(/\\/g, '/').split('/');
	const routesIndex = segments.lastIndexOf('routes');

	if (routesIndex == -1) return null;
	const routeSegments = segments.slice(routesIndex + 1, -1).filter((segment) => !segment.startsWith('('));

	return routeSegments.length != 0 ? routeSegments[routeSegments.length - 1] : 'index';
};

/* Name CSS by route (styles.page-two.[hash].css) and other assets by their own name */
export const assetFileNames = (file) => {
	if (file.name.includes('.css')) {
		const routeName = file.name == 'index.css' ? getRouteName(file.originalFileNames?.[0]) : file.name.replace(/\.css$/, '');
		const stem = routeName ? `.${routeName.toLowerCase()}` : '';
		return `assets/[ext]/styles${stem}.[hash].css`;
	} else {
		return `assets/[ext]/[name].[hash].[ext]`;
	}
};

/* Name route chunks by route instead of index (bundle.page-two.lazy.[hash].js) */
export const chunkFileNames = (file) => {
	const isGenericName = file.name == 'index' || file.name == 'index.lazy';
	const routeName = isGenericName ? getRouteName(file.facadeModuleId) : null;
	const suffix = file.name.endsWith('.lazy') ? '.lazy' : '';
	return `assets/js/bundle.${(routeName ?? file.name).toLowerCase()}${routeName ? suffix : ''}.[hash].js`;
};

export const entryFileNames = () => {
	return `assets/js/bundle.[hash].js`;
};
