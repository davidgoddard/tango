import * as esbuild  from 'esbuild'
import { resolve, dirname } from 'path';

// Plugin to add `.js` extensions to relative imports
const addJsExtensionPlugin = {
  name: 'add-js-extension',
  setup(build) {
    build.onResolve({ filter: /^\.+\// }, args => {
        // Check if the path already ends with `.js`
      let resolvedPath = args.path;
      if (!resolvedPath.endsWith('.js')) {
        resolvedPath += '.js';
      }

      // Resolve the path to an absolute path
      const absolutePath = resolve(dirname(args.importer), resolvedPath);
      return { path: absolutePath, namespace: 'file' };
    });
  },
};

// Build configuration
esbuild.build({
  entryPoints: ['./dist/app.js'], // Adjust to your entry file
  bundle: true,
  outfile: 'dist/bundle.js', // Adjust to your output file
  plugins: [addJsExtensionPlugin],
  platform: 'browser', // or 'node', depending on your environment
}).catch(() => process.exit(1));