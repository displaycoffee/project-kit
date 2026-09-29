/* Packages */
import { createServer } from 'vite';

/* Start a vite server to get information from navigation */
/* Note: this is the only script that starts a vite server, so only import it where the navigation is needed (sitemap-generate.js) */
const viteServer = await createServer({
	server: { middlewareMode: true },
	appType: 'custom',
});
const { navigationHeader } = await viteServer.ssrLoadModule('/components/navigation/scripts/navigation.ts');
const { navigationUtils } = await viteServer.ssrLoadModule('/components/navigation/scripts/navigation-utils.ts');
await viteServer.close();

/* Flatten nav items (and nested children) into a plain list of internal urls. Home ('/') is
   excluded since vite-plugin-sitemap already finds it by scanning the built dist/index.html.
   External urls (e.g. a nav item pointing off-site) and items with includeInSitemap set to
   false are also excluded. */
const flattenUrls = (items) => {
	return items.flatMap((item) => {
		const isInternal = item.url.startsWith('/') && !item.url.startsWith('//');
		const urls = item.includeInSitemap && isInternal && item.url != '/' ? [item.url] : [];
		return item.children ? [...urls, ...flattenUrls(item.children)] : urls;
	});
};

export const sitemapRoutes = flattenUrls(navigationUtils.get.list(navigationHeader, true));
