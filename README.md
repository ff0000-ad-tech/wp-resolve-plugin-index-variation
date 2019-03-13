# Index Variation Resolve Plugin

Enables an `@index` alias for ES6 imports (both static and dynamic/asynchronous) which resolves to the name of a folder passed to it that contains index-specific variations within a ff0000-ad-tech ad build.

# Overview

For example, say we have two index files, `index.html` and `index-diff.html`. However, in `index-diff.html`, we want to import pretty much all of the assets used with `index.html` except for a few images specific to `index-diff.html`. So when importing images in the unit's build scripts, we can use the `@index` to allow using the standard assets for both indexes but also allow `index-diff` to override certain imports. With the given folder structure:

```
1-build (directory)
  > 300x250 (directory)
    > Ad.js 
    > images (directory)
      > bg.jpg
      > index-diff (directory)
        > bg.jpg
```

From `Ad.js`, if we wanted to import `bg.jpg` while allowing an override for `index-diff`, we can use:

```js
// Ad.js

import './images/@index/bg.jpg'
``` 

If the previous import doesn't work and the RED `@size` alias is available, you can try pathing from the `@size` alias instead:

```js
import '@size/images/@index/bg.jpg'
```

@index resolves to a directory that is the index file name without the .html extension. In this, if compiling a build for `index-diff.html`, `@index` would resolve to `"index-diff"`.

If no file exists after @index is resolved, it simply falls back to the parent directory that would have held the index folder. For `index.html`, no `index` folder exists in `images` so the resolver will import from `"./images/bg.jpg"` instead and let the developer know

If the resolver still can't find a file after falling back to the parent directory, Webpack will import an error about being unable to resolve the file, per usual

# Installation

With NPM:
```
npm i --save-dev @ff0000-ad-tech/wp-resolve-plugin-index-variation
```

Then in your Webpack config, require the plugin at the top, instantiate it with the path of the index-specific folder you want to use in your build, and add it to the final config object's `resolve.plugins` property in an array:
```
// most likely, webpack.config.js

/* ... */
const IndexVariationResolvePlugin = require('@ff0000-ad-tech/wp-resolve-plugin-index-variation')

/* ... */
const indexName = path.resolve('1-build/300x250/images/index-diff')
module.exports = {
  /* ... */
  resolve: {
    /* ... */
    plugins: [new IndexVariationResolvePlugin(indexName)]
    /* ... */
  }
}

```
