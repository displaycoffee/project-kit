#!/usr/bin/env node

/* Run a script by name, e.g. alexandria dev */
/* Note: scripts read and write the project's files relative to the current folder, so run this from the project root (npm scripts do) */
/* Note: extra arguments are left in process.argv, so alexandria dev -- --port 3001 passes --port 3001 to next dev */
const commands = {
	dev: 'dev.js',
	icons: 'icons-generate.js',
};

const [command] = process.argv.slice(2);
const script = commands[command];

if (script) {
	await import(`./scripts/${script}`);
} else {
	console.error(`❌ Error: unknown command "${command ?? ''}". Use one of: ${Object.keys(commands).join(', ')}.`);
	process.exitCode = 1;
}
