#!/usr/bin/env node
/**
 * Post-build script to fix @shared imports in compiled JS files
 * Replaces @shared/* with relative paths to ../shared/dist/*
 */
// This is a hack =)). It should be build and published as a separate package

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '../dist');

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

async function fixImports() {
  let count = 0;

  for await (const filePath of walkDir(distDir)) {
    const content = await readFile(filePath, 'utf-8');
    const relativeToShared = relative(dirname(filePath), join(distDir, '../../shared/dist'));

    // Replace @shared/* with relative path to shared/dist/*
    const newContent = content.replace(
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

fixImports().catch(console.error);
