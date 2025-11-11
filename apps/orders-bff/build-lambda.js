const esbuild = require('esbuild');
const path = require('path');

async function buildLambda() {
  try {
    const result = await esbuild.build({
      entryPoints: ['src/main.ts'],
      bundle: true,
      outfile: '../../dist/apps/orders-bff/main.js',
      platform: 'node',
      target: 'node22',
      format: 'cjs',

      // CRITICAL: Force bundling of ALL dependencies
      external: [], // Empty = bundle everything

      // Optimization
      minify: true,
      treeShaking: true,
      sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,

      // Node.js specific
      mainFields: ['main', 'module'],
      conditions: ['node'],

      // TypeScript support
      loader: {
        '.ts': 'ts',
      },

      // Resolve configuration
      resolveExtensions: ['.ts', '.js', '.json'],

      // Make sure everything is bundled
      splitting: false,

      // Keep __dirname and __filename working in Node.js
      // (esbuild handles these automatically for Node.js platform)

      // Log what's happening
      logLevel: 'info',

      // Generate metafile for analysis
      metafile: true,
    });

    console.log('Lambda bundle created successfully!');
    console.log('Output:', path.resolve('../../dist/apps/orders-bff/main.js'));

    // Check file size
    const fs = require('fs');
    const stats = fs.statSync('../../dist/apps/orders-bff/main.js');
    console.log(`Bundle size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    // Save build analysis
    if (result.metafile) {
      fs.writeFileSync(
        '../../dist/apps/orders-bff/meta.json',
        JSON.stringify(result.metafile, null, 2)
      );
      console.log(
        'Build analysis saved to ../../dist/apps/orders-bff/meta.json'
      );

      // Check for any external dependencies
      const inputs = Object.keys(result.metafile.inputs);
      const nodeModulesInputs = inputs.filter((input) =>
        input.includes('node_modules')
      );
      console.log(`Bundled ${nodeModulesInputs.length} dependencies`);
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildLambda();
