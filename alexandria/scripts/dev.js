/* Packages */
import { execFile, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/* Dev server: runs the token and icon generators, starts next dev, and re-runs a generator when its source files change */
/* Note: Turbopack has no plugin API for this (unlike burmecia's tokensWatch() Vite plugin), so it runs alongside Next instead */
/* Extra arguments are passed to next dev, e.g. npm run dev -- --port 3001 (run through cli.js as alexandria dev) */

/* Paths */
/* Note: runs from the project root, like the npm scripts */
const projectPath = process.cwd();
const nextPath = fileURLToPath(import.meta.resolve('next/dist/bin/next'));

/* Arguments after alexandria dev (process.argv is node, cli.js, dev, ...) */
const nextArgs = process.argv.slice(3);

/* Generators and the source files that trigger them */
/* Note: each one ignores its own output (theme.json, icons.ts) so a rebuild doesn't trigger itself */
const generators = [
	{
		name: 'tokens',
		script: fileURLToPath(import.meta.resolve('@displaycoffee/tokens/generate')),
		folder: path.resolve('src/_core/tokens'),
		isSource: (file) => file.endsWith('.json') && file !== 'theme.json',
		success: 'rebuilt _root.scss, _theme.scss, and theme.json',
	},
	{
		name: 'icons',
		script: fileURLToPath(new URL('./icons-generate.js', import.meta.url)),
		folder: path.resolve('src/_core/data'),
		isSource: (file) => file === 'icons.json',
		success: 'rebuilt icons.ts',
	},
];

const log = (name, message, isError) => {
	const time = new Date().toLocaleTimeString();
	(isError ? console.error : console.log)(`${time} [${name}] ${message}`);
};

/* Run a generator, queuing one more run if its sources change while it's still building */
const run = (generator) =>
	new Promise((resolve) => {
		if (generator.isRunning) {
			generator.isQueued = true;
			return resolve(true);
		}

		generator.isRunning = true;
		execFile(process.execPath, [generator.script], { cwd: projectPath }, (error, stdout, stderr) => {
			generator.isRunning = false;

			if (error) {
				log(generator.name, (stderr || stdout || error.message).trim(), true);
			} else {
				log(generator.name, generator.success);
			}

			if (generator.isQueued) {
				generator.isQueued = false;
				run(generator);
			}
			resolve(!error);
		});
	});

/* 1. Build everything once before Next starts, and stop if a generator fails */
const results = await Promise.all(generators.map(run));
if (results.includes(false)) process.exit(1);

/* 2. Start next dev */
const next = spawn(process.execPath, [nextPath, 'dev', '--experimental-https', ...nextArgs], { stdio: 'inherit' });

/* 3. Watch each generator's source folder */
/* Note: fs.watch can fire several events for one save (especially on Windows), so changes are debounced */
const watchers = generators.map((generator) =>
	fs.watch(generator.folder, (_event, file) => {
		if (!file || !generator.isSource(file)) return;
		clearTimeout(generator.timer);
		generator.timer = setTimeout(() => run(generator), 100);
	}),
);

/* 4. Shut down together: when Next exits, stop watching and exit with its code */
next.on('exit', (code) => {
	watchers.forEach((watcher) => watcher.close());
	process.exit(code ?? 0);
});

// Ctrl+C reaches Next directly, so only forward other termination signals
process.on('SIGTERM', () => next.kill('SIGTERM'));
