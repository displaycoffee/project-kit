/* Packages */
import fs from 'fs';
import path from 'path';

/* Scripts */
import { importData } from './project-data.js';

/* Project data */
const { site } = await importData('site');

/* Function to generate sitemap object*/
const generateSitemap = (object) => {
	return `let sitemap = ${object};\n\nexport const sitemapConfig = sitemap;\n`;
};

/* Sitemap path and set placeholder content */
const jsPath = path.resolve('./vite.sitemap.js');
const placeholder = generateSitemap('{}');

/* sitemap-routes.js's own createServer() call needs vite.config.js to resolve, which imports
   sitemapConfig from this exact file — so vite.sitemap.js has to already exist and export
   something valid before sitemap-routes.js loads, or that resolution (and this whole script) fails
   outright with no way to recover. Seed it with a placeholder first if it's missing, then
   import sitemap-routes.js dynamically afterward — a static import would run before this check,
   since imports are hoisted ahead of a module's own top-level code. */
if (!fs.existsSync(jsPath)) fs.writeFileSync(jsPath, placeholder);

/* Navigation (dynamic import, see note above) */
const { sitemapRoutes } = await import('./sitemap-routes.js');

const location = new URL(site.url);
const assets = `/assets`;
const images = `${assets}/images`;
const exclude = [assets, `${assets}/css`, `${assets}/fonts`, `${assets}/js`];

/* Get lists of folders in images since that changes the most */
const getFoldersSync = (directoryPath) => {
	if (!fs.existsSync(directoryPath)) return [];
	const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
	return entries.filter((entry) => entry.isDirectory()).map((entry) => `${images}/${entry.name}`);
};

/* List of images */
const imagesList = getFoldersSync(`./public${images}`);

/* Build sitemap object */
const sitemap = {
	dynamicRoutes: sitemapRoutes,
	exclude: [...exclude, images, ...imagesList],
	hostname: location.origin,
	readable: true,
};

if (location?.pathname && location.pathname != '/') sitemap.basePath = location.pathname;

/* Format js content */
const jsContent = generateSitemap(JSON.stringify(sitemap, null, 2));

/* Write the string synchronously to a .js file */
fs.writeFileSync(jsPath, jsContent, 'utf8');

console.log(`🚀 Successfully built vite.sitemap.js with ${sitemapRoutes.length} route(s).`);
