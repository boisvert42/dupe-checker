'use strict';

/**
 * @file parse-compounds.js
 *
 * Compiles compound word mappings into compounds.json from two sources:
 *   1. compound_words.csv: The base dataset of hyphen-split compound words
 *      (e.g., "after-effect", "air-port").
 *   2. The `extras` map below: Custom, high-value, or puzzle-specific compound
 *      words defined directly in code.
 *
 * =============================================================================
 * ADDING CUSTOM COMPOUND WORDS:
 * =============================================================================
 * If you want to add new compound words (or override existing splits), the best
 * place to do so is in the `extras` object in this file (around line 75).
 *
 * Format:
 *   <unspaced_lowercase_word>: ['component1', 'component2', ...]
 *
 * Example:
 *   const extras = {
 *     hotdog: ['hot', 'dog'],
 *     backseat: ['back', 'seat'],
 *     ...
 *   };
 *
 * =============================================================================
 * IMPORTANT - REBUILDING COMPOUNDS.JSON:
 * =============================================================================
 * After editing this file (or compound_words.csv), you MUST run this script
 * to recompile `compounds.json` before running CLI commands or Node scripts:
 *
 *   npm run parse:compounds
 *   # or: node parse-compounds.js
 *
 * If you do not re-run this script, `cli.js` and `index.js` will continue
 * reading the previous `compounds.json`.
 *
 * Note: When building for the browser (`npm run build:browser`), this script
 * runs automatically before esbuild bundling to ensure dist/dupe-checker.min.js
 * always contains the latest compound definitions.
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'compound_words.csv');
const outJsonPath = path.join(__dirname, 'compounds.json');

/**
 * Parses compound_words.csv and merges with the extras dictionary,
 * saving the result to compounds.json.
 *
 * @param {Object} [options]
 * @param {boolean} [options.silent=false] - Suppress console output if true
 * @returns {Record<string, string[]>} The compiled compounds dictionary
 */
function parseCompounds(options = {}) {
  const silent = Boolean(options.silent);

  if (!fs.existsSync(csvPath)) {
    console.error('compound_words.csv not found at', csvPath);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const compounds = {};

  // Parse lines from compound_words.csv
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');
    if (parts.length < 2) continue;

    let word = parts[0].trim().toLowerCase();
    let splitCol = parts.slice(1).join(',').trim().toLowerCase();

    let splitParts = splitCol.split('-').map(p => p.trim()).filter(Boolean);
    let rejoined = splitParts.join('');

    // 1. If split column rejoined matches col 1
    if (rejoined === word) {
      compounds[word] = splitParts;
    } else {
      // 2. Add the split column compound if valid
      if (splitParts.length >= 2 && rejoined.length >= 4) {
        compounds[rejoined] = splitParts;
      }
      // 3. Special fix for known typo 'affereffect' -> 'aftereffect'
      if (word === 'affereffect' && rejoined === 'aftereffect') {
        compounds['aftereffect'] = splitParts;
      }
    }
  }

  // ===========================================================================
  // Extra high-value puzzle compounds
  // Add any custom or puzzle-specific compound words here!
  // ===========================================================================
  const extras = {
    hotdog: ['hot', 'dog'],
    backseat: ['back', 'seat'],
    beeline: ['bee', 'line'],
    cheesecake: ['cheese', 'cake'],
    sandcastle: ['sand', 'castle'],
    treehouse: ['tree', 'house'],
    birdhouse: ['bird', 'house'],
    playhouse: ['play', 'house'],
    greenhouse: ['green', 'house']
  };

  for (const [k, v] of Object.entries(extras)) {
    compounds[k] = v;
  }

  fs.writeFileSync(outJsonPath, JSON.stringify(compounds, null, 2), 'utf8');
  if (!silent) {
    console.log(`Saved ${Object.keys(compounds).length} compound words to ${outJsonPath}`);
  }

  return compounds;
}

if (require.main === module) {
  parseCompounds();
}

module.exports = {
  parseCompounds
};
