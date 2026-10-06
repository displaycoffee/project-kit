/* Packages */
import fs from 'fs';
import path from 'path';

/* Scripts */
import { importData } from './project-data.js';

/* Project data */
const { breakpoints } = await importData('breakpoints');
const { colors } = await importData('colors');
const { fallbacks } = await importData('fallbacks');
const { favicons } = await importData('favicons');
const { fonts } = await importData('fonts');
const { settings } = await importData('settings');
const { site } = await importData('site');
const { targets } = await importData('targets');

/* Subtract 1 from a breakpoint like '768px' while keeping its unit, matching Sass's $breakpoint - 1 for max-width rules */
const belowBreakpoint = (breakpoint) => {
	const value = parseFloat(breakpoint);
	const unit = String(breakpoint).replace(/^-?[\d.]+/, '');
	return `${value - 1}${unit}`;
};

/* The template ships with this package, next to this script */
const templatePath = path.resolve(import.meta.dirname, 'src-template.html');
const htmlPath = path.resolve('./src/index.html');

if (fs.existsSync(templatePath)) {
	let html = fs.readFileSync(templatePath, 'utf8');

	// Create favicon links
	const faviconLinks = [];
	favicons.forEach((favicon) => {
		if (favicon.isHead) {
			faviconLinks.push(`<link href="${favicon.src}" rel="${favicon.rel}" sizes="${favicon.size}" type="${favicon.type}" />`);
		}
	});

	// Create fallback font details
	const fallbackFaces = [];
	fallbacks.forEach((fallback) => {
		fallbackFaces.push(`@font-face {
			font-family: '${fallback.family}';
			src: ${fallback.src};
			size-adjust: ${fallback.size};
		}`);
	});

	// Create font details
	const fontLinks = [];
	const fontFaces = [];
	fonts.forEach((font) => {
		// Only preload fonts needed for the first render; the rest load on demand through their @font-face rule
		if (font?.isPreload) fontLinks.push(`<link rel="preload" href="${font.src}" as="font" type="font/${font.ext}" crossorigin="anonymous" />`);
		fontFaces.push(`@font-face {
			font-family: '${font.family}';
			src: ${font.isLocal ? font.src : `url('${font.src}') format('${font.ext}')`};
			font-weight: ${font.weight};
			font-style: ${font.style};
			font-display: ${font.display};
		}`);
	});

	// Create theme color meta for the browser UI
	// Note: when the OS setting can switch themes, each theme gets its own color, otherwise the default theme's color is always used
	const themeColorMeta = [];
	if (settings.theme.system) {
		const themeColors = {
			[settings.theme.default]: colors.bg,
			[settings.theme.alternate]: colors[`bg-${settings.theme.alternate}`] ?? colors.bg,
		};
		['light', 'dark'].forEach((theme) => {
			themeColorMeta.push(`<meta name="theme-color" content="${themeColors[theme]}" media="(prefers-color-scheme: ${theme})" />`);
		});
	} else {
		themeColorMeta.push(`<meta name="theme-color" content="${colors.bg}" />`);
	}

	// Create target details
	const targetScripts = [];
	const targetElements = [];
	targets.forEach((target) => {
		if (target?.isScript) {
			targetScripts.push(`<script type="module" src="${target.src}"></script>`);
		}
		targetElements.push(target?.hasTabindex ? `<div id="${target.name}" tabindex="-1"></div>` : `<div id="${target.name}"></div>`);
	});

	// Update head
	// Create head meta, links and scripts
	const head = `
		<meta charset="utf-8" />
		<title>${site.name}</title>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="description" content="${site.description}" />
		<meta property="og:title" content="${site.name}" />
		<meta property="og:site_name" content="${site.name}" />
		<meta property="og:url" content="${site.url}" />
		<meta property="og:locale" content="en_US" />
		<meta property="og:description" content="${site.description}" />
		<meta property="og:type" content="website" />
		${themeColorMeta.join('')}
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
		${faviconLinks.join('')}
		<link rel="manifest" href="/manifest.json" />
		${fontLinks.join('')}
		${targetScripts.join('')}
		<style id="preloaded-styles">
			${fallbackFaces.join('')}
			${fontFaces.join('')}
			@media only screen and (max-width: ${belowBreakpoint(breakpoints.md)}) {
				html body .hide-mobile {
					display: none;
				}
			}
			@media only screen and (min-width: ${breakpoints.md}) {
				html body .hide-desktop {
					display: none;
				}
			}
		</style>
	`;

	const headRegex = /<!-- HEAD -->/g;
	html = html.replace(headRegex, () => {
		const cleanedContent = head
			.replace(/^\s*[\r\n]/gm, '')
			.replace(/[ \t]+$/gm, '')
			.trimEnd();
		return cleanedContent;
	});

	// Update targets
	const targetsRegex = /<!-- TARGETS -->/g;
	html = html.replace(targetsRegex, () => {
		return targetElements.join('');
	});

	// Build html
	fs.writeFileSync(htmlPath, html);

	console.log('🚀 Successfully built src/index.html. Re-build to generate new src code.');
} else {
	console.error(`❌ Error: ${templatePath} not found.`);
}
