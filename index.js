/**
 * Generates Netlify HTTP2 Server Push headers and redirect rules for preact-cli
 * A lot of this code is borrowed from https://github.com/developit/preact-cli/blob/master/src/lib/webpack/push-manifest.js
 */

class NetlifyServerPushPlugin {
  constructor({ redirects, brotli = false }) {
    this.redirects = [];
    this.brotli = brotli;
    if (redirects !== undefined) {
      if (Array.isArray(redirects)) {
        this.redirects = redirects;
      } else {
        throw new TypeError(
          `redirects should be an array, but was of type '${typeof redirects}'`,
        );
      }
    }
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      const routes = [];
      // Set default value as comment incase if this file is not present
      let mainJs = '# no js files';
      let mainCss = '# no css files';

      for (const filename in compilation.assets) {
        if (!/\.map$/.test(filename)) {
          if (/route-/.test(filename)) {
            routes.push(filename);
          } else if (/^style(.+)\.css$/.test(filename)) {
            mainCss = `Link: </${filename}>; rel=preload; as=style`;
          } else if (/^bundle(.+)\.js$/.test(filename)) {
            mainJs = `Link: </${filename}>; rel=preload; as=script`;
          }
        }
      }

      let headers =
        '/*\n\tCache-Control: public, max-age=3600, no-cache\n\tAccess-Control-Max-Age: 600\n/sw.js\n\tCache-Control: private, no-cache\n/*.chunk.*.js\n\tCache-Control: public, max-age=31536000';

      if (this.brotli) {
        headers += '\n/*.br\n\tcontent-encoding: br';
      }

      const redirects = `${this.redirects.join('\n')}\n/* /index.html 200`;

      routes.forEach(filename => {
        const path = filename
          .replace(/route-/, '/')
          .replace(/\.chunk(\.\w+)?\.js$/, '')
          .replace(/\/home/, '/');
        const routeJs = `Link: </${filename}>; rel=preload; as=script`;
        headers = `${headers}\n${path}\n\t${mainCss}\n\t${mainJs}\n\t${
          routeJs
        }`;
      });

      compilation.assets._headers = {
        source() {
          return headers;
        },
        size() {
          return headers.length;
        },
      };

      compilation.assets._redirects = {
        source() {
          return redirects;
        },
        size() {
          return redirects.length;
        },
      };

      callback();
    });
  }
}

module.exports = function(config, options = {}) {
  if (!config || !config.plugins) {
    throw new Error(
      'You need to pass the webpack config to preact-cli-plugin-netlify!',
    );
  }

  const swBuilder = getPluginsByName(config, 'SWBuilderPlugin');
  if (
    swBuilder &&
    swBuilder.length > 0 &&
    swBuilder[0].plugin &&
    swBuilder[0].plugin.brotli_
  ) {
    options.brotli = true;
  }

  config.plugins.push(new NetlifyServerPushPlugin(options));
  const plugins = config.plugins;
  for (let pluginIndex = 0; pluginIndex < plugins.length; pluginIndex++) {
    const plugin = plugins[pluginIndex];
    if (plugin && plugin.options && plugin.options.cacheId) {
      // Ignore genearted _headers and _redirects files from SW precaching
      Object.assign(plugin.options, {
        staticFileGlobsIgnorePatterns: [
          ...plugin.options.staticFileGlobsIgnorePatterns,
          /_headers/,
          /_redirects/,
        ],
      });
    }
  }
};

function getPluginsByName(config, name) {
  return getPlugins(config).filter(
    w => w.plugin && w.plugin.constructor && w.plugin.constructor.name === name,
  );
}

function getPlugins(config) {
  return (config.plugins || []).map((plugin, index) => ({ index, plugin }));
}
