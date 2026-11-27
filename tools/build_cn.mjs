// Builds cn/index.html: the Chinese edition as ONE self-contained page (engine, levels and UI inlined, no web fonts,
// no outside requests), so it opens behind the Great Firewall and can be uploaded to any host, including one in mainland China.
// Source: tools/cn.src.html (all Chinese text is in its T table). Usage: node tools/build_cn.mjs  (run node tools/build.mjs first)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..');
// light, safe slimming: drop block comments that start a line and whole-line // comments, then trailing spaces
const slim = (js) => js.replace(/^\s*\/\*[\s\S]*?\*\/\s*$/gm, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).map((l) => l.trimEnd()).filter(Boolean).join('\n');
const core = slim(fs.readFileSync(path.join(root, 'loopdoku-core.js'), 'utf8'));
const levels = fs.readFileSync(path.join(root, 'loopdoku-levels.js'), 'utf8').replace(/^\/\*.*\*\/\n/, '');
const src = fs.readFileSync(path.join(here, 'cn.src.html'), 'utf8');
const out = src.replace('<!--CORE-->', () => '<script>\n' + core + '\n</script>').replace('<!--LEVELS-->', () => '<script>' + levels.trim() + '</script>');
if (/(src|href)\s*=\s*["']https?:/i.test(out) || /@import|url\(\s*["']?https?:/i.test(out)) throw new Error('cn page must not load anything from outside');
fs.mkdirSync(path.join(root, 'cn'), { recursive: true });
fs.writeFileSync(path.join(root, 'cn', 'index.html'), out);
const gz = zlib.gzipSync(out, { level: 9 }).length;
console.log('built cn/index.html', (Buffer.byteLength(out) / 1024).toFixed(1) + ' KB,', (gz / 1024).toFixed(1) + ' KB gzipped');
