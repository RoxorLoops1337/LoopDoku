// Check for the Chinese edition: node tools/cn_check.mjs [port]   (needs node tools/serve.mjs on the repo root, default :5320)
// Phone emulation at 390x720 (a phone with the in-app browser bar) plus 360x640 and 412x900. Plays the tutorial with real taps,
// wins the first gig, fits a 10x10, loses a gig, carries an old save over, scans every screen for leftover English (DOM and
// canvas text), and fails on any request outside the page's own origin (fonts, CDNs: what stalls in China) or any error.
// Screenshots: shots/cn-*.jpeg. Exit code 1 on any failure.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let chromium;
try { ({ chromium } = await import('playwright-core')); } catch (e) { ({ chromium } = createRequire(import.meta.url)('playwright')); }
const port = process.argv[2] || 5320;
const url = (process.env.LD_BASE || `http://localhost:${port}`) + '/cn/';
fs.mkdirSync(path.join(root, 'shots'), { recursive: true });
const exe = ['/opt/pw-browsers/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
// words that may stay in Latin letters: the duo, the game's name, units
const ALLOW = /^(RoxorLoops|Roxor|Jasmin|LoopDoku|LOOP|DOKU|L|P|D|O|K|U|T|RawClaw|Andy|Jordan|R|SR|SSR|x|X|pts?)$/;

async function session(vw, vh, oldSave) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'zh-CN' });
  if (oldSave) await ctx.addInitScript((s) => { if (!localStorage.getItem('loopdoku_cn_v2')) localStorage.setItem('loopdoku_cn_v1', s); }, oldSave);
  // record every string drawn on a canvas, to catch English in the art
  await ctx.addInitScript(() => {
    window.__vib = []; navigator.vibrate = (p) => { window.__vib.push(p); return true; };
    window.__txt = new Set();
    const P = CanvasRenderingContext2D.prototype;
    for (const k of ['fillText', 'strokeText']) { const f = P[k]; P[k] = function (t, ...a) { window.__txt.add(String(t)); return f.call(this, t, ...a); }; }
  });
  const page = await ctx.newPage();
  const errors = [], outside = [], origin = new URL(url).origin;
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) outside.push(u); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
  const tag = vw + 'x' + vh;
  const S = {
    page, errors, outside,
    shot: (name) => page.screenshot({ path: path.join(root, 'shots', `cn-${tag}-${name}.jpeg`), type: 'jpeg', quality: 80 }),
    wait: (ms) => page.waitForTimeout(ms),
    cellXY: (i) => page.evaluate((i) => { const g = LDSKIN.game(), r = document.getElementById('host').getBoundingClientRect(), n = g.n, m = Math.round(Math.min(20, Math.max(11, r.width * 0.042))), c = (r.width - 2 * m) / n; return { x: r.left + m + (i % n + 0.5) * c, y: r.top + m + (((i / n) | 0) + 0.5) * c }; }, i),
    async tap(i) { const p = await S.cellXY(i); await page.touchscreen.tap(p.x, p.y); },
    async dbl(i) { await S.tap(i); await S.wait(80); await S.tap(i); },
    async slide(i, j) { const a = await S.cellXY(i), b = await S.cellXY(j); await page.mouse.move(a.x, a.y); await page.mouse.down(); for (let k = 1; k <= 10; k++) await page.mouse.move(a.x + (b.x - a.x) * k / 10, a.y + (b.y - a.y) * k / 10, { steps: 2 }); await page.mouse.up(); await S.wait(700); },
    async solve() { const sol = await page.evaluate(() => { const g = LDSKIN.game(); return g.p.sol.map((c, r) => r * g.n + c).filter((i) => g.cells[i] !== LD.CELL.PIECE); }); for (const i of sol) { await S.dbl(i); await S.wait(420); } },
    async english(where) {
      const words = await page.evaluate(() => {
        const out = new Set();
        const vis = (el) => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length; };
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) { const el = n.parentElement; if (!el || /SCRIPT|STYLE/.test(el.tagName) || !vis(el)) continue; for (const m of n.textContent.match(/[A-Za-z][A-Za-z']*/g) || []) out.add(m); }
        for (const t of window.__txt) for (const m of t.match(/[A-Za-z][A-Za-z']*/g) || []) out.add(m);
        return [...out];
      });
      const bad = words.filter((x) => !ALLOW.test(x));
      check(!bad.length, `${tag} ${where}: English left: ${bad.join(', ')}`);
    },
    close: () => ctx.close(),
  };
  await page.goto(url, { waitUntil: 'load' });
  await S.wait(900);
  return S;
}
const tut = (S) => S.page.evaluate(() => LDCN.tut());

// ---- 1. first visit at 390x720: intro, the whole tutorial with real taps, the first real gig, the win screen
{
  const S = await session(390, 720);
  const { page } = S;
  check(await page.isVisible('#tutIntro.on'), 'first visit opens the rules card');
  check(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'lang is zh-CN');
  await S.shot('1-intro'); await S.english('intro');
  await page.click('[data-tut=go]'); await S.wait(900);
  check(await tut(S) === 0, 'tutorial at step 1');
  await S.shot('2-tut1');
  // 1: the zone with one square (row 2, column 0) gets the first performer
  await S.dbl(10); await S.wait(1200);
  check(await tut(S) === 1, 'double-tap on the one-square zone: step 2, got ' + await tut(S));
  await S.shot('3-tut2');
  // 2: slide along its row
  await S.slide(11, 14);
  check(await tut(S) === 2, 'slide along the row: step 3, got ' + await tut(S));
  // 3: its column's arrow
  await page.locator('#arws .arw[data-k=col][data-i="0"]').dispatchEvent('pointerdown'); await S.wait(1100);
  check(await tut(S) === 3, 'column arrow: step 4, got ' + await tut(S));
  await S.shot('4-tut4');
  // 4: a diagonal neighbour
  await S.tap(6); await S.wait(700);
  check(await tut(S) === 4, 'tap a diagonal: step 5, got ' + await tut(S));
  // 5: the other one-square zone
  await S.dbl(22); await S.wait(1200);
  check(await tut(S) === 5, 'second one-square zone: step 6, got ' + await tut(S));
  await page.click('#hintBtn'); await S.wait(900);
  check(await tut(S) === 6, 'hint: step 7, got ' + await tut(S));
  check(await page.evaluate(() => !LDSKIN.game().mistakes), 'the tutorial path makes no mistake');
  await S.shot('5-tut6'); await S.english('tutorial');
  await S.solve(); await S.wait(3800);
  check(await page.evaluate(() => LDCN.screen()) === 'win', 'tutorial ends on the win screen');
  check(await page.evaluate(() => LD.meta.settings().tutDone === true && !Object.keys(LD.meta.state.solved).length), 'tutorial marked done, nothing solved');
  await S.shot('6-tut-win'); await S.english('tutorial win');
  await page.click('[data-act=next]'); await S.wait(700);
  check(await page.evaluate(() => LDCN.picker()), 'after the tutorial the level picker opens');
  await S.shot('7a-picker'); await S.english('picker');
  await page.click('[data-lv="0"]'); await S.wait(900);
  check(await page.evaluate(() => LDSKIN.game().p.id) === 'easy-1', 'tutorial leads into Easy 1, got ' + await page.evaluate(() => LDSKIN.game().p.id));
  await S.shot('7-easy1'); await S.english('game');
  await S.solve(); await S.wait(3800);
  check(await page.evaluate(() => LDCN.screen()) === 'win', 'win screen');
  await S.wait(2500); await S.shot('8-win'); await S.english('win');
  check(await page.evaluate(() => { const r = document.getElementById('nextBtn').getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight; }), 'win: Next gig button fully visible without scrolling');
  check(await page.evaluate(() => !!LD.meta.state.solved['easy-1'] && LD.meta.points() > 0), 'win saved with points');
  check(await page.evaluate(() => !localStorage.getItem('loopdoku_save_v1')), 'English save untouched');
  await page.click('[data-act=wtour]'); await S.wait(700);
  check(await page.isVisible('.ldui'), 'gig list opens'); await S.shot('9-tour'); await S.english('tour');
  await page.click('.ldui-x'); await S.wait(300);
  await S.shot('10-title'); await S.english('title');
  await page.click('[data-act=settings]'); await S.wait(400); await S.shot('11-settings'); await S.english('settings'); await page.click('.ldui-x');
  await page.click('[data-act=outfits]'); await S.wait(700); await S.shot('12-outfits'); await S.english('outfits');
  // a 10x10 and a loss
  await page.evaluate(() => LDSKIN.start('nightmare-1')); await S.wait(900);
  await page.evaluate(() => { const g = LDSKIN.game(); g.place(g.p.sol[0]); g.place(g.n + g.p.sol[1]); g.crossLine('row', 4); });
  await S.wait(900); await S.shot('13-10x10'); await S.english('10x10');
  await page.click('[data-act=pause]'); await S.wait(400); await S.shot('14-menu'); await S.english('menu'); await page.click('[data-act=resume]');
  await page.evaluate(() => LDSKIN.start('easy-2')); await S.wait(500);
  const wrong = await page.evaluate(() => { const g = LDSKIN.game(), o = []; for (let i = 0; i < g.N && o.length < 3; i++) if (!g.isSolution(i)) o.push(i); return o; });
  for (const i of wrong) { await S.dbl(i); await S.wait(500); }
  await S.wait(1800);
  check(await page.isVisible('#lose.on'), 'lose card'); await S.shot('15-lose'); await S.english('lose');
  // reload: no rules card the second time
  await page.goto(url, { waitUntil: 'load' }); await S.wait(800);
  check(!(await page.isVisible('#tutIntro.on')), 'no rules card on the second visit');
  check(!S.outside.length, 'requests outside the page origin: ' + S.outside.join(', '));
  check(!S.errors.length, 'errors: ' + S.errors.join(' | '));
  await S.close();
}

// ---- 2. small and tall phones: the 10x10 fits, nothing scrolls sideways, arrows are big enough
for (const [w, h] of [[360, 640], [390, 720], [412, 900]]) {
  const S = await session(w, h);
  await S.page.click('[data-tut=skip]'); await S.wait(300); await S.page.click('[data-lv="0"]'); await S.wait(500);
  await S.page.evaluate(() => LDSKIN.start('nightmare-1')); await S.wait(900);
  const fit = await S.page.evaluate(() => {
    const b = document.getElementById('bwrap').getBoundingClientRect(), row = document.querySelector('.btnrow').getBoundingClientRect(), a = document.querySelector('#arws .arw').getBoundingClientRect();
    return { left: b.left, right: b.right, bottom: row.bottom, aw: a.width, ah: a.height, sw: document.documentElement.scrollWidth };
  });
  check(fit.left >= 0 && fit.right <= w && fit.sw <= w, `${w}x${h}: 10x10 fits the width ${JSON.stringify(fit)}`);
  check(fit.bottom <= h + 1, `${w}x${h}: buttons on screen (${fit.bottom})`);
  check(Math.min(fit.aw, fit.ah) >= 28, `${w}x${h}: arrow tap target ${fit.aw}x${fit.ah}`);
  await S.shot('10x10');
  check(!S.errors.length, `${w}x${h} errors: ` + S.errors.join(' | '));
  await S.close();
}

// ---- 4. the tutorial on a small phone, taking the other one-square zone (row 2), with the bubble checked at every step
{
  const S = await session(360, 640);
  const { page } = S;
  const bubble = async (k) => {
    const r = await page.evaluate(() => { const b = document.getElementById('say').getBoundingClientRect(), c = document.querySelector('#scr-game .crowdbox').getBoundingClientRect(), k = document.getElementById('tutSkip').getBoundingClientRect(), row = document.querySelector('.btnrow').getBoundingClientRect();
      return { inBox: b.top >= c.top - 1 && b.bottom <= c.bottom + 1 && b.left >= 0 && b.right <= innerWidth, overlap: !(b.bottom <= k.top || k.bottom <= b.top || b.right <= k.left || k.right <= b.left), onScreen: row.bottom <= innerHeight + 1 }; });
    check(r.inBox && !r.overlap && r.onScreen, `360x640 tutorial step ${k}: bubble ${JSON.stringify(r)}`);
  };
  await page.click('[data-tut=go]'); await S.wait(900); await bubble(1);
  // the other one-square zone first (row 4, column 2): the steps follow that performer
  await S.dbl(22); await S.wait(1200); await bubble(2);
  check(await tut(S) === 1, '360x640: the other one-square zone also starts it, got ' + await tut(S));
  await S.slide(20, 24); await bubble(3);
  check(await tut(S) === 2, '360x640: slide across the row (past the performer) advances, got ' + await tut(S));
  check(await page.evaluate(() => { const el = document.querySelector('#arws .arw.tglow'); return el && el.dataset.k === 'col' && el.dataset.i === '2'; }), 'step 3 points at the column of the first performer');
  await S.shot('tut3-alt');
  await page.locator('#arws .arw[data-k=col][data-i="2"]').dispatchEvent('pointerdown'); await S.wait(1100); await bubble(4);
  check(await tut(S) === 3, '360x640: column arrow advances, got ' + await tut(S));
  await S.tap(16); await S.wait(700); await bubble(5);
  check(await tut(S) === 4, '360x640: diagonal advances, got ' + await tut(S));
  await S.dbl(10); await S.wait(1200);
  check(await tut(S) === 5, '360x640: second one-square zone advances, got ' + await tut(S));
  check(await page.evaluate(() => !LDSKIN.game().mistakes), 'the alternative path made no mistake');
  await bubble(6); await page.click('#hintBtn'); await S.wait(900); await bubble(7);
  await S.shot('tut6'); await S.english('tutorial');
  await S.solve(); await S.wait(3800);
  check(await page.evaluate(() => LDCN.screen()) === 'win', '360x640 tutorial ends on the win screen');
  // rare branches: a win streak and the daily challenge
  await page.evaluate(() => { LD.meta.state.streak = 3; LDSKIN.start('easy-3'); }); await S.wait(600);
  await S.solve(); await S.wait(4200); await S.shot('streak-win'); await S.english('streak win');
  await page.evaluate(() => LDSKIN.start(LD.meta.daily().id)); await S.wait(900); await S.shot('daily'); await S.english('daily');
  check(!S.outside.length, '360x640 outside requests: ' + S.outside.join(', '));
  check(!S.errors.length, '360x640 errors: ' + S.errors.join(' | '));
  await S.close();
}

// ---- 5. harder sooner: challenge to unlock (lost, then won), the picker from Settings, reset; hints, vibration, the clock
{
  const S = await session(360, 640);
  const { page } = S;
  await page.click('[data-tut=skip]'); await S.wait(300);
  check(await page.evaluate(() => LDCN.picker()), 'skipping the tutorial opens the level picker');
  await page.click('[data-lv="0"]'); await S.wait(800);
  check(await page.evaluate(() => LDSKIN.game().p.id === 'easy-1' && !LD.meta.packOpen('hard')), 'beginner starts at Easy 1 with Hard still locked');
  // hint: the bubble says why, in Chinese, two short lines at most, even on the bottom row of a small phone
  await page.click('#hintBtn'); await S.wait(700);
  const hb = await page.evaluate(() => { const b = document.getElementById('say').getBoundingClientRect(); return { t: document.getElementById('sayT').textContent, h: b.height, l: b.left, r: b.right }; });
  check(/[一-鿿]/.test(hb.t) && hb.h < 64 && hb.l >= 0 && hb.r <= 360, 'hint bubble: ' + JSON.stringify(hb));
  await S.shot('hint'); await S.english('hint');
  // vibration on a placed performer, none when switched off
  await S.dbl(await page.evaluate(() => { const g = LDSKIN.game(); for (let r = 0; r < g.n; r++) { const i = r * g.n + g.p.sol[r]; if (g.cells[i] !== LD.CELL.PIECE) return i; } return 0; })); await S.wait(500);
  check(await page.evaluate(() => window.__vib.length > 0), 'placing a performer vibrates');
  await page.evaluate(() => { LD.meta.set('vibrate', false); window.__vib.length = 0; });
  await S.dbl(await page.evaluate(() => { const g = LDSKIN.game(); for (let r = 0; r < g.n; r++) { const i = r * g.n + g.p.sol[r]; if (g.cells[i] !== LD.CELL.PIECE) return i; } return 0; })); await S.wait(500);
  check(await page.evaluate(() => window.__vib.length === 0), 'no vibration when switched off');
  // the clock stops while the app is in the background
  const t0 = await page.evaluate(() => LDSKIN.game().elapsed());
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await S.wait(3000);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  const t1 = await page.evaluate(() => LDSKIN.game().elapsed());
  check(t1 - t0 < 1200, 'the clock paused in the background: ' + Math.round(t1 - t0) + ' ms passed');
  // challenge to unlock Hard from the gig list, then lose it: Play still continues the Easy gig
  await page.click('[data-act=pause]'); await S.wait(300); await page.click('#sheet [data-act=tour]'); await S.wait(600);
  await page.click('.ldui-tab[data-p=hard]'); await S.wait(300);
  await S.shot('challenge-offer'); await S.english('challenge offer');
  await page.click('[data-try]'); await S.wait(900);
  check(await page.evaluate(() => LDSKIN.game().p.id) === 'hard-1', 'the challenge starts Hard 1');
  check(await page.evaluate(() => LD.meta.currentId()) !== 'hard-1', 'a challenge does not become the gig Play continues');
  await S.shot('challenge'); await S.english('challenge');
  const wrong = await page.evaluate(() => { const g = LDSKIN.game(), o = []; for (let i = 0; i < g.N && o.length < 3; i++) if (!g.isSolution(i) && !g.attacks(i, i)) o.push(i); return o; });
  for (const i of wrong) { await S.dbl(i); await S.wait(500); }
  await S.wait(1800);
  check(await page.isVisible('#lose.on'), 'challenge lost');
  await page.click('#lose [data-act=retry]'); await S.wait(700);
  check(await page.evaluate(() => LDSKIN.game().p.id === 'hard-1' && LD.meta.currentId() !== 'hard-1'), 'retrying the challenge still keeps Play on the normal gig');
  await page.click('[data-act=title]'); await S.wait(500);
  check(/简单/.test(await page.textContent('#playSub')), 'Play still says Easy after the lost challenge: ' + await page.textContent('#playSub'));
  // win the challenge: Hard opens and stays open after a reload
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('ld-try', { detail: 'hard-1' }))); await S.wait(900);
  await S.solve(); await S.wait(4200);
  check(await page.evaluate(() => LD.meta.packOpen('hard')), 'winning the challenge opens Hard');
  check(await page.evaluate(() => [...window.__txt].some((t) => t.indexOf('新舞台开放') >= 0)), 'the "new stage open" call is shown in Chinese');
  await S.shot('challenge-won'); await S.english('challenge won');
  await page.goto(url, { waitUntil: 'load' }); await S.wait(800);
  check(await page.evaluate(() => LD.meta.packOpen('hard') && LD.meta.currentId() === 'hard-2'), 'Hard stays open after a reload and Play continues at Hard 2: ' + await page.evaluate(() => LD.meta.currentId()));
  // the picker from Settings opens Expert and Terror and starts Hard
  await page.click('[data-act=settings]'); await S.wait(400); await S.shot('settings'); await S.english('settings');
  await page.click('[data-pick]'); await S.wait(400);
  check(await page.evaluate(() => LDCN.picker()), 'Settings opens the level picker');
  await page.click('[data-lv="2"]'); await S.wait(900);
  check(await page.evaluate(() => LD.meta.packOpen('expert') && LD.meta.packOpen('terror') && LDSKIN.game().p.id.startsWith('hard-')), 'expert choice opens Expert and Terror and starts a Hard gig');
  await S.shot('expert-start'); await S.english('expert start');
  // reset locks everything again
  await page.evaluate(() => LD.meta.resetProgress());
  check(await page.evaluate(() => !LD.meta.packOpen('hard') && !LD.meta.packOpen('expert')), 'reset locks the packs again');
  check(!S.outside.length, 'section 5 outside requests: ' + S.outside.join(', '));
  check(!S.errors.length, 'section 5 errors: ' + S.errors.join(' | '));
  await S.close();
}

// ---- 3. an old save from the first Chinese edition carries over
{
  const old = JSON.stringify({ points: 77, solved: { 'easy-1': { stars: 3, ms: 9000 }, 'easy-2': { stars: 2, ms: 12000 } }, current: null, tut: true, sound: true, music: false });
  const S = await session(390, 720, old);
  const st = await S.page.evaluate(() => ({ p: LD.meta.points(), s: Object.keys(LD.meta.state.solved).length, t: LD.meta.settings().tutDone, m: LD.meta.settings().music, intro: document.querySelector('#tutIntro').classList.contains('on') }));
  check(st.p === 77 && st.s === 2 && st.t === true && st.m === false && !st.intro, 'old save carried over: ' + JSON.stringify(st));
  await S.close();
}

await browser.close();
const size = fs.statSync(path.join(root, 'cn', 'index.html')).size;
console.log('cn/index.html', (size / 1024).toFixed(1) + ' KB');
if (fails.length) { console.log('FAIL\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('PASS: tutorial, win, gig list, 10x10 fit on 3 phones, lose, old save, no English, no outside requests, no errors');
