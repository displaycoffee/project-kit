/* Any generated theme.json works, since every token group is optional */
export type ThemeJson = Record<string, unknown>;

export type Fallback = {
	family: string;
	size: string;
	src: string;
};

export type Favicon = {
	isHead: boolean;
	isManifest: boolean;
	purpose: string;
	rel: string;
	src: string;
	size: string;
	sizes: string;
	type: string;
};

export type Font = {
	display: string;
	ext: string;
	family: string;
	isLocal: boolean;
	isPreload: boolean;
	src: string;
	style: string;
	weight: string | number;
};

export type ThemeMode = 'light' | 'dark';

export type Settings = {
	theme: {
		default: ThemeMode;
		alternate: ThemeMode;
		system: boolean;
	};
};

export declare const getFallbacks: (themeJson: ThemeJson) => Fallback[];
export declare const getFavicons: (themeJson: ThemeJson) => Favicon[];
export declare const getFonts: (themeJson: ThemeJson) => Font[];
export declare const getSettings: (themeJson: ThemeJson) => Settings;
