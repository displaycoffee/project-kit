/* Build fallback font families */
/* Note: fallback tokens are optional, so a project without them gets an empty list */
export const getFallbacks = (themeJson) => {
	const json = themeJson.fallback ?? {};
	const keys = Object.keys(json).filter((key) => key.startsWith('src-'));

	return keys.map((fallback) => {
		const key = fallback.includes('header') ? 'header' : 'body';

		return {
			family: json[`name-${key}`],
			size: json[`size-${key}`],
			src: json[fallback],
		};
	});
};

/* Build favicons */
/* Note: favicon tokens are optional, so a project without them gets an empty list */
export const getFavicons = (themeJson) => {
	const json = themeJson.favicon ?? {};
	const keys = Object.keys(json).filter((key) => key.startsWith('src-'));

	/* Not every favicon has head / manifest / purpose / sizes tokens, so these return a fallback when a token is missing */
	const getBoolean = (name) => json[name] === true;
	const getString = (name) => {
		const value = json[name];
		return typeof value === 'string' ? value : undefined;
	};

	return keys.map((favicon) => {
		const current = getString(favicon) ?? '';
		const key = favicon.replace('src-', '');
		const size = getString(`size-${key}`) ?? '';

		// Set type attribute
		let type = 'image/png';
		if (current.includes('.svg')) {
			type = 'image/svg+xml';
		} else if (current.includes('.ico')) {
			type = 'image/x-icon';
		}

		return {
			isHead: getBoolean(`head-${key}`),
			isManifest: getBoolean(`manifest-${key}`),
			purpose: getString(`purpose-${key}`) ?? 'any',
			rel: current.includes('apple-touch-icon') ? 'apple-touch-icon' : 'icon',
			src: current,
			size: size,
			sizes: getString(`sizes-${key}`) ?? size,
			type: type,
		};
	});
};

/* Build font families */
/* Note: font tokens are optional, so a project without them gets an empty list */
export const getFonts = (themeJson) => {
	const json = themeJson.font ?? {};
	const keys = Object.keys(json).filter((key) => key.startsWith('src-'));

	/* Get a token as a string (src and name tokens are always strings) */
	const getString = (name) => {
		const value = json[name];
		return typeof value === 'string' ? value : '';
	};

	return keys.map((font) => {
		const current = getString(font).trim();
		const key = font.includes('header') ? 'header' : 'body';
		const weight = font.includes('bold') ? 700 : 400;
		const srcSplit = current.split('.');

		// Fonts can be files or already installed on the device (e.g. local('Courier New'))
		const isLocal = current.startsWith('local(');

		// Preload the non-italic file each family uses first: regular for body text, and the header weight token for headers
		// Note: local fonts aren't downloaded, so they're never preloaded
		const preloadWeight = key === 'header' ? json['weight-header'] : 400;
		const isPreload = !isLocal && !font.includes('italic') && weight === preloadWeight;

		return {
			display: 'swap',
			ext: isLocal ? '' : srcSplit[srcSplit.length - 1],
			family: getString(`name-${key}`),
			isLocal: isLocal,
			isPreload: isPreload,
			src: current,
			style: font.includes('italic') ? 'italic' : 'normal',
			weight: weight,
		};
	});
};

/* Build project settings */
/* Note: setting tokens are optional, so a project without them gets the defaults (light theme that follows the OS) */
export const getSettings = (themeJson) => {
	const json = themeJson.setting ?? {};
	const defaultTheme = json['theme-default'] === 'dark' ? 'dark' : 'light';

	return {
		theme: {
			default: defaultTheme,
			alternate: defaultTheme === 'dark' ? 'light' : 'dark',
			system: json['theme-system'] !== false,
		},
	};
};
