/* Packages */
import type { MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from '@tanstack/react-router';

export const useViewTransition = () => {
	// Custom hook to use View Transitions API
	const navigate = useNavigate();
	const location = useLocation();

	return (e: MouseEvent<HTMLElement>, target: string | (() => void)) => {
		const isUrl = typeof target === 'string';

		if (!document.startViewTransition || e.ctrlKey || e.metaKey || e.shiftKey || (isUrl && target === location.pathname)) {
			return false;
		} else {
			e.preventDefault();

			const contentEl = document.querySelector('.content') as HTMLElement;
			if (contentEl) contentEl.style.viewTransitionName = 'page-content';

			void document
				.startViewTransition(async () => {
					// navigate() is async even for loaded routes, so wait for it to resolve (after the new page renders)
					if (isUrl) {
						await navigate({ href: target });
					} else {
						flushSync(() => target());
					}

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
				});
		}
	};
};
