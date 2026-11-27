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
  s1: '点一下发光的格子，打一个叉。叉的意思是：这里不会有表演者。',       // tap the glowing square to put an X: no performer here
  s2: '按住并在这一行上滑动，可以一口气打好几个叉。',                   // hold and slide along this row to paint several X's
  s3: '这个颜色区域只有一个格子，表演者一定在这里！快速点两下放置。',     // this zone has one square, so the performer must be here: double-tap
  s3bad: '放错会失去一个麦克风 🎤！再找找只有一个格子的颜色区域。',      // a wrong one costs a mic! look for the one-square zone
  s4: '表演者会排除同一行、同一列、同一区域和周围八格。点这个箭头，整行打叉！', // a performer rules out its row, column, zone and the 8 around it: tap the arrow
  s5: '卡住了？点「问 Jasmin」，我来帮你！',                          // stuck? tap Ask Jasmin and I help
  s6: '现在靠你自己完成这一关！也可以按住格子不放来放置表演者。',         // now finish it yourself! press and hold also places a performer
};
LD.loop.LAYER_NAMES = ['底鼓', '踩镲', '军鼓', '贝斯', '和声', '沙锤', '旋律', '拍手', '切片'];  // Kick Hats Snare Bass Pad Shaker Hook Claps Chops

const TUT = { on: false, step: 0, gm: null, timer: 0, ring: 0, row: 4 };
const TUT_STEPS = [
  { txt: 's1', cell: (g) => g.idx(0, 0), done: (ev, d) => ev === 'mark' && d.on && (d.source === 'tap' || d.source === 'drag') },
  { txt: 's2', row: 3, cells: (g) => [0, 1, 2, 3].map((c) => g.idx(3, c)), done: (ev, d) => ev === 'stroke' && d.count >= 2 },
  { txt: 's3', cell: (g) => g.idx(4, 2), done: (ev) => ev === 'place' },
  { txt: 's4', arrow: () => ['row', TUT.row], done: (ev) => ev === 'line' },  // the row of the performer just placed
  { txt: 's5', btn: '#hintBtn', done: (ev) => ev === 'hint' },
  { txt: 's6', done: () => false },
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
  for (const k of ['s1', 's2', 's3', 's3bad', 's4', 's5', 's6']) { t.innerHTML = '<small class="tstep">1 / 6</small>' + TUTT[k]; h = Math.max(h, el.offsetHeight); }
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
  TUT.on = true; TUT.gm = game; TUT.step = 0;
  $('#scr-game').classList.add('tut');
  tutFit();
  layoutGame(true);
  const gm = game;
  gm.on('*', (ev, d) => {
    if (!TUT.on || game !== gm) return;
    if (ev === 'mistake' && TUT.step === 2) { tutSay(TUTT.s3bad); return; }
    if (ev === 'win') { tutDone(); setTimeout(tutEnd, 300); return; }
    if (ev === 'place') TUT.row = d.r;
    const st = TUT_STEPS[TUT.step];
    if (st && st.done(ev, d)) { const nx = TUT.step + 1; TUT.step = -1; setTimeout(() => tutGo(nx), ev === 'place' || ev === 'line' ? 700 : 300); }
  });
  tutGo(0);
}
// How to play (title, menu, #demo, retry, restart and encore of a demo game) all start the guided tutorial
const startDemo = startTutorial;
// leaving the board ends the tutorial
const showOrig = show;
show = function (name, opt) { if (name !== 'title') $('#tutIntro').classList.remove('on'); if (name !== 'game' && TUT.on) tutEnd(); showOrig(name, opt); };
const startGigOrig = startGig;
startGig = function (id) { $('#tutIntro').classList.remove('on'); tutEnd(); startGigOrig(id); };
$('#tutSkip').addEventListener('click', () => { tutDone(); tutEnd(); startGig(); });
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
  if (b.dataset.tut === 'go') startTutorial(); else { tutDone(); }
});
const ACT_PLAY = ACT.play;
ACT.play = function () { if (!LD.meta.settings().tutDone) tutIntro(); else ACT_PLAY(); };
ACT.demo = function () { $('#sheet').classList.remove('on'); tutIntro(); };
// test hook (tools/cn_check.mjs)
window.LDCN = { tut: () => (TUT.on ? TUT.step : -1), screen: () => scr, zoneColours, labD };
