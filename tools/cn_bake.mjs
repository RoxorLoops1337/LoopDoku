// Bakes the approved RoxorLoops & Jasmin chibis (rj-cast.js, RJ.draw) into small images for the Chinese edition, so it carries
// the duo without shipping the 493 KB kit. Writes tools/cn_art.json ({name: data URI}); build_cn.mjs inlines it.
// Usage: node tools/cn_bake.mjs   (needs Chromium; re-run only when the art kit changes)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..');
let chromium;
try { ({ chromium } = await import('playwright-core')); } catch (e) { ({ chromium } = createRequire(import.meta.url)('playwright')); }
import { execFileSync } from 'node:child_process';
const fmt = process.argv[2] || 'png';
const exe = ['/opt/pw-browsers/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage();
await page.setContent('<!doctype html><body></body>');
await page.addScriptTag({ content: fs.readFileSync(path.join(root, 'rj-cast.js'), 'utf8') });
const art = await page.evaluate((fmt) => {
  const out = {};
  const mime = fmt === 'webp' ? 'image/webp' : 'image/png';
  // trims transparent edges so every image is as small as it can be
  function trim(c) {
    const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const t = document.createElement('canvas'); t.width = x1 - x0 + 3; t.height = y1 - y0 + 3;
    t.getContext('2d').drawImage(c, x0 - 1, y0 - 1, t.width, t.height, 0, 0, t.width, t.height);
    return t;
  }
  function scene(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return trim(c); }
  const enc = (c) => c.toDataURL(mime, 0.86);
  // the duo, side by side (title and win screens)
  out.duo = enc(scene(600, 420, (g, W, H) => { RJ.draw(g, 'roxor', { x: W * 0.27, y: H - 8, s: 1.45, pose: 'sing', t: 0.4 }); RJ.draw(g, 'jasmin', { x: W * 0.73, y: H - 8, s: 1.45, pose: 'cheer', t: 0.9, flip: true }); }));
  out.sad = enc(scene(420, 300, (g, W, H) => { RJ.draw(g, 'roxor', { x: W * 0.3, y: H - 8, s: 1, pose: 'hurt', t: 0.3 }); RJ.draw(g, 'jasmin', { x: W * 0.7, y: H - 8, s: 1, pose: 'hurt', t: 0.8, flip: true }); }));
  // busts for the pieces on the board and the coach
  for (const id of ['roxor', 'jasmin']) out[id] = enc(scene(128, 128, (g, W, H) => RJ.bust(g, id, W, H, { t: 0.3 })));
  return out;
}, fmt);
await browser.close();
// PNG works on every phone (old iPhones have no WebP); 96 colours keeps it small. Needs python3 + Pillow, else stays full colour.
if (fmt === 'png') {
  const py = `import json,sys,base64,io
from PIL import Image
a=json.load(sys.stdin)
for k,v in a.items():
  i=Image.open(io.BytesIO(base64.b64decode(v.split(',')[1]))).convert('RGBA')
  q=i.quantize(colors=96,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE)
  b=io.BytesIO(); q.save(b,'PNG',optimize=True); a[k]='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
print(json.dumps(a))`;
  try { Object.assign(art, JSON.parse(execFileSync('python3', ['-c', py], { input: JSON.stringify(art), maxBuffer: 1 << 26 }).toString())); }
  catch (e) { console.log('python3/Pillow not available: keeping full-colour PNGs'); }
}
fs.writeFileSync(path.join(here, 'cn_art.json'), JSON.stringify(art));
for (const k in art) console.log(k, (art[k].length / 1024).toFixed(1) + ' KB');
console.log('total', (Object.values(art).reduce((a, s) => a + s.length, 0) / 1024).toFixed(1) + ' KB (' + fmt + ')');
