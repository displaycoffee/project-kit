/* Packages */
import type { Route } from 'next';
import type { MouseEvent, RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';

/* Scripts */
import { utilsBrowser } from './utils';

export const useAvailableMinHeight = (ref: RefObject<HTMLElement | null>) => {
	// main persists across routes, so a stale min-height can hold it at the old size and mask
	// the resize from ResizeObserver. Re-run on pathname change to force a fresh measurement.
	const pathname = usePathname();

	// Reserves the viewport space around this element (see utilsBrowser.setAvailableMinHeight)
	useLayoutEffect(() => {
		const element = ref.current;
		if (!element) return;

		return utilsBrowser.setAvailableMinHeight(element);
	}, [ref, pathname]);
};

/* Variables for useBodyClass */
const bodyPrefix = 'page-';

export const useBodyClass = (defaultPrefix: string) => {
	// Adds a page-* class to body for the current route, e.g. /some/path becomes page-some-path
	const pathname = usePathname();

	useEffect(() => {
		// Replace any body prefix, remove first slash, and replace any other slash with hyphen
		const page = pathname.replace(bodyPrefix, '').replace(/\/+$/, '').replace('/', '').replace(/\//g, '-');
		const className = `${bodyPrefix}${page || defaultPrefix}`;

		// Add new body class, and remove it again when the route changes or the component unmounts
		document.body.classList.add(className);
		return () => document.body.classList.remove(className);
	}, [pathname, defaultPrefix]);
};

export const useViewTransition = () => {
	// Custom hook to use View Transitions API
	const router = useRouter();
	const pathname = usePathname();

	// router.push() can't be awaited, so resolve navigation once the new pathname has rendered
	const resolveNavigation = useRef<(() => void) | null>(null);

	useLayoutEffect(() => {
		resolveNavigation.current?.();
		resolveNavigation.current = null;
	}, [pathname]);

	return (e: MouseEvent<HTMLElement>, target: Route | (() => void)) => {
		const isUrl = typeof target === 'string';

		if (!document.startViewTransition || e.ctrlKey || e.metaKey || e.shiftKey || (isUrl && target === pathname)) {
			return false;
		} else {
			e.preventDefault();

			const contentEl = document.querySelector('.content') as HTMLElement;
			if (contentEl) contentEl.style.viewTransitionName = 'page-content';
			let newContentEl: HTMLElement | null = null;

			void document
				.startViewTransition(async () => {
					// Wait for the new page to render before the transition captures it
					// Note: capped in case the pathname never changes (e.g. only the query or hash differs)
					if (isUrl) {
						await Promise.race([
							new Promise<void>((resolve) => {
								resolveNavigation.current = resolve;
								router.push(target);
							}),
							new Promise((resolve) => setTimeout(resolve, 2000)),
						]);
					} else {
						flushSync(() => target());
					}

					// Moving between route groups swaps the group layout, so .content is a new element that needs the name too
					// Note: without it, the old snapshot has nothing to transition to and the page swaps instantly
					newContentEl = document.querySelector('.content');
					if (newContentEl && newContentEl !== contentEl) newContentEl.style.viewTransitionName = 'page-content';

					// Wait for visible images that haven't loaded, so the content doesn't change size mid-transition
					const pendingImages = [...document.querySelectorAll<HTMLImageElement>('.content img')].filter((img) => {
						return !img.complete && img.getBoundingClientRect().top < window.innerHeight;
					});
					pendingImages.forEach((img) => {
						img.loading = 'eager'; // Lazy images may not start loading while rendering is paused for the transition
					});

					// Cap the wait so a slow image can't stall the transition
					await Promise.race([
						Promise.all(pendingImages.map((img) => img.decode().catch(() => undefined))),
						new Promise((resolve) => setTimeout(resolve, 300)),
					]);
				})
				.finished.finally(() => {
					if (contentEl) contentEl.style.viewTransitionName = '';
					if (newContentEl) newContentEl.style.viewTransitionName = '';
				});
		}
	};
};
