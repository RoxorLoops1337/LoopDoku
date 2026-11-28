// ---------------------------------------------------------------------------------------------------------- 排行榜 (leaderboard, Chinese edition)
// Inserted by tools/build_cn.mjs after cn_tutorial.js. Talks to /api/loopdoku_board on the page's own site (the Games site
// runs it). Anywhere else (GitHub Pages, a host in China) the call fails once and the board simply stays hidden.
// The name is chosen once and kept on this phone with a secret token (its own localStorage key: Reset progress keeps it).
// Wins are sent after each real gig; the server works out the points. Wins made offline wait in a queue and go later.
const LB = { api: '/api/loopdoku_board', state: 'unknown', tab: 'd', data: null, last: null, busy: false };
const LBT = {
  title: '排行榜',                                                       // Leaderboard
  tabs: { d: '今日', w: '本周', m: '本月', all: '总榜' },                  // today, this week, this month, all time
  pts: (n) => n + ' 分',                                                // n points
  you: '你',                                                           // you
  empty: '还没有人上榜，快来当第一名！',                                  // nobody yet: be the first!
  join: '🏆 取个名字，加入排行榜',                                        // pick a name and join the leaderboard
  how: '每解开一关就能得分：难度越高、星星越多、速度越快，分数越高。每道题在每个时段只算一次最好成绩。', // how points work
  nameT: '你的名字',                                                    // your name
  nameP: '名字只能取一次，之后会一直保留在这部手机上。2 到 12 个字。',       // chosen once, kept on this phone, 2 to 12 characters
  ok: '确定', cancel: '以后再说',                                         // OK, later
  taken: '这个名字已经有人用了，换一个吧。',                                // this name is taken
  bad: '名字要 2 到 12 个字，只能用文字、数字、空格和 _ - .',               // 2 to 12 characters, letters, digits, space, _ - .
  net: '现在连不上排行榜，请稍后再试。',                                   // cannot reach the leaderboard now
  welcome: (n) => '欢迎上榜，' + n + '！',                                 // welcome to the board, name!
  win: (p, r) => '🏆 排行榜 +' + p + ' 分' + (r ? ' · 今日第 ' + r + ' 名' : ''), // leaderboard +p points · today rank r
  winRepeat: '🏆 这一关的最好成绩已经计入排行榜',                           // this puzzle's best result already counts
  winQueued: '🏆 已保存，联网后自动上传到排行榜',                           // saved, uploads when online
  notRanked: '未进前 100',                                              // not in the top 100
};
function lbTexts() {
  $('#lbBox .rtxt').textContent = LBT.title; $('#lbNameBox .rtxt').textContent = LBT.nameT;
  $('#lbHow').textContent = LBT.how; $('#lbJoin').textContent = LBT.join; $('#lbNameP').textContent = LBT.nameP;
  $('#lbNameBox [data-lbok]').textContent = LBT.ok; $('#lbNameBox [data-lbno]').textContent = LBT.cancel;
  $('#lbBtn').textContent = '🏆 ' + LBT.title;
}
const ID_KEY = 'loopdoku_cn_id', Q_KEY = 'loopdoku_cn_lbq';
const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } };
const me = () => lsGet(ID_KEY, null);
function newToken() { const a = new Uint8Array(16); crypto.getRandomValues(a); return [...a].map((b) => b.toString(16).padStart(2, '0')).join(''); }
const escH = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// one call. No board on this site (a missing route answers with a page, not JSON), or no network: the board turns off for this
// visit, so there is no stream of failed calls. A server hiccup (5xx) on a POST only keeps the win queued.
async function lbCall(method, body, query) {
  if (LB.state === 'off') return null;
  let r;
  try { r = await fetch(LB.api + (query || ''), method === 'GET' ? { cache: 'no-store' } : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); }
  catch (e) { LB.state = 'off'; lbShow(); return null; }
  if (r.status >= 500) { if (method === 'GET') { LB.state = 'off'; lbShow(); } return null; }
  let j; try { j = await r.json(); } catch (e) { LB.state = 'off'; lbShow(); return null; }
  LB.state = 'on'; lbShow();
  return { status: r.status, body: j };
}
function lbShow() { const on = LB.state === 'on'; $('#lbBtn').style.display = on ? '' : 'none'; }

async function lbRefresh() {
  const m = me();
  const r = await lbCall('GET', null, m ? '?name=' + encodeURIComponent(m.name) : '');
  if (r && r.status === 200) LB.data = r.body;
  return LB.data;
}

// ---- the board
function lbRender() {
  const d = LB.data, m = me(), tab = LB.tab;
  $('#lbTabs').innerHTML = Object.entries(LBT.tabs).map(([k, t]) => '<button type="button" class="lbtab' + (k === tab ? ' on' : '') + '" data-tab="' + k + '">' + t + '</button>').join('');
  const list = d ? d[tab] || [] : [];
  const medal = (r) => (r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : r);
  const mine = (e) => m && e.name.normalize('NFKC').toLowerCase() === m.name.normalize('NFKC').toLowerCase();
  let h = list.length ? list.map((e) => '<li class="' + (mine(e) ? 'me' : '') + '"><b>' + medal(e.rank) + '</b><span>' + escH(e.name) + (mine(e) ? ' <i>' + LBT.you + '</i>' : '') + '</span><em>' + LBT.pts(e.pts) + '</em></li>').join('')
    : '<li class="none">' + LBT.empty + '</li>';
  if (m && d && d.me && d.me[tab] && !list.some(mine)) {
    const x = d.me[tab];
    h += '<li class="gap">⋯</li><li class="me"><b>' + (x.rank || '—') + '</b><span>' + escH(m.name) + ' <i>' + LBT.you + '</i>' + (x.rank ? '' : ' <small>' + LBT.notRanked + '</small>') + '</span><em>' + LBT.pts(x.pts) + '</em></li>';
  }
  $('#lbList').innerHTML = h;
  $('#lbJoin').style.display = m ? 'none' : '';
}
async function lbOpen() {
  closeCards(); $('#lbBox').classList.add('on'); lbRender();
  await lbFlush(); await lbRefresh(); lbRender();
}
$('#lbBox').addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab]'); if (t) { LB.tab = t.dataset.tab; lbRender(); S.ui(); return; }
  if (e.target.closest('#lbJoin')) { lbName(() => lbOpen()); return; }
  if (e.target.closest('[data-lbx]') || e.target.id === 'lbBox') $('#lbBox').classList.remove('on');
});
$('#lbBtn').addEventListener('click', () => { if (canSnd()) AU.unlock(); S.ui(); lbOpen(); });

// ---- choosing the name (once)
let nameThen = null;
function lbName(then) {
  closeCards(); nameThen = then || null;
  $('#lbErr').textContent = ''; $('#lbInput').value = '';
  $('#lbNameBox').classList.add('on');
  setTimeout(() => { try { $('#lbInput').focus(); } catch (e) { /* */ } }, 50);
}
async function lbClaim() {
  if (LB.busy) return;
  const raw = $('#lbInput').value.normalize('NFKC').replace(/\s+/g, ' ').trim(), len = [...raw].length;
  if (len < 2 || len > 12 || !/^[\p{L}\p{N} _.\-]+$/u.test(raw)) { $('#lbErr').textContent = LBT.bad; return; }
  LB.busy = true;
  const token = newToken(), r = await lbCall('POST', { action: 'claim', name: raw, token });
  LB.busy = false;
  if (!r) { $('#lbErr').textContent = LBT.net; return; }
  if (r.status === 409) { $('#lbErr').textContent = LBT.taken; return; }
  if (r.status !== 200) { $('#lbErr').textContent = LBT.bad; return; }
  lsSet(ID_KEY, { name: r.body.name, token });
  $('#lbNameBox').classList.remove('on');
  LD.ui.toast(LBT.welcome(r.body.name)); S.sparkle();
  // the gig just won counts too
  if (LB.last) { lbQueue(LB.last); LB.last = null; await lbFlush(); }
  const go = nameThen; nameThen = null; if (go) go();
}
$('#lbNameBox').addEventListener('click', (e) => {
  if (e.target.closest('[data-lbok]')) lbClaim();
  else if (e.target.closest('[data-lbno]') || e.target.id === 'lbNameBox') { $('#lbNameBox').classList.remove('on'); nameThen = null; }
});
$('#lbInput').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); lbClaim(); } e.stopPropagation(); });

// ---- sending wins: queue first, then flush in order (the server only takes one post per player every 3 s)
function lbQueue(w) { const q = lsGet(Q_KEY, []); q.push(w); while (q.length > 40) q.shift(); lsSet(Q_KEY, q); }
let flushing = false;
async function lbFlush() {
  const m = me(); if (!m || flushing || LB.state === 'off') return null;
  flushing = true; let res = null;
  try {
    let q = lsGet(Q_KEY, []);
    while (q.length) {
      const w = q[0], r = await lbCall('POST', Object.assign({ action: 'score', name: m.name, token: m.token }, w));
      if (!r) break;                                                          // offline: keep the queue for later
      if (r.status === 429) { await new Promise((ok) => setTimeout(ok, 3200)); continue; }
      if (r.status === 404) { const c = await lbCall('POST', { action: 'claim', name: m.name, token: m.token }); if (c && c.status === 200) continue; }  // the server lost the name: claim it again
      q.shift(); lsSet(Q_KEY, q);
      if (r.status === 200) { res = r.body; LB.data = r.body; }
      q = lsGet(Q_KEY, []);
    }
  } finally { flushing = false; }
  return res;
}
// every real win (not the tutorial) goes to the queue once a name exists; the gig just won is kept for a new name
const setupGameLB = setupGame;
setupGame = function (gm, demoFlag) {
  setupGameLB(gm, demoFlag);
  gm.on('win', (e) => {
    if (demoFlag || game !== gm) return;
    const w = { id: gm.p.id, ms: Math.round(e.ms), mistakes: e.mistakes, hints: e.hints };
    LB.last = w; LB.result = null;
    if (me()) { lbQueue(w); LB.last = null; lbFlush().then((r) => { LB.result = r; lbWinLine(); }); }
  });
};
// one line on the win screen: the points it earned, or the button to join
function lbWinLine() {
  const box = $('#wLB'); if (!box) return;
  if (!WIN.st || WIN.st.demo) { box.innerHTML = ''; return; }
  if (!me()) { box.innerHTML = LB.state === 'on' ? '<button type="button" class="lbjoin" data-lbjoin="1">' + LBT.join + '</button>' : ''; return; }
  const r = LB.result;
  box.innerHTML = '<div class="lbline">' + (r ? (r.gained > 0 ? LBT.win(r.gained, r.me && r.me.d && r.me.d.rank) : LBT.winRepeat) : LBT.winQueued) + '</div>';
}
const enterWinLB = enterWin;
enterWin = function (st) { enterWinLB(st); lbWinLine(); };
document.addEventListener('click', (e) => { if (e.target.closest('[data-lbjoin]')) lbName(() => { LB.result = LB.data && LB.data.gained != null ? LB.data : null; lbWinLine(); }); });

lbTexts();
// on load: find out whether this site has the board, and send anything left in the queue
setTimeout(async () => { await lbRefresh(); await lbFlush(); }, 600);
const showLB = show;
show = function (name, opt) { $('#lbBox').classList.remove('on'); $('#lbNameBox').classList.remove('on'); showLB(name, opt); };
window.LDLB = { state: () => LB.state, me, queue: () => lsGet(Q_KEY, []), data: () => LB.data };
