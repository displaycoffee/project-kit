/* Packages */
import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('dist/index.html');

if (fs.existsSync(htmlPath)) {
	let html = fs.readFileSync(htmlPath, 'utf8');

	// CSS print hack
	const cssRegex = /<link rel="stylesheet" crossorigin href="([^"]+)">/g;
	html = html.replace(cssRegex, (match, href) => {
		return `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'" />
		<noscript><link rel="stylesheet" href="${href}" /></noscript>`;
	});

	// Extract and remove the preloaded-styles block
	const preloadedStylesRegex = /<style id="preloaded-styles">([\s\S]*?)<\/style>/;
	const preloadedStylesMatch = html.match(preloadedStylesRegex);
	let fullStyleBlock = '';
	if (preloadedStylesMatch) {
		fullStyleBlock = preloadedStylesMatch[0];
		html = html.replace(preloadedStylesRegex, '');
	}

	// Re-inject font-face block after the scripts: after the last module preload, or the entry script if there are none, or at the end of <head>
	// Note: this doesn't depend on chunk names, so it works the same in every project
	if (fullStyleBlock) {
		const preloadTags = html.match(/<link rel="modulepreload"[^>]*>/g) ?? [];
		const entryTag = html.match(/<script type="module"[^>]*><\/script>/)?.[0];
		const anchorTag = preloadTags.at(-1) ?? entryTag;
		html = anchorTag
			? html.replace(anchorTag, () => `${anchorTag}\n${fullStyleBlock}`)
			: html.replace('</head>', () => `${fullStyleBlock}\n</head>`);
	}

	// Collapse empty lines in <head>
	// This looks for the <head> section and finds any instance of 2+ newlines
	html = html.replace(/<head>([\s\S]*?)<\/head>/, (match, headContent) => {
		const cleanedContent = headContent
			.replace(/^\s*[\r\n]/gm, '')
			.replace(/[ \t]+$/gm, '')
			.trimEnd();
		return `<head>${cleanedContent}\n</head>`;
	});

	// Build html
	fs.writeFileSync(htmlPath, html);

	console.log('🚀 Successfully built dist/index.html. Preloads added and custom order applied!');
} else {
	console.error('❌ Error: dist/index.html not found. Run "npm run build" first.');
}
