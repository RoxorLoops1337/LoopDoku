// ---------------------------------------------------------------------------------------------------------- 中文教学 (Chinese edition only)
// Inserted by tools/build_cn.mjs into the idol page script, right before its boot code, so it can use the page's own
// wand, caption bubble, effects and setupGame(game, demo=true) (a demo game never touches the save).
// All text is Simplified Chinese with the English meaning in the comment next to it.
const TUTT = {
  introT: '怎么玩',                                                 // How to play
  rules: [
    ['行', '每一行放一位表演者'],                                    // one performer in every row
    ['列', '每一列放一位表演者'],                                    // one performer in every column
    ['色', '每个颜色区域放一位表演者'],                              // one performer in every colour zone
    ['邻', '表演者互不相邻，斜角也不行'],                            // performers never touch, not even at a corner
  ],
  rulesP: '每一关只有一个答案，只靠逻辑就能解开，不用猜。',             // one answer per board, logic only, no guessing
  go: '开始教学', skip: '跳过教学',                                   // start tutorial, skip tutorial
  step: (a, b) => a + ' / ' + b,
  // the tutorial reasons forward: a zone with one square must hold a performer, and every X after that has a reason
  s1: '先找只有一个格子的颜色区域：表演者一定在这里！快速点两下，放上表演者。',  // find a zone with one square: the performer must be there! double-tap to place
  s1bad: '放错会失去一个麦克风 🎤！找找只有一个格子的颜色区域。',              // a wrong one costs a mic! look for a zone with one square
  s2: '同一行不能再有别的表演者。按住并在这一行上滑动，把它们都打叉。',          // nobody else fits in this row: hold and slide along it to cross them all
  s3: '同一列也一样！点这一列上面的箭头，整列一次打叉。',                     // same for the column: tap the arrow above it to cross the whole column
  s4: '表演者也不能挨在一起，斜角也不行。点一下发光的格子，打个叉。',            // performers never touch, not even at a corner: tap the glowing square to cross it
  s5: '还有一个只有一个格子的颜色区域，放上第二位表演者！',                    // there is another zone with one square: place the second performer
  s6: '卡住了？点「问 Jasmin」，我来帮你！',                                // stuck? tap Ask Jasmin and I help
  s7: '现在靠你自己完成这一关！也可以按住格子不放来放置表演者。',               // now finish it yourself! press and hold also places a performer
};
LD.loop.LAYER_NAMES = ['底鼓', '踩镲', '军鼓', '贝斯', '和声', '沙锤', '旋律', '拍手', '切片'];  // Kick Hats Snare Bass Pad Shaker Hook Claps Chops

const TUT = { on: false, step: 0, gm: null, timer: 0, ring: 0, first: -1 };
// squares that are a colour zone of their own (on the tutorial board: two of them)
const singles = (g) => { const cnt = {}; for (const k of g.region) cnt[k] = (cnt[k] || 0) + 1; const out = []; for (let i = 0; i < g.N; i++) if (cnt[g.region[i]] === 1) out.push(i); return out; };
const firstRC = () => game.rc(TUT.first);
const TUT_STEPS = [
  { txt: 's1', cell: (g) => singles(g)[0], done: (ev) => ev === 'place' },
  { txt: 's2', cells: (g) => g.rowCells(firstRC().r).filter((i) => g.cells[i] === LD.CELL.EMPTY), done: (ev, d) => ev === 'stroke' && d.mode === 'mark' && d.count >= 2 },
  { txt: 's3', arrow: () => ['col', firstRC().c], done: (ev) => ev === 'line' },
  { txt: 's4', cells: (g) => { const { r, c } = firstRC(), o = []; for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < g.n && cc >= 0 && cc < g.n && g.cells[g.idx(rr, cc)] === LD.CELL.EMPTY) o.push(g.idx(rr, cc)); } return o; },
    done: (ev, d) => ev === 'mark' && d.on && (d.source === 'tap' || d.source === 'drag') },
  { txt: 's5', cell: (g) => singles(g).find((i) => g.cells[i] !== LD.CELL.PIECE), done: (ev) => ev === 'place' },
  { txt: 's6', btn: '#hintBtn', done: (ev) => ev === 'hint' },
  { txt: 's7', done: () => false },
];
function tutSay(text) {
  const el = $('#say');
  $('#sayT').innerHTML = '<small class="tstep">' + TUTT.step(Math.min(TUT.step + 1, TUT_STEPS.length), TUT_STEPS.length) + '</small>' + text;
  el.classList.add('on'); clearTimeout(sayTimer);
}
// the bubble is a one-liner during play; during the tutorial it is a card under the board
const sayOrig = say;
say = function (text, ms) { if (TUT.on) return; sayOrig(text, ms); };
function tutClear() {
  clearInterval(TUT.ring); TUT.ring = 0;
  $$('.tglow').forEach((el) => el.classList.remove('tglow'));
}
function tutPoint() {
  if (!TUT.on || !game || game !== TUT.gm) return;
  const st = TUT_STEPS[TUT.step]; if (!st) return;
  const w = $('#bwrap').getBoundingClientRect();
  if (st.cell) wandTo(st.cell(game), 650);
  else if (st.cells) { const cs = st.cells(game); wandTo(cs[0], 650); }
  else if (st.arrow) { const a = st.arrow(), el = arrowEl(a[0], a[1]); if (el) { const r = el.getBoundingClientRect(); wandXY(r.left - w.left + r.width / 2, r.top - w.top + r.height / 2, 650); } }
  else if (st.btn) { const r = $(st.btn).getBoundingClientRect(); wandXY(r.left - w.left + r.width / 2, r.top - w.top + r.height * 0.3, 650); }
  else wandOff();
}
function tutPulse() {
  if (!TUT.on || !game || game !== TUT.gm || scr !== 'game') return;
  const st = TUT_STEPS[TUT.step]; if (!st) return;
  const cells = st.cell ? [st.cell(game)] : st.cells ? st.cells(game) : [];
  for (const i of cells) { const p = cellPt(i); addP({ type: 'ring', x: p.x, y: p.y, r0: BD.c * 0.2, r1: BD.c * 0.62, w: 4, col: '#ffd84d', life: 0.7 }); }
  if (cells.length) V.hint = { set: new Set(cells), t0: now() - 200, i: cells[0] };
}
function tutGo(k) {
  if (!TUT.on) return;
  tutClear();
  TUT.step = k;
  const st = TUT_STEPS[k]; if (!st) return;
  if ((st.cells && !st.cells(game).length) || (st.cell && st.cell(game) == null)) { tutGo(k + 1); return; }
  tutSay(TUTT[st.txt]);
  if (st.arrow) { const a = st.arrow(), el = arrowEl(a[0], a[1]); if (el) el.classList.add('tglow'); }
  if (st.btn) $(st.btn).classList.add('tglow');
  setTimeout(tutPoint, 60);
  tutPulse(); TUT.ring = setInterval(tutPulse, 1500);
  if (k === TUT_STEPS.length - 1) setTimeout(wandOff, 900);
}
function tutEnd() {
  if (!TUT.on) return;
  TUT.on = false; tutClear(); wandOff();
  $('#scr-game').classList.remove('tut'); $('#scr-game .crowdbox').style.height = '';
  $('#say').classList.remove('on');
  if (scr === 'game') layoutGame(true);
}
function tutFit() {
  const box = $('#scr-game .crowdbox'), el = $('#say'), t = $('#sayT'), keep = t.innerHTML;
  box.style.height = '';
  let h = 0;
  for (const k of ['s1', 's1bad', 's2', 's3', 's4', 's5', 's6', 's7']) { t.innerHTML = '<small class="tstep">1 / 7</small>' + TUTT[k]; h = Math.max(h, el.offsetHeight); }
  t.innerHTML = keep;
  box.style.height = Math.ceil(h + 4 + 6 + $('#tutSkip').offsetHeight + 4) + 'px';
}
function tutDone() { if (!LD.meta.settings().tutDone) LD.meta.set('tutDone', true); }
function startTutorial() {
  if (canSnd()) AU.unlock();
  tutEnd();
  show('game');
  const P = LD.meta.level('easy-1');
  setupGame(new LD.Game(P), true);
  TUT.on = true; TUT.gm = game; TUT.step = 0; TUT.first = -1;
  $('#scr-game').classList.add('tut');
  tutFit();
  layoutGame(true);
  const gm = game;
  gm.on('*', (ev, d) => {
    if (!TUT.on || game !== gm) return;
    if (ev === 'mistake' && (TUT.step === 0 || TUT.step === 4)) { tutSay(TUTT.s1bad); return; }
    if (ev === 'win') { tutDone(); setTimeout(tutEnd, 300); return; }
    if (ev === 'place' && TUT.first < 0) TUT.first = d.i;
    const st = TUT_STEPS[TUT.step];
    if (st && st.done(ev, d)) { const nx = TUT.step + 1; TUT.step = -1; setTimeout(() => tutGo(nx), ev === 'place' || ev === 'line' ? 700 : 300); }
  });
  tutGo(0);
}
// How to play (title, menu, #demo, retry, restart and encore of a demo game) all start the guided tutorial
const startDemo = startTutorial;
// leaving the board ends the tutorial
const showOrig = show;
const closeCards = () => { $('#tutIntro').classList.remove('on'); $('#pickLv').classList.remove('on'); };
show = function (name, opt) { if (name !== 'title') closeCards(); if (name !== 'game' && TUT.on) tutEnd(); showOrig(name, opt); };
const startGigOrig = startGig;
startGig = function (id) {
  closeCards(); tutEnd();
  // a gig in a pack that is still locked is a challenge: it never becomes the gig Play continues, unless it is won
  const prev = LD.meta.currentId();
  startGigOrig(id);
  const pk = id && LD.meta.packOf(id);
  if (pk && !LD.meta.packOpen(pk)) LD.meta.setCurrent(prev);
};
$('#tutSkip').addEventListener('click', () => { tutDone(); tutEnd(); pickLevel(); });
window.addEventListener('resize', () => { if (TUT.on) { tutFit(); layoutGame(false); setTimeout(tutPoint, 50); } });

// the rules card: the first time someone opens the game, and before the tutorial
function tutIntro() {
  const box = $('#tutIntro');
  $('#tutRules').innerHTML = TUTT.rules.map((r) => '<li><i>' + r[0] + '</i>' + r[1] + '</li>').join('');
  box.classList.add('on');
}
$('#tutIntro').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tut]'); if (!b) return;
  $('#tutIntro').classList.remove('on');
  if (b.dataset.tut === 'go') startTutorial(); else { tutDone(); pickLevel(); }
});
const ACT_PLAY = ACT.play;
ACT.play = function () { if (!LD.meta.settings().tutDone) tutIntro(); else ACT_PLAY(); };
ACT.demo = function () { $('#sheet').classList.remove('on'); tutIntro(); };

// ---------------------------------------------------------------------------------------------------------- 更快玩到难关 (harder sooner)
// the level picker: after the tutorial, after skipping it, and from Settings
const LEVELS = [
  { open: [], start: null },                                                  // 新手: start at Easy
  { open: ['normal', 'chill', 'hard'], start: 'normal' },                      // 玩过类似的: Normal, Chill XL and Hard open
  { open: ['normal', 'chill', 'hard', 'expert', 'terror'], start: 'hard' },    // 逻辑高手: up to Expert and Terror
];
const packName = (id) => (LD.meta.packs().find((p) => p.id === id) || {}).name || id;
const firstOpen = (pk) => { const p = LD.meta.packs().find((x) => x.id === pk); const L = p.levels.find((x) => x.unlocked && !x.solved); return (L || p.levels[0]).id; };
function pickLevel() { closeCards(); $('#pickLv').classList.add('on'); }
$('#pickLv').addEventListener('click', (e) => {
  const b = e.target.closest('[data-lv]'); if (!b) return;
  const lv = LEVELS[+b.dataset.lv];
  if (lv.open.length) LD.meta.openPacks(lv.open);
  const id = lv.start ? firstOpen(lv.start) : LD.meta.currentId();
  LD.meta.setCurrent(id); startGig(id);
  if (lv.open.length) setTimeout(() => say('已开放：' + lv.open.map(packName).join('、') + ' ⚡', 3600), 500);   // opened: ...
});
window.addEventListener('ld-pick', pickLevel);
const ACT_NEXT = ACT.next;
ACT.next = function () { if (WIN.st && WIN.st.demo) pickLevel(); else ACT_NEXT(); };
// challenge to unlock: play the first gig of a locked pack; winning it opens the whole pack
window.addEventListener('ld-try', (e) => {
  const id = e.detail, pk = LD.meta.packOf(id);
  startGig(id);
  setTimeout(() => say('挑战关！赢下这一场，「' + packName(pk) + '」就开放 ⚡', 3800), 500);   // challenge! win this and the pack opens
});

// ---------------------------------------------------------------------------------------------------------- hints that say why
// The engine's hint also has a last-resort reveal with no deduction behind it, so "only one spot left" is said only when it is true.
// The hint event fires before the move, so the open cells are still the ones the player sees.
function hintWhy(d) {
  const where = d.unitKind === 'col' ? '这一列' : d.unitKind === 'region' ? '这个颜色区域' : '这一行';   // this column / this colour zone / this row
  if (d.kind === 'place') {
    const open = game._open(), k = d.unit.filter((i) => open[i]).length;
    return k === 1 ? where + '只剩这一格能放表演者 ♪' : '这里一定有一位表演者 ♪';                     // only this square is left in ... / a performer must be here
  }
  return '放在这里的话，发光的' + where.replace('这', '那') + '就没位置了，所以打叉！';                 // a performer here would leave the lit ... no room, so cross it
}
const onHintOrig = onHint;
onHint = function (d) { onHintOrig(d); if (!TUT.on && game) say(hintWhy(d), 3800); };

// ---------------------------------------------------------------------------------------------------------- vibration (Android; iPhones have none for web pages)
function buzz(p) { try { if (navigator.vibrate && LD.meta.settings().vibrate !== false && canSnd()) navigator.vibrate(p); } catch (e) { /* not allowed */ } }
const setupGameOrig = setupGame;
setupGame = function (gm, demoFlag) {
  setupGameOrig(gm, demoFlag);
  gm.on('place', () => buzz(14)); gm.on('mistake', () => buzz([40, 50, 40])); gm.on('win', () => buzz([20, 40, 20, 40, 80]));
};

// ---------------------------------------------------------------------------------------------------------- the clock stops while the app is in the background
let hidAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hidAt = performance.now(); LD.loop.stop(); return; }
  if (!hidAt) return;
  const away = performance.now() - hidAt; hidAt = 0;
  if (game && game.t0 !== null && !game.over && !game.won) { game.t0 += away; if (scr === 'game') LD.loop.start(); }
});

// test hook (tools/cn_check.mjs)
window.LDCN = { tut: () => (TUT.on ? TUT.step : -1), screen: () => scr, zoneColours, labD, picker: () => $('#pickLv').classList.contains('on'), hintWhy };
