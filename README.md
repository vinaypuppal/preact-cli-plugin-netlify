# preact-cli-plugin-netlify

Preact cli plugin for generating h2push headers and redirect(for SPA) rules for [netlify](https://www.netlify.com/)

[![NPM version](https://img.shields.io/npm/v/preact-cli-plugin-netlify.svg)](https://www.npmjs.com/package/preact-cli-plugin-netlify)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

---

**Netlify has disabled H2 Server Push. Please check [issue #11](https://github.com/vinaypuppal/preact-cli-plugin-netlify/issues/11) for more info.**

---

## Installation

```bash
yarn add preact-cli-plugin-netlify --dev
```

Alternatively using npm:

```bash
npm i preact-cli-plugin-netlify --save-dev
```

## Usage

And include in your project by creating a `preact.config.js`:

```js
const netlifyPlugin = require('preact-cli-plugin-netlify');

export default function (config) {
  netlifyPlugin(config);
}
```

### Options

#### Custom redirects

In addition to the generated redirects, you may want to supply your
own rewrite rules. In this case, you can pass array of custom redirects to the plugin, such as

```js
export default function(config) {
    netlifyPlugin(config, {
        redirects: [
          '/api/* https://api.example.com/:splat 200',
          '/custom/* https://custom.example.com/ 200'
        ]
    });
}
```

which generates the following `_redirects` file:

```yml
/api/* https://api.example.com/:splat 200
/custom/* https://custom.example.com/ 200
/* /index.html 200
```

### Brotli compression

Preact-CLI have a flag `--brotli` which automatically generates brotli compressed assets for all the javascript files. To serve these files using netlify you can use `brotli` option as shown below.
> For more info please check this blog post https://medium.com/@prateekbh/using-brotli-with-preact-cli-3-ca03125b1e2b

```js
  export default function(config, env) {
    netlifyPlugin(config, {
        brotli: env.brotli
    });
}
```

Which generates below config in `_headers` file

```yml
/*.br
  content-encoding: br
```

## Generated files

This plugin genererates `_headers` and `_redirects` files inside build folder

### Example of genererated files

```txt
# _headers
/*
  Cache-Control: public, max-age=3600, no-cache
  Access-Control-Max-Age: 600
/sw.js
  Cache-Control: private, no-cache
/*.chunk.*.js
  Cache-Control: public, max-age=31536000
/
  Link: </style.4f36e.css>; rel=preload; as=style
  Link: </bundle.10e55.js>; rel=preload; as=script
  Link: </route-home.chunk.47478.js>; rel=preload; as=script
/profile
  Link: </style.4f36e.css>; rel=preload; as=style
  Link: </bundle.10e55.js>; rel=preload; as=script
  Link: </route-profile.chunk.e4eea.js>; rel=preload; as=script
```

```txt
# _redirects
/* /index.html 200
```

You can verify these rules at [netlify playground](https://play.netlify.com/)

## Deploying to netlify

- Install netlify cli
  ```bash
  npm install netlify-cli -g
  ```
- Deploy build folder
  ```bash
  netlify deploy -p build
  ```

## License

MIT © [VinayPuppal](https://www.vinaypuppal.com)
