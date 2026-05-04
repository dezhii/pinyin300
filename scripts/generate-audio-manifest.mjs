import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const charactersPath = path.join(rootDir, 'src', 'data', 'characters.ts');
const outputDir = path.join(rootDir, 'public', 'audio', 'hanzi');
const csvPath = path.join(outputDir, 'manifest.csv');
const jsonPath = path.join(outputDir, 'manifest.json');

const toneMarks = {
  ā: ['a', 1],
  á: ['a', 2],
  ǎ: ['a', 3],
  à: ['a', 4],
  ē: ['e', 1],
  é: ['e', 2],
  ě: ['e', 3],
  è: ['e', 4],
  ī: ['i', 1],
  í: ['i', 2],
  ǐ: ['i', 3],
  ì: ['i', 4],
  ō: ['o', 1],
  ó: ['o', 2],
  ǒ: ['o', 3],
  ò: ['o', 4],
  ū: ['u', 1],
  ú: ['u', 2],
  ǔ: ['u', 3],
  ù: ['u', 4],
  ǖ: ['v', 1],
  ǘ: ['v', 2],
  ǚ: ['v', 3],
  ǜ: ['v', 4],
  ü: ['v', 5],
};

function toToneNumberPinyin(pinyin) {
  let tone = 5;
  const plain = Array.from(pinyin.toLowerCase())
    .map((char) => {
      const toneMark = toneMarks[char];
      if (!toneMark) {
        return char;
      }

      tone = toneMark[1];
      return toneMark[0];
    })
    .join('')
    .replace(/u:/g, 'v')
    .replace(/[^a-zv]/g, '');

  return `${plain}${tone}`;
}

function escapeCsv(value) {
  const stringValue = String(value ?? '');
  if (!/[",\n]/.test(stringValue)) {
    return stringValue;
  }

  return `"${stringValue.replace(/"/g, '""')}"`;
}

function parseRawBlocks(fileContent) {
  const blocks = [];
  const blockRegex = /const\s+(RAW_[A-Z0-9_]+)\s*=\s*`([\s\S]*?)`;/g;
  let match = blockRegex.exec(fileContent);

  while (match) {
    const source = match[1] === 'RAW_GRADE_1_UP' ? '一年级上册常见字' : '一年级下册常见字节选';
    blocks.push({ source, raw: match[2] });
    match = blockRegex.exec(fileContent);
  }

  return blocks;
}

function parseEntries(fileContent) {
  const blocks = parseRawBlocks(fileContent);
  let id = 1;
  return blocks.flatMap(({ raw, source }) =>
    raw
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => {
        const separatorIndex = token.indexOf(':');
        const char = token.slice(0, separatorIndex);
        const pinyins = token.slice(separatorIndex + 1).split('|').filter(Boolean);
        const primaryPinyin = pinyins[0];
        const toneNumber = toToneNumberPinyin(primaryPinyin);
        const fileName = `${String(id).padStart(3, '0')}_${toneNumber}.mp3`;
        const entry = {
          id,
          char,
          pinyin: primaryPinyin,
          allPinyins: pinyins,
          toneNumber,
          fileName,
          audio: `/audio/hanzi/${fileName}`,
          isPolyphonic: pinyins.length > 1,
          source,
          recommendedText: char,
          note: pinyins.length > 1 ? '多音字，请按 pinyin 字段录制当前指定读音。' : '',
        };
        id += 1;
        return entry;
      }),
  );
}

const fileContent = fs.readFileSync(charactersPath, 'utf8');
const entries = parseEntries(fileContent);

if (entries.length !== 300) {
  throw new Error(`Expected 300 audio entries, got ${entries.length}.`);
}

fs.mkdirSync(outputDir, { recursive: true });

const headers = ['id', 'char', 'pinyin', 'allPinyins', 'toneNumber', 'fileName', 'audio', 'isPolyphonic', 'source', 'recommendedText', 'note'];
const csvLines = [headers.join(',')];
for (const entry of entries) {
  csvLines.push(
    headers
      .map((header) => {
        const value = Array.isArray(entry[header]) ? entry[header].join('/') : entry[header];
        return escapeCsv(value);
      })
      .join(','),
  );
}

fs.writeFileSync(csvPath, `${csvLines.join('\n')}\n`, 'utf8');
fs.writeFileSync(jsonPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');

const polyphonicCount = entries.filter((entry) => entry.isPolyphonic).length;
console.log(`Generated ${entries.length} audio manifest entries.`);
console.log(`Polyphonic entries: ${polyphonicCount}.`);
console.log(path.relative(rootDir, csvPath));
console.log(path.relative(rootDir, jsonPath));
