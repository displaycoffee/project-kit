#!/usr/bin/env node
/* Packages */
import StyleDictionary from 'style-dictionary';
import { getReferences, usesReferences } from 'style-dictionary/utils';

/* Get a token's value for the alternate theme from $extensions.dark or $extensions.light (tokens without one keep their default value) */
const getAlternate = (token, theme) => token.$extensions?.[theme] ?? token.original?.$extensions?.[theme];

/* Theme settings come from the setting.theme tokens (settings.json)
   - default: the theme $value is written for, either 'light' or 'dark'
   - system: whether the OS setting can switch to the alternate theme, or only a manual [data-theme] toggle can */
const getThemeSettings = (dictionary) => {
	const allTokens = dictionary.unfilteredAllTokens ?? dictionary.allTokens;
	const getSetting = (name) => allTokens.find((token) => token.path.join('.') === `setting.theme.${name}`)?.$value;
	const defaultTheme = getSetting('default') ?? 'light';
	if (defaultTheme !== 'light' && defaultTheme !== 'dark') {
		throw new Error(`Token "setting.theme.default" is "${defaultTheme}", but it must be "light" or "dark".`);
	}
	return {
		defaultTheme,
		alternateTheme: defaultTheme === 'dark' ? 'light' : 'dark',
		system: getSetting('system') !== false,
	};
};

/* Fail the build if a token has a value for the default theme in $extensions (e.g. "dark" when the default theme is dark) */
/* Note: it would never be output, since $value is already the default theme's value */
const checkThemeExtensions = (dictionary, { defaultTheme, alternateTheme }) => {
	const allTokens = dictionary.unfilteredAllTokens ?? dictionary.allTokens;

	allTokens.forEach((token) => {
		if (getAlternate(token, defaultTheme) === undefined) return;
		const tokenPath = token.path.join('.');
		throw new Error(
			`Token "${tokenPath}" has a "${defaultTheme}" value, but ${defaultTheme} is the default theme. Put the ${defaultTheme} value in $value and the ${alternateTheme} value in "$extensions": { "${alternateTheme}": ... }.`,
		);
	});
};

/* Static tokens are output as plain Sass values instead of custom properties, for values Sass needs at compile time */
/* Note: breakpoints are static since var() doesn't work in media queries, and spacing / font since they're used in Sass math (negatives, division, em(), etc.) */
/* Other tokens can opt in individually with "$extensions": { "static": true } */
const staticCategories = ['breakpoint', 'font', 'spacing'];
const isStatic = (token) => staticCategories.includes(token.path[0]) || (token.$extensions?.static ?? token.original?.$extensions?.static) === true;

/* Tokens with "$extensions": { "sass": false } are left out of _root.scss and _theme.scss, but still go to theme.json for the build scripts */
/* Note: e.g. build-only values like font file paths, or values that are only referenced by other tokens */
const isSassExcluded = (token) => (token.$extensions?.sass ?? token.original?.$extensions?.sass) === false;

/* Tokens set to false aren't used in this project, so they're left out of :root and output as $name: false in Sass */
const isUnset = (token) => token.$value === false;

/* Fail the build if a token uses an unset (false) token inside a larger value, e.g. color-mix(in srgb, {color.unused} 50%, transparent) */
/* Note: a token that is only a reference to an unset token (e.g. "{color.unused}") resolves to false, so it's treated as unset itself */
/* Note: uses the unfiltered tokens so tokens excluded from this file (e.g. sass: false) are still checked */
const checkUnsetReferences = (dictionary) => {
	const allTokens = dictionary.unfilteredAllTokens ?? dictionary.allTokens;
	const tokens = dictionary.unfilteredTokens ?? dictionary.tokens;

	allTokens.forEach((token) => {
		const original = token.original.$value;
		if (isUnset(token) || typeof original !== 'string' || !usesReferences(original)) return;

		const unsetReferences = getReferences(original, tokens).filter(isUnset);
		if (unsetReferences.length !== 0) {
			const tokenPath = token.path.join('.');
			const referencePaths = unsetReferences.map((reference) => reference.path.join('.')).join(', ');
			throw new Error(`Token "${tokenPath}" references "${referencePaths}", which is set to false. Give it a value or update "${tokenPath}".`);
		}
	});
};

/* Set comment for generated files */
const comment = `// Do not edit directly, this file was auto-generated.`;

/* Format tokens as :root custom properties with default / alternate theme values */
/* Note: this outputs CSS, so it should only be imported once (in container.scss) */
StyleDictionary.registerFormat({
	name: 'scss/theme-properties',
	format: ({ dictionary }) => {
		const settings = getThemeSettings(dictionary);
		const { defaultTheme, alternateTheme, system } = settings;
		checkUnsetReferences(dictionary);
		checkThemeExtensions(dictionary, settings);
		const tokens = dictionary.allTokens.filter((token) => !isStatic(token) && !isUnset(token));
		const toProperty = (token, value) => `\t--${token.name}: ${value};`;
		const base = tokens.map((token) => toProperty(token, token.$value)).join('\n');
		const alternate = tokens
			.filter((token) => getAlternate(token, alternateTheme) !== undefined)
			.map((token) => toProperty(token, getAlternate(token, alternateTheme)))
			.join('\n');

		// Only output alternate styles if at least one token has an alternate value, so single-theme projects keep native UI in the default theme
		const hasAlternate = alternate.length !== 0;
		const alternateProperties = `\tcolor-scheme: ${alternateTheme};\n${alternate}`;

		// Note: the alternate block is output twice - once to follow the OS setting (unless system is false), once for a manual [data-theme] toggle
		const rootDefault = `:root {\n\tcolor-scheme: ${defaultTheme};\n${base}\n}`;
		const prefersAlternate = `@media (prefers-color-scheme: ${alternateTheme}) {\n\t:root:not([data-theme='${defaultTheme}']) {\n${alternateProperties.replace(/^/gm, '\t')}\n\t}\n}`;
		const rootAlternate = `:root[data-theme='${alternateTheme}'] {\n${alternateProperties}\n}`;
		const blocks = !hasAlternate ? [rootDefault] : system ? [rootDefault, prefersAlternate, rootAlternate] : [rootDefault, rootAlternate];
		return `${comment}\n${blocks.join('\n\n')}`;
	},
});

/* Format tokens as Sass variables that point to their custom properties (static tokens get their plain value, unset tokens get false) */
/* Note: this outputs no CSS, so it's safe to @use in any stylesheet */
StyleDictionary.registerFormat({
	name: 'scss/theme-variables',
	format: ({ dictionary }) => {
		const sassVars = dictionary.allTokens
			.map((token) => `$${token.name}: ${isUnset(token) || isStatic(token) ? token.$value : `var(--${token.name})`};`)
			.join('\n');
		return `${comment}\n${sassVars}`;
	},
});

/* Format resolved token values as JSON for the build scripts, grouped by category (e.g. { color: { bg, bg-dark } }) */
/* Note: alternate values are suffixed with the alternate theme, so bg-dark when the default theme is light, or bg-light when it's dark */
StyleDictionary.registerFormat({
	name: 'json/theme',
	format: ({ dictionary }) => {
		const { alternateTheme } = getThemeSettings(dictionary);
		const theme = {};

		dictionary.allTokens.forEach((token) => {
			const [category, ...path] = token.path;
			const key = path.join('-');
			const alternate = getAlternate(token, alternateTheme);
			theme[category] ??= {};
			theme[category][key] = token.$value;
			if (alternate !== undefined && !isUnset(token)) theme[category][`${key}-${alternateTheme}`] = alternate;
		});

		return `${JSON.stringify(theme, null, '\t')}\n`;
	},
});

const sd = new StyleDictionary({
	// Path to your raw JSON token files
	// Note: theme.json is excluded because it's generated into the same folder by the json platform below
	source: ['src/_core/tokens/!(theme).json'],
	platforms: {
		scss: {
			transformGroup: 'scss',
			buildPath: 'src/_core/styles/',
			files: [
				{
					destination: '_root.scss',
					format: 'scss/theme-properties', // Compiles to :root { --variable-name: value; } with alternate theme overrides
					filter: (token) => !isSassExcluded(token),
				},
				{
					destination: '_theme.scss',
					format: 'scss/theme-variables', // Compiles to $variable-name: var(--variable-name);
					filter: (token) => !isSassExcluded(token),
				},
			],
		},
		json: {
			transformGroup: 'scss',
			buildPath: 'src/_core/tokens/',
			files: [
				{
					destination: 'theme.json',
					format: 'json/theme', // Compiles to { "color": { "bg": "#fdfdfd", "bg-dark": "#1a1a1a" } }
				},
			],
		},
	},
});

await sd.buildAllPlatforms();

console.log('🚀 Successfully built tokens into _root.scss, _theme.scss, and theme.json.');
