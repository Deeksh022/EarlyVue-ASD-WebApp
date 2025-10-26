const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallback for node modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": false,
        "fs": false,
        "path": false,
        "url": false,
        "vm": false,
        "child_process": false,
        "fs/promises": false
      };

      // Ignore node modules in bundle
      webpackConfig.externals = [
        ...(webpackConfig.externals || []),
        {
          'node:crypto': 'crypto',
          'node:fs': 'fs',
          'node:path': 'path',
          'node:url': 'url',
          'node:vm': 'vm',
          'node:child_process': 'child_process',
          'node:fs/promises': 'fs/promises'
        }
      ];

      return webpackConfig;
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: 'node_modules/pyodide',
            to: 'pyodide',
            filter: (resourcePath) => {
              // Only copy essential Pyodide files
              return resourcePath.includes('pyodide.js') ||
                     resourcePath.includes('pyodide.asm.js') ||
                     resourcePath.includes('pyodide.asm.wasm') ||
                     resourcePath.includes('packages.json') ||
                     resourcePath.includes('repodata.json');
            }
          }
        ]
      })
    ]
  }
};