#!/usr/bin/env node
/**
 * Post-build script to:
 * 1. Copy shared package into backend dist folder
 * 2. Fix @shared imports in compiled JS files to point to local shared copy
 */

import { readdir, readFile, writeFile, cp, mkdir } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '../dist');
const sharedSrc = join(__dirname, '../../shared/dist');
const sharedDest = join(distDir, 'shared');

async function* walkDir(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const path = join(dir, file.name);
    if (file.isDirectory()) {
      yield* walkDir(path);
    } else if (file.isFile() && file.name.endsWith('.js')) {
      yield path;
    }
  }
}

async function copySharedPackage() {
  console.log('Copying shared package to dist/shared...');
  await mkdir(sharedDest, { recursive: true });
  await cp(sharedSrc, sharedDest, { recursive: true });
  console.log('Shared package copied successfully');
}

async function fixImports() {
  let count = 0;

  for await (const filePath of walkDir(distDir)) {
    // Skip files in the shared folder itself
    if (filePath.includes('/dist/shared/')) {
      continue;
    }

    const content = await readFile(filePath, 'utf-8');
    const relativeToShared = relative(dirname(filePath), sharedDest);

    let newContent = content;

    // Fix paths that were already replaced by tsc-alias to point to ../../shared/dist/
    newContent = newContent.replace(
      /['"](\.\.\/)+shared\/dist\/(.*?)\.js['"]/g,
      (match, dots, modulePath) => {
        const relativePath = join(relativeToShared, modulePath + '.js')
          .replace(/\\/g, '/'); // normalize path separators
        return `"${relativePath}"`;
      }
    );

    // Fix any remaining @shared/* imports (in .d.ts files or if tsc-alias didn't catch them)
    newContent = newContent.replace(
      /@shared\/(.*?)(['"])/g,
      (match, modulePath, quote) => {
        const relativePath = join(relativeToShared, modulePath + '.js')
          .replace(/\\/g, '/'); // normalize path separators
        return `${relativePath}${quote}`;
      }
    );

    if (content !== newContent) {
      await writeFile(filePath, newContent, 'utf-8');
      count++;
    }
  }

  console.log(`Fixed @shared imports in ${count} files`);
}

async function main() {
  await copySharedPackage();
  await fixImports();
}

main().catch(console.error);
