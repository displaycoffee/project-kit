/* Packages */
import type { Metadata, Viewport } from 'next';
import type { ThemeJson } from '@displaycoffee/tokens';
import { preload } from 'react-dom';
import { getFallbacks, getFavicons, getFonts, getSettings } from '@displaycoffee/tokens';

/* Type definitions */
type HeadSite = {
	name: string;
	description: string;
	url: string;
};

type HeadOptions = {
	site: HeadSite;
	themeJson: ThemeJson;
};

/* Build the head metadata, viewport, font preloads and font-face styles from the project's theme.json and site data */
/* Note: this package ships TypeScript source, so it needs to be in transpilePackages (createNextConfig adds it) */
export const createHead = (options: HeadOptions) => {
	const { site, themeJson } = options;
	const colors = (themeJson.color ?? {}) as Record<string, string | boolean>;
	const fallbacks = getFallbacks(themeJson);
	const favicons = getFavicons(themeJson);
	const fonts = getFonts(themeJson);
	const settings = getSettings(themeJson);

	// Theme color for the browser UI
	// Note: when the OS setting can switch themes, each theme gets its own color, otherwise the default theme's color is always used
	const bg = typeof colors.bg === 'string' ? colors.bg : '';
	const alternateBg = colors[`bg-${settings.theme.alternate}`];
	const themeColors: Record<string, string> = {
		[settings.theme.default]: bg,
		[settings.theme.alternate]: typeof alternateBg === 'string' ? alternateBg : bg,
	};

	const head = {
		format: {
			emptyLines: (value: string) => {
				// Remove empty lines
				return value.replace(/^\s*[\r\n]/gm, '');
			},
			styles: (value: string) => {
				// Format style block by removing the indentation shared by every line, so nested rules keep their relative indent
				const lines = head.format.emptyLines(value).split('\n');
				const indents = lines.filter((line) => line.trim()).map((line) => (line.match(/^[ \t]*/) ?? [''])[0].length);
				const minIndent = indents.length ? Math.min(...indents) : 0;
				return lines.map((line) => line.slice(minIndent)).join('\n');
			},
		},
		metadata: {
			all: {
				metadataBase: new URL(site.url),
				title: {
					default: site.name,
					template: `${site.name} - %s`,
				},
				description: site.description,
				openGraph: {
					title: site.name,
					siteName: site.name,
					url: site.url,
					locale: 'en_US',
					description: site.description,
					type: 'website',
				},
				appleWebApp: {
					statusBarStyle: 'black-translucent',
				},
				icons: {
					// Favicons from the favicon tokens
					icon: favicons
						.filter((favicon) => favicon.isHead)
						.map((favicon) => ({ rel: favicon.rel, sizes: favicon.size, type: favicon.type, url: favicon.src })),
				},
			} satisfies Metadata,
			viewport: {
				themeColor: settings.theme.system
					? ['light', 'dark'].map((theme) => ({ media: `(prefers-color-scheme: ${theme})`, color: themeColors[theme] }))
					: bg,
			} satisfies Viewport,
		},
		preload: {
			fonts: () => {
				// Preload fonts
				// Note: preload() only works while React is rendering, so call this inside a component
				fonts.forEach((font) => {
					if (font.isPreload) preload(font.src, { as: 'font', type: `font/${font.ext}`, crossOrigin: 'anonymous' });
				});
			},
		},
		styles: {
			fallbacks: () => {
				// Build style string of font-face rules for fallback fonts
				const styles = fallbacks
					.map((fallback) => {
						return `
							@font-face {
								font-family: '${fallback.family}';
								src: ${fallback.src};
								size-adjust: ${fallback.size};
							}
						`;
					})
					.join('');
				return head.format.styles(styles);
			},
			fonts: () => {
				// Build style string of font-face rules for theme fonts
				const styles = fonts
					.map((font) => {
						const src = font.isLocal ? `${font.src}` : `url('${font.src}') format('${font.ext}')`;
						return `
							@font-face {
								font-family: '${font.family}';
								src: ${src};
								font-weight: ${font.weight};
								font-style: ${font.style};
								font-display: ${font.display};
							}
						`;
					})
					.join('');
				return head.format.styles(styles);
			},
		},
	};

	return head;
};
