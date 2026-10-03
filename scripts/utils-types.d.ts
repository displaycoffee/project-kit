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
	getPage: UtilsGetPage;
	isSticky: UtilsIsSticky;
	scrollTo: UtilsScrollTo;
	setAttributes: UtilsSetAttributes;
};

type UtilsGetLast = (value: string | string[], delimeter?: string) => string;

type UtilsGetPage = () => string;

type UtilsHandleize = (value: string) => string;

type UtilsIsSticky = (element: HTMLElement | null, stickyClass: string) => (() => void) | undefined;

type UtilsScrollTo = (e?: SyntheticEvent | Event, selector?: string, offset?: number) => void;

type UtilsSetAttributes = (element: HTMLElement, attributes: { [key: string]: string }) => void;

type UtilsStripHTML = (string?: string | null) => string;

type UtilsTruncate = (string: string | null | undefined, limit: number) => string;

/* Export types */
export type UtilsType = Utils;

export type UtilsBrowserType = UtilsBrowser;

export type UtilsGetLastType = UtilsGetLast;

export type UtilsGetPageType = UtilsGetPage;

export type UtilsHandleizeType = UtilsHandleize;

export type UtilsIsStickyType = UtilsIsSticky;

export type UtilsScrollToType = UtilsScrollTo;

export type UtilsSetAttributesType = UtilsSetAttributes;

export type UtilsStripHTMLType = UtilsStripHTML;

export type UtilsTruncateType = UtilsTruncate;
