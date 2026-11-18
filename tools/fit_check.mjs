// Fit check for every skin: node tools/fit_check.mjs [skin ...]   (needs a static server on the repo root, default :5320)
// Opens every screen (title, game 5x5 / 10x10, win with a long streak, lose, World Tour, Looks, Settings, Support) on
// several phone sizes and reports any button or text that sticks out of the screen or gets clipped inside its button.
// Exit code 1 on any problem. Screenshots of failing screens: shots/fit-<skin>-<w>-<screen>.jpeg
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALL = ['neon', 'idol', 'comic', 'sticker', 'paper', 'studio', 'riso', 'jelly', 'watercolour', 'pixel'];
const skins = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const sizes = [[320, 640], [360, 760], [390, 844], [412, 915]];
const base = process.env.LD_BASE || 'http://localhost:' + (process.env.PORT || 5320);
fs.mkdirSync(path.join(root, 'shots'), { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe });

// runs in the page: list what does not fit
const scan = () => {
  const vw = innerWidth, out = [];
  const visible = (el) => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05; };
  const hidden = (el) => { for (let p = el; p; p = p.parentElement) if (!visible(p) || p.getAttribute('aria-hidden') === 'true') return true; return false; };
  const scrolls = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const ox = getComputedStyle(p).overflowX; if (ox === 'auto' || ox === 'scroll') return true; } return false; };
  const label = (el) => (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  const textRect = (node) => { const rg = document.createRange(); rg.selectNodeContents(node); return rg.getBoundingClientRect(); };
  const seen = new Set();
  // 1. buttons that stick out of the screen
  for (const el of document.querySelectorAll('button, a[href], [role="button"], [data-act]')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || hidden(el) || scrolls(el)) continue;
    if (r.right > vw + 1 || r.left < -1) { out.push(`button "${label(el)}" sticks out (${Math.round(r.left)}..${Math.round(r.right)} of ${vw})`); seen.add(el); }
  }
  // 2. words that stick out of the screen or out of their button
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (n.textContent.trim().length < 2) continue;
    const el = n.parentElement;
    if (!el || hidden(el) || scrolls(el) || el.closest('[class*="marq"]')) continue; // marquees scroll on purpose
    if (el.getBoundingClientRect().width <= 1 || getComputedStyle(el).clip !== 'auto') continue; // screen-reader-only text
    if (getComputedStyle(el).textOverflow === 'ellipsis') continue; // cut with … on purpose
    const r = textRect(n);
    if (r.width < 2 || r.bottom < 0) continue;
    const btn = el.closest('button, a[href], [role="button"], [data-act]');
    if (btn && seen.has(btn)) continue;
    if (r.right > vw + 1 || r.left < -1) { out.push(`text "${n.textContent.trim().slice(0, 30)}" sticks out of the screen (${Math.round(r.left)}..${Math.round(r.right)} of ${vw})`); continue; }
    if (btn) { const b = btn.getBoundingClientRect(); if (r.right > b.right + 2 || r.left < b.left - 2) out.push(`text "${n.textContent.trim().slice(0, 30)}" spills out of its button (${Math.round(r.left)}..${Math.round(r.right)} vs ${Math.round(b.left)}..${Math.round(b.right)})`); }
  }
  return out;
};

let bad = 0;
for (const skin of skins) {
  const problems = [];
  for (const [w, h] of sizes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const wait = (ms) => page.waitForTimeout(ms);
    const url = `${base}/${skin}.html`;
    const look = async (name) => {
      const list = await page.evaluate(scan);
      if (list.length) {
        for (const p of list) problems.push(`${w}px ${name}: ${p}`);
        await page.screenshot({ path: path.join(root, 'shots', `fit-${skin}-${w}-${name}.jpeg`), type: 'jpeg', quality: 70 });
      }
    };
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate((sk) => { localStorage.clear(); localStorage.setItem('loopdoku_save_v1', JSON.stringify({ unlocked: ['neon', 'idol', sk], skin: sk })); }, skin);
    await page.goto(url + '#title', { waitUntil: 'load' });
    await wait(1800); await look('title');
    // win a 10x10 with a long streak (longest Next label + streak pills)
    const big = await page.evaluate(() => { for (const p of LD.meta.packs()) for (const L of p.levels) if (L.n === 10) return L.id; return null; });
    await page.evaluate((id) => { LD.meta.state.streak = 44; LD.meta.state.dayStreak = 12; LD.meta.state.points = 39140; LD.meta.save(); window.LDSKIN.start(id); }, big);
    await wait(1500); await look('game10');
    await page.evaluate(() => { const g = window.LDSKIN.game(); for (let r = 0; r < g.n; r++) { const i = r * g.n + g.p.sol[r]; while (g.cells[i] !== 0 && g.cells[i] !== 3) g.tap(i); if (g.cells[i] !== 3) g.place(i); } });
    for (let t = 0; t < 30; t++) { await wait(300); if (await page.evaluate(() => window.LDSKIN.screen() === 'win')) break; }
    await wait(2600); await look('win');
    await page.evaluate(() => window.LDSKIN.start('easy-1')); await wait(1200); await look('game5');
    // lose
    await page.evaluate(() => { LD.meta.state.streak = 12; LD.meta.save(); window.LDSKIN.start('normal-1'); }); await wait(1000);
    await page.evaluate(() => { const g = window.LDSKIN.game(); for (let i = 0; i < g.N && !g.over; i++) if (!g.isSolution(i) && g.cells[i] === 0) g.place(i); });
    for (let t = 0; t < 25; t++) { await wait(300); if (await page.evaluate(() => window.LDSKIN.screen() === 'lose')) break; }
    await wait(1800); await look('lose');
    // shared overlays
    for (const [name, fn] of [['tour', 'levels'], ['looks', 'skins'], ['settings', 'settings'], ['support', 'support']]) {
      await page.evaluate((f) => { LD.ui.close(true); LD.ui[f]({ onPlay: () => {}, onChange: () => {}, onClose: () => {} }); }, fn);
      await wait(800); await look(name);
    }
    await page.evaluate(() => LD.ui.close(true));
    await ctx.close();
  }
  const uniq = [...new Set(problems)];
  console.log(`${skin}: ${uniq.length ? 'FAIL' : 'PASS'}`);
  for (const p of uniq) console.log('  - ' + p);
  if (uniq.length) bad++;
}
await browser.close();
process.exit(bad ? 1 : 0);
