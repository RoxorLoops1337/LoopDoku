// Check for the Chinese edition: node tools/cn_check.mjs [port]   (needs node tools/serve.mjs on the repo root, default :5320)
// Phone emulation (390x844). Plays the tutorial with real taps, wins the first gig, fits a 10x10, loses a gig, and fails if
// the page asks for anything outside its own origin (fonts, CDNs: those are what stall in mainland China) or logs an error.
// Screenshots: shots/cn-*.jpeg. Exit code 1 on any failure.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let chromium;
try { ({ chromium } = await import('playwright-core')); } catch (e) { ({ chromium } = createRequire(import.meta.url)('playwright')); }
const port = process.argv[2] || 5320;
const base = process.env.LD_BASE || `http://localhost:${port}`;
const url = base + '/cn/';
fs.mkdirSync(path.join(root, 'shots'), { recursive: true });
const exe = ['/opt/pw-browsers/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'zh-CN' });
const page = await ctx.newPage();
const errors = [], fails = [], outside = [];
const origin = new URL(url).origin;
page.on('request', (r) => { const u = r.url(); if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) outside.push(u); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
const shot = (name) => page.screenshot({ path: path.join(root, 'shots', `cn-${name}.jpeg`), type: 'jpeg', quality: 80 });
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const wait = (ms) => page.waitForTimeout(ms);
const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const cellXY = (i) => page.evaluate((i) => { const g = LDCN.game(), b = document.getElementById('board').children[i].getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, n: g.n }; }, i);
async function tap(i) { const p = await cellXY(i); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.up(); }
async function dbl(i) { await tap(i); await wait(60); await tap(i); }
async function solveByTaps() {
  const sol = await page.evaluate(() => { const g = LDCN.game(); return g.p.sol.map((c, r) => r * g.n + c).filter((i) => g.cells[i] !== LD.CELL.PIECE); });
  for (const i of sol) { await dbl(i); await wait(380); }
}
const step = () => page.evaluate(() => LDCN.tutorial());

await page.goto(url, { waitUntil: 'load' });
await wait(400);
check(await page.isVisible('#modal.on .rules'), 'first visit opens the tutorial intro');
check(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'lang is zh-CN');
await shot('1-intro');
await page.click('#modal [data-go]');
await wait(300);
check(await step() === 0, 'tutorial at step 1');
await shot('2-tut-step1');
await tap(0); await wait(500);
check(await step() === 1, 'tap advances to step 2, got ' + await step());
{ // slide along row 3, columns 0..3
  const a = await cellXY(15), b = await cellXY(18);
  await page.mouse.move(a.x, a.y); await page.mouse.down();
  for (let k = 1; k <= 8; k++) await page.mouse.move(a.x + (b.x - a.x) * k / 8, a.y, { steps: 2 });
  await page.mouse.up(); await wait(500);
}
check(await step() === 2, 'slide advances to step 3, got ' + await step());
await shot('3-tut-step3');
await dbl(5 * 4 + 2); await wait(900);
check(await step() === 3, 'double-tap on the yellow square advances to step 4, got ' + await step());
await shot('4-tut-step4');
await page.click('#rowArr button:nth-child(5)'); await wait(900);
check(await step() === 4, 'row arrow advances to step 5, got ' + await step());
await page.click('#tHint'); await wait(600);
check(await step() === 5, 'hint advances to step 6, got ' + await step());
await shot('5-tut-step6');
await solveByTaps(); await wait(1500);
check(await page.isVisible('#modal.on [data-go]'), 'tutorial done card shows');
await shot('6-tut-done');
check(await page.evaluate(() => Object.keys(LDCN.state().solved).length) === 0, 'tutorial does not count as a solved gig');
await page.click('#modal [data-go]'); await wait(400);
check(await page.evaluate(() => LDCN.game().p.id) === 'easy-1', 'tutorial leads into Easy 1');
await solveByTaps(); await wait(1500);
check(await page.isVisible('#modal.on [data-n]'), 'win card with Next gig');
await wait(800); await shot('7-win');
const st = await page.evaluate(() => LDCN.state());
check(st.solved['easy-1'] && st.points > 0, 'win saved with points');
check(await page.evaluate(() => !localStorage.getItem('loopdoku_save_v1')), 'English save key untouched');
await page.click('#modal [data-l]'); await wait(300);
check(await page.evaluate(() => LDCN.screen()) === 'levels', 'gig list opens'); await shot('8-levels');
// 10x10 fit
await page.evaluate(() => LDCN.start('nightmare-1')); await wait(400);
const fit = await page.evaluate(() => { const p = document.getElementById('play').getBoundingClientRect(), a = document.querySelector('#rowArr button').getBoundingClientRect(), t = document.querySelector('.tools').getBoundingClientRect();
  return { left: p.left, right: p.right, bottom: t.bottom, aw: a.width, ah: a.height, n: LDCN.game().n }; });
check(fit.n === 10 && fit.left >= 0 && fit.right <= 390, '10x10 board fits the width ' + JSON.stringify(fit));
check(fit.bottom <= 844, '10x10 tools fit on screen ' + fit.bottom);
check(fit.aw >= 28 && fit.ah >= 28, 'arrow tap target >= 28px ' + fit.aw + 'x' + fit.ah);
check(await overflow() <= 0, 'no horizontal scroll on 10x10');
await page.click('#colArr button:nth-child(3)'); await wait(700); await shot('9-10x10');
// lose
await page.evaluate(() => LDCN.start('easy-2')); await wait(300);
const wrong = await page.evaluate(() => { const g = LDCN.game(), o = []; for (let i = 0; i < g.N && o.length < 3; i++) if (!g.isSolution(i)) o.push(i); return o; });
for (const i of wrong) { await dbl(i); await wait(400); }
await wait(1200);
check(await page.isVisible('#modal.on [data-r]'), 'lose card with Try again'); await shot('10-lose');
// reload keeps progress, no intro the second time
await page.goto(url, { waitUntil: 'load' }); await wait(400);
check(!(await page.isVisible('#modal.on')), 'no intro on the second visit');
check(/简单/.test(await page.textContent('#bPlay')), 'Play says what is next');
await shot('11-title');
check(outside.length === 0, 'requests outside the page origin: ' + outside.join(', '));
check(errors.length === 0, 'errors: ' + errors.join(' | '));
const size = fs.statSync(path.join(root, 'cn', 'index.html')).size;
await browser.close();
console.log('cn/index.html', (size / 1024).toFixed(1) + ' KB');
if (fails.length) { console.log('FAIL\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('PASS: tutorial, win, 10x10 fit, lose, no outside requests, no errors');
