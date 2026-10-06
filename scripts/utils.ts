/* Scripts */
import type { UtilsType, UtilsBrowserType } from './utils-types';

/* Note: "utils" functions are safe anywhere (Server Components, Client Components, metadata files). */
/* "utilsBrowser" functions use window / document, so only call them in useEffect or event handlers, never during render. */
export const utils: UtilsType = {
	getLast: (value, delimeter) => {
		// Get last item in array
		let valueArray: string[] = [];
		if (Array.isArray(value)) {
			valueArray = value;
		} else if (delimeter) {
			valueArray = value.split(delimeter);
		}
		return valueArray[valueArray.length - 1] ?? '';
	},
	handleize: (value) => {
		// Format value for html classes
		return value.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s/g, '-').replace(/-+/g, '-');
	},
	stripHTML: (string) => {
		// Remove HTML from string
		if (!string) return '';
		return string.replace(/\n/g, ' ').replace(/<[^>]*>/g, '').trim();
	},
	truncate: (string, limit) => {
		// Limit characters in string
		if (!string) return '';
		if (string.length > limit) {
			return `${string.slice(0, limit - 3)}...`;
		} else {
			return string;
		}
	},
};

export const utilsBrowser: UtilsBrowserType = {
	isSticky: (element, stickyClass) => {
		if (element) {
			// Create options and callback for observer
			const stickyOptions = { threshold: [1] };
			const stickyCallback = (e: IntersectionObserverEntry) => {
				e.target.classList.toggle(stickyClass, e.intersectionRatio < 1);
			};

			// Observe to toggle sticky class
			const stickyObserver = new IntersectionObserver(([e]) => stickyCallback(e), stickyOptions);
			stickyObserver.observe(element);

			// Return cleanup so callers can stop observing (e.g. in a useEffect cleanup)
			return () => stickyObserver.disconnect();
		}
		return undefined;
	},
	scrollTo: (e, selector, offset) => {
		// Scroll to element on page
		if (e) {
			e.preventDefault();
		}
		const anchor = {
			selector: selector ?? '',
			offset: offset ?? 0,
			position: () => {
				const anchorElement = anchor.selector ? document.querySelector(anchor.selector) : false;
				return anchorElement ? anchorElement.getBoundingClientRect().top + window.scrollY - anchor.offset : -anchor.offset;
			},
		};
		window.scroll({ top: anchor.position(), left: 0, behavior: 'smooth' });

		// Move focus to the target so keyboard/screen-reader users know where they landed
		if (anchor.selector) {
			const anchorElement = document.querySelector<HTMLElement>(anchor.selector);
			anchorElement?.focus({ preventScroll: true });
		}
	},
	setAttributes: (element, attributes) => {
		// Set multiple attributes on an element
		for (const attribute in attributes) {
			element.setAttribute(attribute, attributes[attribute]);
		}
	},
	setAvailableMinHeight: (element) => {
		// Reserves exactly the viewport space around this element — regardless of what surrounds it,
		// or how many pieces (header, nav, footer, none of the above) — so content mounting in later
		// doesn't shift whatever comes after it. Sets min-height directly, no CSS-side setup needed.
		const updateMinHeight = () => {
			// Temporarily clear so this element's own current height can't feed back into the
			// measurement (its min-height from a prior run would otherwise inflate scrollHeight)
			element.style.minHeight = '';

			const rect = element.getBoundingClientRect();
			const spaceAbove = rect.top + window.scrollY;
			const spaceBelow = document.documentElement.scrollHeight - (rect.bottom + window.scrollY);
			const minHeight = Math.max(0, window.innerHeight - spaceAbove - spaceBelow);

			element.style.minHeight = `${minHeight}px`;
		};

		// Set it synchronously before paint too — ResizeObserver's first callback is only
		// guaranteed to fire eventually, not synchronously ahead of the next paint
		updateMinHeight();

		// Watch the whole page rather than individual siblings — anything that changes the
		// page's total height (header, nav, footer, the element's own content, none of the above)
		// should trigger a recompute, without this needing to know what those things are
		const observer = new ResizeObserver(updateMinHeight);
		observer.observe(document.body);
		window.addEventListener('resize', updateMinHeight);

		// Return cleanup so callers can stop watching (e.g. in a useLayoutEffect cleanup)
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', updateMinHeight);
		};
	},
};
