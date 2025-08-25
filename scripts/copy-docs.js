/* Copies /Documents to /public/Documents so Next.js export includes syllabus files */
const fs = require('fs-extra');
const path = require('path');

const src = path.join(process.cwd(), 'Documents');
const dst = path.join(process.cwd(), 'public', 'Documents');

async function main() {
  try {
    if (await fs.pathExists(src)) {
      await fs.ensureDir(dst);
      await fs.emptyDir(dst);
      await fs.copy(src, dst);
      console.log('Copied Documents to public/Documents');
    } else {
      console.log('No Documents directory found; skipping copy');
    }
  } catch (e) {
    console.error('Failed to copy Documents:', e);
    process.exit(1);
  }
}

main();