/* Ensures GitHub Pages friendly paths after next export if needed */
const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'out');
const nojekyll = path.join(outDir, '.nojekyll');
if (!fs.existsSync(nojekyll)) {
  fs.writeFileSync(nojekyll, '');
  console.log('Created out/.nojekyll');
}