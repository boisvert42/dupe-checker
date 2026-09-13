'use strict';

const esbuild = require('esbuild');
const path = require('path');
const { parseCompounds } = require('./parse-compounds.js');

async function build() {
  // Step 1: Ensure compounds.json is up-to-date before bundling
  console.log('1. Parsing compounds (ensuring compounds.json is up-to-date)...');
  parseCompounds();

  console.log('2. Building browser bundles...');

  // Minified bundle for production
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'browser.js')],
    bundle: true,
    minify: true,
    sourcemap: true,
    format: 'iife',
    globalName: 'DupeCheckerModule',
    outfile: path.join(__dirname, 'dist', 'dupe-checker.min.js'),
  });

  console.log('Build complete:');
  console.log('  - dist/dupe-checker.min.js');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
