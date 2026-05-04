import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const manifestPath = path.join(rootDir, 'public', 'audio', 'hanzi', 'manifest.json');
const audioDir = path.join(rootDir, 'public', 'audio', 'hanzi');

if (!fs.existsSync(manifestPath)) {
  console.error('Audio manifest not found. Run npm run audio:manifest first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const missing = [];

for (const entry of manifest) {
  const audioPath = path.join(audioDir, entry.fileName);
  if (!fs.existsSync(audioPath)) {
    missing.push(entry);
  }
}

if (missing.length > 0) {
  console.log(`Missing ${missing.length} audio files:`);
  for (const entry of missing.slice(0, 40)) {
    console.log(`${entry.id}. ${entry.char} ${entry.pinyin} -> ${entry.fileName}`);
  }
  if (missing.length > 40) {
    console.log(`...and ${missing.length - 40} more.`);
  }
  process.exit(1);
}

console.log(`All ${manifest.length} audio files exist.`);
