/* Packages */
import fs from 'fs';
import path from 'path';

/* Scripts */
import { importData } from './project-data.js';

/* Project data */
const { colors } = await importData('colors');
const { favicons } = await importData('favicons');
const { site } = await importData('site');

const jsonPath = path.resolve('./public/manifest.json');

/* Format manifest icons */
const manifestIcons = favicons
	.filter((favicon) => favicon.isManifest)
	.map((favicon) => {
		return {
			src: favicon.src,
			type: favicon.type,
			sizes: favicon.sizes,
			purpose: favicon.purpose,
		};
	});

/* Create manifest json object */
const jsonManifest = {
	short_name: site.name,
	name: site.description,
	icons: manifestIcons,
	start_url: '.',
	display: 'standalone',
	theme_color: colors.bg,
	background_color: colors.bg,
};

/* Build manifest json */
fs.writeFileSync(jsonPath, JSON.stringify(jsonManifest));

console.log('🚀 Successfully built public/manifest.json. Re-build to generate new public code.');
