import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(frontendRoot, '..');
const files = ['stockfish-19-lite-single.js', 'stockfish-19-lite-single.wasm'];
const candidates = [
  path.join(repoRoot, 'node_modules', 'stockfish', 'bin'),
  path.join(frontendRoot, 'node_modules', 'stockfish', 'bin'),
];
const srcDir = candidates.find((dir) => fs.existsSync(path.join(dir, files[0])));
if (!srcDir) {
  throw new Error('stockfish lite-single files not found under node_modules/stockfish/bin');
}
const destDir = path.join(frontendRoot, 'public', 'stockfish');
fs.mkdirSync(destDir, { recursive: true });
for (const file of files) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}
