# @displaycoffee/styles

Sass helper functions and mixins. Neither file outputs any CSS on its own, so they're safe to `@use` in any stylesheet.

### Install

```
npm install --save-dev @displaycoffee/styles sass
```

### Usage

```scss
@use '@displaycoffee/styles/functions';
@use '@displaycoffee/styles/mixins';

.button {
	@include mixins.flex-layout((flex-flow: row nowrap, align-items: center));
	padding: functions.em(12px);

	@include mixins.respond(768px) {
		padding: functions.em(16px);
	}
}
```

Vite resolves these paths from `node_modules` without any extra config. Other Sass setups may need a `loadPaths: ['node_modules']` option.

### functions

- **em($pixels, $unit: em, $context: 16px)** - Converts pixels to `em`, or `rem` when `$unit` is `rem`.
- **string-replace($string, $search, $replace: '')** - Replaces every match in a string.
- **svg-encode($svg)** - Encodes an SVG string as a `url()` for `background-image`.

### mixins

- **Layout** - `flex`, `flex-child`, `flex-direction`, `flex-display`, `flex-flow`, `flex-icon-align`, `flex-layout`, `flex-parent`, `flex-spacer-align`, `flex-wrap`, `gap`, `gap-width`, `grid-columns`, `grid-layout`, `inline-block`, `position`, `position-fill`, `sizing`, `fluid-sizing`.
- **Responsive** - `respond($breakpoint, $rule: 'min-width')` wraps `@content` in a media query. Unitless breakpoints get `px`.
- **Text** - `ellipsis`, `line-clamp`, `text-decoration`, `text-decoration-color`, `placeholder`.
- **Images and icons** - `image-base`, `object-fit`, `icon-sizing`.
- **Visuals** - `border-radius`, `gradient`, `gradient-stripes`, `scrollbar`.
- **Animation** - `animate`, `animate-spin`, `animate-loading`, `transform`, `transition`, `toggle-content`.
- **Utilities** - `clearfix`, `if-exists` (only outputs properties whose values aren't `false`), `sr-only`.

See the comments in `_mixins.scss` for arguments and examples.
