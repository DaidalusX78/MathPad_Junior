import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const wwwDir = path.join(rootDir, 'www');

if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

const filesToCopy = [
  'index.html',
  'pencil_case.html',
  'manifest.json',
  'sw.js'
];

const dirsToCopy = [
  'css',
  'js',
  'media'
];

for (const file of filesToCopy) {
  const src = path.join(rootDir, file);
  const dest = path.join(wwwDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} -> www/${file}`);
  }
}

for (const dir of dirsToCopy) {
  const src = path.join(rootDir, dir);
  const dest = path.join(wwwDir, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`Copied ${dir}/ -> www/${dir}/`);
  }
}

console.log('Staging to www complete.');
