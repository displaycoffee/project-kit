/* Packages */
import type { RefObject } from 'react';
import { useLayoutEffect } from 'react';

/* Scripts */
import { utilsBrowser } from './utils';

export const useAvailableMinHeight = (ref: RefObject<HTMLElement | null>) => {
	// Reserves the viewport space around this element (see utilsBrowser.setAvailableMinHeight)
	useLayoutEffect(() => {
		const element = ref.current;
		if (!element) return;

		let cleanup = utilsBrowser.setAvailableMinHeight(element);

		// With <ClientRouter /> and transition:persist, the island survives page swaps, so a stale min-height
		// can hold it at the old size and mask the resize from ResizeObserver. Re-measure after each navigation.
		// Note: astro:page-load also fires on the first load, which just measures again
		const handlePageLoad = () => {
			cleanup();
			cleanup = utilsBrowser.setAvailableMinHeight(element);
		};
		document.addEventListener('astro:page-load', handlePageLoad);

		return () => {
			document.removeEventListener('astro:page-load', handlePageLoad);
			cleanup();
		};
	}, [ref]);
};
