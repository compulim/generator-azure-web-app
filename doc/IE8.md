# Support Internet Explorer 8

A couple of changes is required to build a bundle for Internet Explorer 8.

## Disable hot module replacement on development server

Run `npm start -- --hot false` to start a development server without hot module replacement.

## Use `react@^0.14` and add `es5-shim`

Copy the following code to `index.html`.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.9/es5-shim.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.9/es5-sham.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/console-polyfill/0.2.3/index.min.js"></script>
<script src="https://unpkg.com/react@0.14/dist/react.min.js"></script>
<script src="https://unpkg.com/react-dom@0.14/dist/react-dom.min.js"></script>
```

## Look for IE8-friendly NPM packages

Some NPM packages are not IE8 friendly. For example, [`fetch`](https://npmjs.com/package/fetch) does not support IE8. You may need to use [`fetch-ie8`](https://www.npmjs.com/package/fetch-ie8) instead.

Moreoever, some packages might be pre-transpiled, they might not have reserved keywords properly escaped. There are two ways to tackle this issue:

* Contact package developer and kindly ask them to either
  * Add [`module`](https://github.com/rollup/rollup/wiki/pkg.module) in `package.json` and reference to non-transpiled version of code, or,
  * Escape reserved keywords during transpilation
* Use Webpack instead of Rollup: our Webpack workflow is peconfigured to escape reserved keywords even if they are in `node_modules/` folder
