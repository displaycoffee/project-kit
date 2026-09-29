#!/usr/bin/env node

/* Run a generate script by name, e.g. burmecia src */
/* Note: scripts read and write the project's files relative to the current folder, so run this from the project root (npm scripts do) */
const commands = {
	dist: 'dist-generate.js',
	public: 'public-generate.js',
	sitemap: 'sitemap-generate.js',
	src: 'src-generate.js',
};

const [command] = process.argv.slice(2);
const script = commands[command];

if (script) {
	await import(`./scripts/${script}`);
} else {
	console.error(`❌ Error: unknown command "${command ?? ''}". Use one of: ${Object.keys(commands).join(', ')}.`);
	process.exitCode = 1;
}
