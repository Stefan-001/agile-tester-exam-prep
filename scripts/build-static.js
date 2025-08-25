#!/usr/bin/env node
// Cross-platform static build orchestrator: parse PDFs, copy docs/data, build, post-export tweaks
const { spawnSync } = require('node:child_process');
const { resolve, dirname, join } = require('node:path');

const __dirnameLocal = dirname(__filename);

function runNode(scriptRelPath) {
  const script = resolve(__dirnameLocal, scriptRelPath);
  const res = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

function runNextBuild() {
  // Call Next's JS bin directly via Node for maximum cross-platform compatibility
  const nextJsBin = resolve(__dirnameLocal, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
  const res = spawnSync(process.execPath, [nextJsBin, 'build'], { stdio: 'inherit' });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

// 1) Parse PDFs to /data
runNode('./parse-pdfs.mjs');

// 2) Copy /Documents and /data to public
runNode('./copy-docs.js');
runNode('./copy-data.js');

// 3) Next.js static build (export)
runNextBuild();

// 4) Post export tweaks (.nojekyll etc)
runNode('./post-export.js');
