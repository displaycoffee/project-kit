/* Packages */
import { useCallback, useId, useSyncExternalStore } from 'react';

export const useFormattedId = () => {
	// Updates the format of useId hook
	const id = useId();
	return id.slice(1, -1).replace(/^_|_$/g, '').replace(/_/g, '-');
};

export const useRespond = (bp: string, rule: 'min-width' | 'max-width' = 'min-width') => {
	// Match a media query and update on change
	// Note: the server has no window, so it renders as a non-match (e.g. mobile for 'min-width') and the browser corrects it after hydration
	const query = `(${rule}: ${bp})`;

	// Note: subscribe is memoized so React only resubscribes when the query changes
	const subscribe = useCallback(
		(onChange: () => void) => {
			const mediaQuery = window.matchMedia(query);
			mediaQuery.addEventListener('change', onChange);
			return () => mediaQuery.removeEventListener('change', onChange);
		},
		[query],
	);

	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => false,
	);
};
