/* Copies /data to /public/data so Next.js export includes generated JSON */
const fs = require('fs-extra');
const path = require('path');

const src = path.join(__dirname, '..', 'data');
const dest = path.join(__dirname, '..', 'public', 'data');

async function main() {
  try {
    if (await fs.pathExists(src)) {
  await fs.ensureDir(dest);
  await fs.emptyDir(dest);
  await fs.copy(src, dest);
      console.log('Copied data to public/data');
    } else {
      console.log('No data directory found; skipping copy');
    }
  } catch (e) {
    console.error('Failed to copy data directory:', e);
    process.exit(1);
  }
}

main();
