/* Packages */
import type { SyntheticEvent } from 'react';

/* Type definitions */
type Utils = {
	getLast: UtilsGetLast;
	handleize: UtilsHandleize;
	stripHTML: UtilsStripHTML;
	truncate: UtilsTruncate;
};

type UtilsBrowser = {
	isSticky: UtilsIsSticky;
	scrollTo: UtilsScrollTo;
	setAttributes: UtilsSetAttributes;
	setAvailableMinHeight: UtilsSetAvailableMinHeight;
};

type UtilsGetLast = (value: string | string[], delimeter?: string) => string;

type UtilsHandleize = (value: string) => string;

type UtilsIsSticky = (element: HTMLElement | null, stickyClass: string) => (() => void) | undefined;

type UtilsScrollTo = (e?: SyntheticEvent | Event, selector?: string, offset?: number) => void;

type UtilsSetAttributes = (element: HTMLElement, attributes: { [key: string]: string }) => void;

type UtilsSetAvailableMinHeight = (element: HTMLElement) => () => void;

type UtilsStripHTML = (string?: string | null) => string;

type UtilsTruncate = (string: string | null | undefined, limit: number) => string;

/* Export types */
export type UtilsType = Utils;

export type UtilsBrowserType = UtilsBrowser;

export type UtilsGetLastType = UtilsGetLast;

export type UtilsHandleizeType = UtilsHandleize;

export type UtilsIsStickyType = UtilsIsSticky;

export type UtilsScrollToType = UtilsScrollTo;

export type UtilsSetAttributesType = UtilsSetAttributes;

export type UtilsSetAvailableMinHeightType = UtilsSetAvailableMinHeight;

export type UtilsStripHTMLType = UtilsStripHTML;

export type UtilsTruncateType = UtilsTruncate;
