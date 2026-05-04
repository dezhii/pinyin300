import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const manifestPath = path.join(
  rootDir,
  "public",
  "audio",
  "hanzi",
  "manifest.json",
);
const outputDir = path.join(rootDir, "public", "print");
const htmlPath = path.join(outputDir, "pinyin300-a4.html");
const csvPath = path.join(outputDir, "pinyin300.csv");
const entriesPerPage = 50;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeCsv(value) {
  const stringValue = String(value ?? "");
  if (!/[",\n]/.test(stringValue)) {
    return stringValue;
  }

  return `"${stringValue.replace(/"/g, '""')}"`;
}

function chunkEntries(entries, size) {
  const chunks = [];
  for (let index = 0; index < entries.length; index += size) {
    chunks.push(entries.slice(index, index + size));
  }
  return chunks;
}

function levelText(id) {
  return `第 ${Math.ceil(id / 3)} 关`;
}

function renderCard(entry) {
  const otherPinyins = entry.allPinyins.filter(
    (pinyin) => pinyin !== entry.pinyin,
  );
  const otherText =
    otherPinyins.length > 0
      ? `<div class="other-pinyin">另：${escapeHtml(otherPinyins.join(" / "))}</div>`
      : "";

  return `
    <article
      class="card${entry.isPolyphonic ? " polyphonic" : ""}"
      data-char="${escapeHtml(entry.char)}"
      data-audio="${escapeHtml(entry.audio)}"
      role="button"
      tabindex="0"
      aria-label="${escapeHtml(entry.char)}，${escapeHtml(entry.pinyin)}，点击播放三遍"
    >
      <div class="meta"><span>${String(entry.id).padStart(3, "0")}</span><span>${escapeHtml(levelText(entry.id))}</span></div>
      <div class="pinyin">${escapeHtml(entry.pinyin)}</div>
      <div class="hanzi">${escapeHtml(entry.char)}</div>
      ${otherText}
      <div class="sound-hint">点读 ×3</div>
    </article>`;
}

function renderSheet(entries, pageIndex, totalPages) {
  const start = entries[0]?.id ?? 0;
  const end = entries[entries.length - 1]?.id ?? 0;
  return `
  <section class="sheet">
    <header class="sheet-header">
      <div>
        <p>小学常见 300 字拼音表</p>
        <h1>第 ${pageIndex + 1} 页</h1>
      </div>
      <div class="sheet-range">${String(start).padStart(3, "0")} - ${String(end).padStart(3, "0")}</div>
    </header>
    <main class="grid">
      ${entries.map(renderCard).join("\n")}
    </main>
    <footer class="sheet-footer">
      <span>拼音小火车 · 300 字 / 100 关</span>
      <span>${pageIndex + 1} / ${totalPages}</span>
    </footer>
  </section>`;
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const pages = chunkEntries(manifest, entriesPerPage);

fs.mkdirSync(outputDir, { recursive: true });

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>小学常见 300 字拼音表 A4 打印版</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #1f2933;
      background: #eef2f7;
      font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", system-ui, sans-serif;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
      backdrop-filter: blur(12px);
    }

    .toolbar h1 {
      margin: 0;
      font-size: 20px;
    }

    .toolbar p {
      margin: 4px 0 0;
      color: #64748b;
      font-size: 13px;
    }

    .toolbar button {
      border: 0;
      border-radius: 999px;
      padding: 12px 20px;
      color: white;
      background: linear-gradient(135deg, #ff7a1a, #ffb300);
      font-weight: 800;
      cursor: pointer;
    }

    .sheet {
      display: flex;
      flex-direction: column;
      width: 190mm;
      height: 277mm;
      margin: 12mm auto;
      padding: 0;
      background: #ffffff;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.16);
      page-break-after: always;
      break-after: page;
    }

    .sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .sheet-header,
    .sheet-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .sheet-header {
      height: 18mm;
      padding: 0 1mm 3mm;
      border-bottom: 1px solid #e2e8f0;
    }

    .sheet-header p {
      margin: 0 0 2mm;
      color: #ff7a1a;
      font-size: 10pt;
      font-weight: 900;
      letter-spacing: 0.08em;
    }

    .sheet-header h1 {
      margin: 0;
      font-size: 17pt;
    }

    .sheet-range {
      border-radius: 999px;
      padding: 2mm 4mm;
      color: #7c2d12;
      background: #ffedd5;
      font-size: 10pt;
      font-weight: 900;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(10, 1fr);
      gap: 2mm;
      flex: 1;
      padding: 3mm 0;
    }

    .card {
      position: relative;
      display: grid;
      grid-template-rows: auto auto 1fr auto auto;
      align-items: center;
      min-width: 0;
      overflow: hidden;
      border: 1px solid #dbe4ef;
      border-radius: 2.6mm;
      background: linear-gradient(180deg, #ffffff, #fffaf0);
      text-align: center;
      break-inside: avoid;
      cursor: pointer;
      transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
    }

    .card:hover,
    .card:focus-visible,
    .card.playing {
      border-color: #fb923c;
      box-shadow: 0 8px 18px rgba(194, 65, 12, 0.14);
      transform: translateY(-1px);
      outline: none;
    }

    .card.playing::after {
      content: "🔊";
      position: absolute;
      right: 2mm;
      bottom: 2mm;
      font-size: 9pt;
    }

    .card.polyphonic {
      background: linear-gradient(180deg, #ffffff, #eef6ff);
    }

    .meta {
      display: flex;
      justify-content: space-between;
      padding: 1.3mm 1.8mm 0;
      color: #94a3b8;
      font-size: 6.8pt;
      font-weight: 800;
    }

    .pinyin {
      align-self: end;
      margin-top: 1mm;
      color: #c2410c;
      font-size: 13.8pt;
      font-weight: 900;
      line-height: 1.05;
    }

    .hanzi {
      align-self: center;
      font-family: "KaiTi", "STKaiti", "SimKai", serif;
      font-size: 23pt;
      font-weight: 900;
      line-height: 1;
    }

    .other-pinyin {
      min-height: 3.8mm;
      padding-bottom: 0.2mm;
      color: #475569;
      font-size: 5.8pt;
      line-height: 1.1;
      white-space: nowrap;
    }

    .sound-hint {
      min-height: 3.2mm;
      padding-bottom: 0.8mm;
      color: #94a3b8;
      font-size: 5.6pt;
      font-weight: 800;
    }

    .sheet-footer {
      height: 7mm;
      padding: 2mm 1mm 0;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 8.5pt;
      font-weight: 800;
    }

    @media print {
      body {
        background: white;
      }

      .toolbar {
        display: none;
      }

      .sheet {
        width: auto;
        height: auto;
        min-height: 277mm;
        margin: 0;
        box-shadow: none;
      }

      .card {
        cursor: default;
      }

      .sound-hint {
        display: none;
      }
    }
  </style>
</head>
<body>
  <aside class="toolbar">
    <div>
      <h1>小学常见 300 字拼音表 · A4 打印版</h1>
      <p>共 ${manifest.length} 字，${pages.length} 页。拼音在汉字上方；点击任一字卡，会朗读 3 次。打印时建议选择 A4、纵向、100% 比例。</p>
    </div>
    <button type="button" onclick="window.print()">打印 A4</button>
  </aside>
  ${pages.map((page, index) => renderSheet(page, index, pages.length)).join("\n")}
  <script>
    let playToken = 0;
    let activeAudio = null;
    const missingAudio = new Set();

    function stopCurrentAudio() {
      playToken += 1;
      if (!activeAudio) {
        return;
      }
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = '';
      activeAudio = null;
    }

    function wait(ms) {
      return new Promise(function(resolve) {
        window.setTimeout(resolve, ms);
      });
    }

    function playAudioOnce(src) {
      return new Promise(function(resolve, reject) {
        if (activeAudio) {
          activeAudio.pause();
          activeAudio.currentTime = 0;
          activeAudio.src = '';
          activeAudio = null;
        }

        const audio = new Audio(src);
        activeAudio = audio;
        audio.preload = 'auto';
        audio.onended = function() {
          if (activeAudio === audio) {
            activeAudio = null;
          }
          resolve();
        };
        audio.onerror = function() {
          if (activeAudio === audio) {
            activeAudio = null;
          }
          reject(new Error('audio failed'));
        };
        audio.play().catch(reject);
      });
    }

    function speakWithBrowser(char, repeat, token) {
      return new Promise(function(resolve) {
        if (!('speechSynthesis' in window)) {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();
        let count = 0;
        function speakOnce() {
          if (playToken !== token || count >= repeat) {
            resolve();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(char);
          utterance.lang = 'zh-CN';
          utterance.rate = 0.75;
          utterance.pitch = 1.05;
          utterance.onend = function() {
            count += 1;
            window.setTimeout(speakOnce, 260);
          };
          utterance.onerror = function() {
            count += 1;
            window.setTimeout(speakOnce, 260);
          };
          window.speechSynthesis.speak(utterance);
        }
        speakOnce();
      });
    }

    async function playCard(card) {
      const token = playToken + 1;
      playToken = token;
      const char = card.dataset.char;
      const audio = card.dataset.audio;

      document.querySelectorAll('.card.playing').forEach(function(item) {
        item.classList.remove('playing');
      });
      card.classList.add('playing');

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      if (audio && !missingAudio.has(audio)) {
        try {
          for (let index = 0; index < 3; index += 1) {
            if (playToken !== token) {
              return;
            }
            await playAudioOnce(audio);
            if (index < 2) {
              await wait(260);
            }
          }
          card.classList.remove('playing');
          return;
        } catch (error) {
          missingAudio.add(audio);
        }
      }

      if (playToken === token) {
        await speakWithBrowser(char, 3, token);
      }
      card.classList.remove('playing');
    }

    document.addEventListener('click', function(event) {
      const card = event.target.closest('.card');
      if (card) {
        playCard(card);
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      const card = event.target.closest('.card');
      if (card) {
        event.preventDefault();
        playCard(card);
      }
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(htmlPath, html, "utf8");

const csvHeaders = ["id", "level", "char", "pinyin", "allPinyins"];
const csvLines = [csvHeaders.join(",")];
for (const entry of manifest) {
  csvLines.push(
    [
      entry.id,
      Math.ceil(entry.id / 3),
      entry.char,
      entry.pinyin,
      entry.allPinyins.join("/"),
    ]
      .map(escapeCsv)
      .join(","),
  );
}
fs.writeFileSync(csvPath, `${csvLines.join("\n")}\n`, "utf8");

console.log(
  `Generated A4 printable sheet: ${path.relative(rootDir, htmlPath)}`,
);
console.log(`Generated CSV: ${path.relative(rootDir, csvPath)}`);
