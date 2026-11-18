// Checks the share button, phone vibration and offline play in every look: node tools/feature_check.mjs  (static server on :5320)
import fs from 'node:fs';
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((x) => fs.existsSync(x)) });
const out = {};
for (const skin of ['neon','idol','comic','sticker','paper','studio','riso','jelly','watercolour','pixel']) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => { window.__buzz = []; navigator.vibrate = (p) => { window.__buzz.push(p); return true; }; window.__shared = null; window.__full = 0; Object.defineProperty(document, 'fullscreenEnabled', { get: () => true }); Element.prototype.requestFullscreen = function () { window.__full++; return Promise.resolve(); }; navigator.share = (d) => { window.__shared = d; return Promise.resolve(); }; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.stack.split('\n').slice(0,4).join(' | ')));
  const u = `http://localhost:5320/${skin}.html`;
  await p.goto(u); await p.evaluate((s) => localStorage.setItem('loopdoku_save_v1', JSON.stringify({ unlocked: ['neon','idol',s], skin: s })), skin);
  await p.goto(u + '#title'); await p.waitForTimeout(1200); await p.mouse.click(5, 5);
  await p.evaluate(() => { LD.meta.state.streak = 4; LD.meta.state.dayWins = {};  window.LDSKIN.start('easy-1'); }); await p.waitForTimeout(900);
  await p.evaluate(() => { const g = window.LDSKIN.game(); for (let r = 0; r < g.n; r++) { const i = r * g.n + g.p.sol[r]; while (g.cells[i] !== 0 && g.cells[i] !== 3) g.tap(i); if (g.cells[i] !== 3) g.place(i); } });
  for (let t = 0; t < 30; t++) { await p.waitForTimeout(300); if (await p.evaluate(() => window.LDSKIN.screen() === 'win')) break; }
  await p.waitForTimeout(2500);
  const btn = p.locator('.ldx-share');
  const vis = await btn.isVisible().catch(() => false);
  if (vis) await btn.click({ force: false }).catch((e) => errs.push('click: ' + e.message.split('\n')[0]));
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({ buzz: window.__buzz.length, full: window.__full, shared: window.__shared, screen: window.LDSKIN.screen() }));
  
  out[skin] = { shareVisible: vis, shared: r.shared && r.shared.text, buzzes: r.buzz, full: r.full, screenAfter: r.screen, errs };
  await ctx.close();
}
let bad = 0;
for (const k in out) { const o = out[k], ok = o.shareVisible && o.shared && o.buzzes > 0 && o.full > 0 && !o.errs.length; if (!ok) bad++; console.log(k + ': ' + (ok ? 'PASS' : 'FAIL ' + JSON.stringify(o))); }
// offline
const ctx = await b.newContext(); const p = await ctx.newPage();
await p.goto('http://localhost:5320/neon.html'); await p.evaluate(async () => { await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready; });
await p.reload(); await p.waitForTimeout(1500); await p.reload(); await p.waitForTimeout(1500);
await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(2000);
const off = await p.evaluate(() => !!(window.LD && window.LD.meta && window.LDSKIN)); if (!off) bad++;
console.log('offline: ' + (off ? 'PASS' : 'FAIL'));
await b.close();
process.exit(bad ? 1 : 0);
