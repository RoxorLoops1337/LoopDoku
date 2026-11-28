// Chinese edition: every change the build makes to idol.html (the Anime Idol Stage look) and loopdoku-meta.js.
// [english, chinese, count]: count = how many times the English must appear (the build fails otherwise), 0 = every
// occurrence (at least one). The English files are never edited; this table is what a native speaker reviews.
// Order matters: longer strings first where one contains another.

const CNF = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Micro Hei",system-ui,sans-serif';
const CNF_LOGO = '"Arial Rounded MT Bold","Arial Black",' + CNF;
export const FONT = CNF;

// ------------------------------------------------------------------------------------------------------------------
// idol.html
// ------------------------------------------------------------------------------------------------------------------
export const IDOL = [
  // page
  ['<html lang="en">', '<html lang="zh-CN" translate="no">', 1],  // browsers must not machine-translate it: buttons would change, the drawn text would not
  ['<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="google" content="notranslate">', 1],
  ['<title>LoopDoku</title>', '<title>LoopDoku 口技数独</title>\n<meta name="description" content="LoopDoku 口技数独：RoxorLoops 与 Jasmin 的逻辑谜题。每行、每列、每个颜色区域各放一位表演者，而且互不相邻。没有广告。">\n<meta name="format-detection" content="telephone=no">', 1],
  ['<link rel="preconnect" href="https://fonts.googleapis.com">\n', '', 1],
  ['<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n', '', 1],
  ['<link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;800;900&family=Mochiy+Pop+One&display=swap" rel="stylesheet">\n', '', 1],
  // fonts: phone system fonts (no web fonts reach China), and heavier, since the display font was a fat one at weight 400
  ["--ld-font:'M PLUS Rounded 1c',system-ui,sans-serif;--ld-font-display:'Mochiy Pop One','M PLUS Rounded 1c',sans-serif;", '--ld-font:' + CNF + ';--ld-font-display:' + CNF + ';', 1],
  ["--disp:'Mochiy Pop One','M PLUS Rounded 1c',system-ui,sans-serif;--ui:'M PLUS Rounded 1c',system-ui,sans-serif;", '--disp:' + CNF + ';--ui:' + CNF + ';', 1],
  [/font:400 ([\d.]+px\/[\d.]+) var\(--disp\)/g, 'font:900 $1 var(--disp)', 15],
  [`const font = '400 ' + size + 'px "Mochiy Pop One","M PLUS Rounded 1c",sans-serif';`, `const font = '900 ' + size + 'px ${CNF}';`, 1],
  [`g.font = '400 ' + (hh * 0.62).toFixed(1) + 'px "Mochiy Pop One",sans-serif';`, `g.font = '900 ' + (hh * 0.62).toFixed(1) + 'px ${CNF}';`, 1],
  [`'px "M PLUS Rounded 1c",sans-serif'`, `'px ${CNF}'`, 2],
  [`const FONT = (f) => '400 ' + f + 'px "Mochiy Pop One","M PLUS Rounded 1c",sans-serif';`, `const FONT = (f) => '900 ' + f + 'px ${CNF_LOGO}';`, 1],
  [`g.font = '400 34px "Mochiy Pop One",sans-serif';`, `g.font = '900 34px ${CNF}';`, 1],
  ['if (document.fonts && document.fonts.ready) document.fonts.ready.then(', 'if (false) document.fonts.ready.then(', 1],

  // zones are told apart by colour only (no darker seam along zone borders: it gave the answer away)
  ['    g.fillStyle = z.d; g.fillRect(x0 + (L ? 0 : bw), y0 + (U ? 0 : bw), c - (L ? 0 : bw) - (Rr ? 0 : bw), c - (U ? 0 : bw) - (Dn ? 0 : bw));\n', '    void z; void L; void Rr; void U; void Dn; void x0; void y0; void bw;\n', 1],

  // brighter, more separate candy colours, and per board an assignment where zones that touch never get look-alike colours
  ["  ['#ff9fcb', 'Sakura', 'heart'], ['#ffbd8a', 'Peach', 'star'], ['#ffe36b', 'Lemon', 'note'],\n  ['#bce77a', 'Lime', 'clover'], ['#90e6b0', 'Mint', 'drop'], ['#84dfec', 'Aqua', 'diamond'],\n  ['#97c3ff', 'Sky', 'ring'], ['#c3b4ff', 'Lilac', 'flower'], ['#df9ff6', 'Orchid', 'sparkle'], ['#f2dcc0', 'Cream', 'tri'],",
   "  ['#ff7eb6', 'Sakura', 'heart'], ['#ff9a3c', 'Peach', 'star'], ['#ffe03a', 'Lemon', 'note'],\n  ['#9fe04a', 'Lime', 'clover'], ['#2fc49a', 'Mint', 'drop'], ['#5fd4f5', 'Aqua', 'diamond'],\n  ['#4a7dff', 'Sky', 'ring'], ['#b45cff', 'Lilac', 'flower'], ['#ff5c5c', 'Cherry', 'sparkle'], ['#f3e1c4', 'Cream', 'tri'],", 1],
  // Chinese layer names need a few more pixels than the English caps to stay readable
  ['const pr = Math.max(5, Math.min(cw * 0.34, chh * 0.3)), lf = Math.max(6.5, Math.min(pr * 0.6, 9.5));', 'const pr = Math.max(5, Math.min(cw * 0.3, chh * 0.26)), lf = Math.max(8.5, Math.min(pr * 0.75, 11));', 1],
  ['const hh = clamp(h * 0.13, 12, 18);', 'const hh = clamp(h * 0.14, 15, 19);', 1],
  ['  const gm = game, n = gm.n, S = BD.S; BD.n = n; BD.game = gm;\n', '  const gm = game, n = gm.n, S = BD.S; BD.n = n; BD.game = gm; BD.zc = zoneColours(gm);\n', 1],
  ['for (let i = 0; i < gm.N; i++) g.drawImage(BD.tiles[reg[i] % ZONES.length],', 'for (let i = 0; i < gm.N; i++) g.drawImage(BD.tiles[BD.zc[reg[i]]],', 1],
  ['const sc = dipScale(da), k = gm.region[i] % ZONES.length;', 'const sc = dipScale(da), k = BD.zc[gm.region[i]];', 1],
  ['function buildBoard() {\n', `// zone k -> palette index: every zone gets its own colour, and zones that touch (sides or corners) get colours as far apart
// as possible (CIELAB distance), so the board reads by colour alone. Deterministic per board.
const LAB = ZONES.map((z) => { const f = (v) => { v /= 255; return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92; }; const [r, g, b] = hexRgb(z.c).map(f);
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.9505, y = r * 0.2126 + g * 0.7152 + b * 0.0722, zz = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.089;
  const h = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); return [116 * h(y) - 16, 500 * (h(x) - h(y)), 200 * (h(y) - h(zz))]; });
const labD = (a, b) => Math.hypot(LAB[a][0] - LAB[b][0], LAB[a][1] - LAB[b][1], LAB[a][2] - LAB[b][2]);
function zoneColours(gm) {
  const n = gm.n, K = Math.max(...gm.region) + 1, adj = Array.from({ length: K }, () => new Set());
  for (let i = 0; i < gm.N; i++) { const r = (i / n) | 0, c = i % n; for (const [dr, dc] of [[0, 1], [1, -1], [1, 0], [1, 1]]) { const rr = r + dr, cc = c + dc; if (rr < n && cc >= 0 && cc < n) { const a = gm.region[i], b = gm.region[rr * n + cc]; if (a !== b) { adj[a].add(b); adj[b].add(a); } } } }
  const P = ZONES.length; let seedZ = 7 + K * 31 + gm.region.reduce((s, v, i) => (s + v * (i + 1)) % 100003, 0); const R = () => (seedZ = (seedZ * 16807) % 2147483647) / 2147483647;
  let best = null, bestS = -1;
  for (let t = 0; t < 400; t++) {
    const pal = Array.from({ length: P }, (_, k) => k); for (let k = P - 1; k > 0; k--) { const j = (R() * (k + 1)) | 0; [pal[k], pal[j]] = [pal[j], pal[k]]; }
    const zc = pal.slice(0, K); let mn = 1e9, sum = 0;
    for (let a = 0; a < K; a++) for (const b of adj[a]) if (b > a) { const d = labD(zc[a], zc[b]); mn = Math.min(mn, d); sum += d; }
    const sc = mn * 1000 + sum; if (sc > bestS) { bestS = sc; best = zc; }
  }
  return best;
}
function buildBoard() {
`, 1],
  // title screen: no Looks shop (other pages) and no Support links (blocked in China)
  ['<div class="rtxt">a <i class="gx">RoxorLoops</i> &amp; <i class="px">Jasmin</i> puzzle', '<div class="rtxt"><i class="gx">RoxorLoops</i> 与 <i class="px">Jasmin</i> 的口技谜题', 1],
  ['&nbsp;pts</div>', '&nbsp;分</div>', 1],
  ['<svg class="ic"><use href="#i-play"/></svg>Play<span class="sub" id="playSub"></span>', '<svg class="ic"><use href="#i-play"/></svg>开始演出<span class="sub" id="playSub"></span>', 1],
  [`        <div class="trow">
          <button class="gem lav" data-act="looks"><svg class="ic"><use href="#i-sparkle"/></svg>Looks</button>
          <button class="gem lav" data-act="outfits"><svg class="ic"><use href="#i-shirt"/></svg>Outfits</button>
          <button class="gem lav" data-act="demo"><svg class="ic"><use href="#i-hint"/></svg>How to play</button>
        </div>
        <div class="trow mini">
          <button class="gem lav sm" data-act="settings"><svg class="ic"><use href="#i-gear"/></svg>Settings</button>
          <button class="gem lav sm" data-act="support"><svg class="ic"><use href="#i-heart"/></svg>Support us</button>
        </div>`, `        <div class="trow">
          <button class="gem lav" data-act="demo"><svg class="ic"><use href="#i-hint"/></svg>玩法教学</button>
          <button class="gem lav" data-act="outfits"><svg class="ic"><use href="#i-shirt"/></svg>服装</button>
          <button class="gem lav" data-act="settings"><svg class="ic"><use href="#i-gear"/></svg>设置</button>
        </div>`, 1],
  // game screen
  ['aria-label="Back to title"', 'aria-label="返回首页"', 1],
  ['aria-label="Sound on/off"', 'aria-label="声音开关"', 1],
  ['aria-label="Back"', 'aria-label="返回"', 1],
  ['>Easy 1<', '>简单 1<', 0],
  ['>Copenhagen<', '>哥本哈根<', 0],
  ['>Harbour Stage<', '>港口舞台<', 0],
  ['<svg class="ic"><use href="#i-undo"/></svg>Undo</button>', '<svg class="ic"><use href="#i-undo"/></svg>撤销</button>', 1],
  ['</canvas>Ask Jasmin</button>', '</canvas>问 Jasmin</button>', 1],
  ['<svg class="ic"><use href="#i-clear"/></svg>Clear X\'s</button>', '<svg class="ic"><use href="#i-clear"/></svg>清除标记</button>', 1],
  ['<svg class="ic"><use href="#i-pause"/></svg>Menu</button>', '<svg class="ic"><use href="#i-pause"/></svg>菜单</button>', 1],
  ['MIC DROP...', '麦克风掉了…', 1],
  ['<h2>Out of mics!</h2>', '<h2>麦克风用完了！</h2>', 1],
  ['<svg class="ic"><use href="#i-restart"/></svg>Try again</button>', '<svg class="ic"><use href="#i-restart"/></svg>再试一次</button>', 1],
  // win screen
  ['<div class="fc" id="wFC">FULL COMBO!</div>', '<div class="fc" id="wFC">全连击！</div>', 1],
  ['<small>Easy 1 cleared</small>Copenhagen · Harbour Stage', '<small>简单 1 通关</small>哥本哈根 · 港口舞台', 1],
  ['<span>Time</span>', '<span>用时</span>', 1],
  ['<span>Mistakes</span>', '<span>失误</span>', 1],
  ['<span>Points</span>', '<span>得分</span>', 1],
  ['>Total ★ 0 pts<', '>总分 ★ 0 分<', 1],
  ['<svg class="ic"><use href="#i-map"/></svg>Tour</button>', '<svg class="ic"><use href="#i-map"/></svg>巡演</button>', 1],
  ['<span id="nextT">One more!</span>', '<span id="nextT">再来一场！</span>', 1],
  ['>Encore! Play it again<', '>安可！再演一次<', 1],
  ['OUTFITS &amp; CREW', '服装与伙伴', 1],
  // pause menu: How to play takes the place of Looks
  ['<div class="rtxt" id="sheetT">MENU</div>', '<div class="rtxt" id="sheetT">菜单</div>', 1],
  ['Back on stage</button>', '回到舞台</button>', 1],
  ['<button class="gem lav" data-act="looks"><svg class="ic"><use href="#i-sparkle"/></svg>Looks</button>', '<button class="gem lav" data-act="demo"><svg class="ic"><use href="#i-hint"/></svg>玩法教学</button>', 1],
  ['<svg class="ic"><use href="#i-gear"/></svg>Settings</button>', '<svg class="ic"><use href="#i-gear"/></svg>设置</button>', 1],
  ['Restart gig</button>', '重新开始</button>', 1],
  ['<svg class="ic"><use href="#i-back"/></svg>Title</button>', '<svg class="ic"><use href="#i-back"/></svg>首页</button>', 1],
  ['World Tour', '世界巡演', 0],
  ['Daily Jam', '每日挑战', 0],
  // in-game calls (canvas labels and the caption bubble)
  ["say('Clean stage! ✨', 1400)", "say('舞台清空！✨', 1400)", 1],
  ["labelSpr(e.count + ' CHAIN!', 17,", "labelSpr(e.count + ' 连打！', 17,", 1],
  ["labelSpr('SWEPT!', 16,", "labelSpr('擦掉啦！', 16,", 1],
  ["(e.kind === 'row' ? 'ROW MUTED!' : 'COLUMN MUTED!') : 'UNMUTED!'", "(e.kind === 'row' ? '整行打叉！' : '整列打叉！') : '已擦除！'", 1],
  ["labelSpr('NICE!', 22,", "labelSpr('好样的！', 22,", 1],
  ["labelSpr(combo > 1 ? 'PERFECT!' : 'GREAT!', 22,", "labelSpr(combo > 1 ? '完美！' : '太棒了！', 22,", 1],
  ["labelSpr('COMBO ×' + combo, 14,", "labelSpr('连击 ×' + combo, 14,", 1],
  ["labelSpr('MISS…', 21,", "labelSpr('失误…', 21,", 1],
  ["labelSpr('+' + LD.loop.LAYER_NAMES[k].toUpperCase(), 15,", "labelSpr('+' + LD.loop.LAYER_NAMES[k], 15,", 1],
  ["labelSpr('Already muted!', 14,", "labelSpr('已经排除啦！', 14,", 1],
  ["say(d.kind === 'place' ? 'Here! A performer fits ♪' : 'Psst… mute this one!', 1900);", "say(d.kind === 'place' ? '这里！可以放一位表演者 ♪' : '嘘…这一格打个叉！', 1900);", 1],
  ["labelSpr('ENCORE!', 40,", "labelSpr('安可！', 40,", 1],
  ["{ cheer: 'The crowd still loves you. Loop it again!' }", "{ cheer: '观众还是很爱你。再来一遍吧！' }", 1],
  ["g.fillText('LOOP STATION', x + w / 2, y + hh * 0.72);", "g.fillText('人声循环台', x + w / 2, y + hh * 0.72);", 1],
  ["g.fillText(LD.loop.LAYER_NAMES[k].toUpperCase(), cx, cy + pr + lf * 0.85);", "g.fillText(LD.loop.LAYER_NAMES[k], cx, cy + pr + lf * 0.85);", 1],
  ["g.fillText('LAYERS ' + layers + '/9',", "g.fillText('音轨 ' + layers + '/9',", 1],
  // gig ribbon
  ["isDemo ? 'How to play · ' + sz", "isDemo ? '玩法教学 · ' + sz", 1],
  ["isDemo ? 'Showcase gig' : P.city; $('#gigV').textContent = isDemo ? 'Demo stage' : P.venue;", "isDemo ? '排练室' : P.city; $('#gigV').textContent = isDemo ? 'Jasmin 带你练习' : P.venue;", 1],
  // win screen
  ["const tag = st.demo ? 'How to play'", "const tag = st.demo ? '玩法教学'", 1],
  ["'<small>' + tag + ' cleared · ' + P.n + '×' + P.n + '</small>' + (st.demo ? 'Showcase gig' : P.city + ' · ' + P.venue);", "'<small>' + tag + ' 通关 · ' + P.n + '×' + P.n + '</small>' + (st.demo ? '排练室' : P.city + ' · ' + P.venue);", 1],
  ["(st.hints === 0 ? 'ALL PERFECT!' : 'FULL COMBO!') : 'LIVE CLEAR!'", "(st.hints === 0 ? '完美演出！' : '全连击！') : '演出成功！'", 1],
  ["chips.push(['Demo gig: no points', '']);", "chips.push(['教学关：不计分', '']);", 1],
  ["chips.push(r.firstClear ? ['First clear +' + r.base, 'pink'] : ['Replay', '']);", "chips.push(r.firstClear ? ['首次通关 +' + r.base, 'pink'] : ['重玩', '']);", 1],
  ["chips.push(['★ bonus +' + r.starBonus, 'gold']);", "chips.push(['★ 奖励 +' + r.starBonus, 'gold']);", 1],
  ["['每日挑战 ×2', 'gold']", "['每日挑战 ×2', 'gold']", 1],
  ["chips.push(['New best time!', 'pink']);", "chips.push(['新纪录！', 'pink']);", 1],
  ["$('#wTot').textContent = 'Total ★ ' + (total - pts) + ' pts';", "$('#wTot').textContent = '总分 ★ ' + (total - pts) + ' 分';", 1],
  ["(r.streak >= 2 ? 'One more!' : 'Next gig') : (st.demo ? 'Play now' : '世界巡演')", "(r.streak >= 2 ? '再来一场！' : '下一场') : (st.demo ? '开始演出' : '世界巡演')", 1],
  ["$('#wTot').textContent = 'Total ★ ' + (total - pts + v) + ' pts';", "$('#wTot').textContent = '总分 ★ ' + (total - pts + v) + ' 分';", 1],
  ["if (r && r.affordable && r.affordable.length && scr === 'win') LD.ui.toast('New look affordable: ' + r.affordable[0].name);", '', 1],
  ["const txt = r.packUnlocked ? 'NEW STAGE OPEN!' : r.streak >= 3 ? r.streak + ' IN A ROW!' : 'DAILY SET!';", "const txt = r.packUnlocked ? '新舞台开放！' : r.streak >= 3 ? r.streak + ' 连胜！' : '每日三连！';", 1],
  ["SPR.delete('lbl' + 'ENCORE!' + 52 + '#ffe680' + '#ff4f9a');", "SPR.delete('lbl' + '安可！' + 52 + '#ffe680' + '#ff4f9a');", 1],
  ["const L = labelSpr('ENCORE!', 52, '#ffe680', '#ff4f9a')", "const L = labelSpr('安可！', 52, '#ffe680', '#ff4f9a')", 1],
  // outfits
  ["sub: 'Smiley Tee · beatbox'", "sub: '笑脸T恤 · 口技'", 1],
  ["sub: 'Pink Pleats · vocals'", "sub: '粉色百褶裙 · 演唱'", 1],
  ["name: 'Monster Roxor', sub: 'Monster Onesie'", "name: '怪兽 Roxor', sub: '怪兽连体衣'", 1],
  ["name: 'Unicorn Jasmin', sub: 'Unicorn Onesie'", "name: '独角兽 Jasmin', sub: '独角兽连体衣'", 1],
  ["name: 'Sparkle Jackets', sub: 'Unlock: Tour Finale'", "name: '闪亮夹克', sub: '解锁：巡演终场'", 1],
  ["sub: 'Crew · unlock in Berlin'", "sub: '伙伴 · 柏林解锁'", 1],
  ["sub: 'Crew · unlock in Paris'", "sub: '伙伴 · 巴黎解锁'", 1],
  ["sub: 'Crew · unlock in Athens'", "sub: '伙伴 · 雅典解锁'", 1],
  ['<span class="eq">ON STAGE</span>', '<span class="eq">登台中</span>', 1],
  // arrows
  ['aria-label="Cross out row \' + (i + 1) + \'"', 'aria-label="第 \' + (i + 1) + \' 行整行打叉"', 1],
  ['aria-label="Cross out column \' + (i + 1) + \'"', 'aria-label="第 \' + (i + 1) + \' 列整列打叉"', 1],
  // no Looks shop or Support screen in this edition
  ['  looks() { $(\'#sheet\').classList.remove(\'on\'); LD.ui.skins(); },\n', '', 1],
  ['  support() { LD.ui.support(); },\n', '', 1],
  ["say('每日挑战! Double points today ♪', 2200);", "say('每日挑战！今天双倍积分 ♪', 2200);", 1],
  ["$('#sheetT').textContent = 'MENU';", "$('#sheetT').textContent = '菜单';", 1],
  // How to play is the guided tutorial (added below), not the English autoplay demo
  ['function startDemo() {', 'function startDemoAuto() {', 1],
  // fix from the idol page: the fanfare for a streak, a new stage or the daily set was queued before the timer list was
  // cleared (so it never played, and threw on the first win of a visit)
  ['  if (r && (r.streak >= 3 || r.packUnlocked || (r.goal && r.goal.hit))) WIN.timers.push(setTimeout(() => flourish(r), 1500));\n  WIN.timers && WIN.timers.forEach(clearTimeout);\n  WIN.timers = [];\n',
    '  WIN.timers && WIN.timers.forEach(clearTimeout);\n  WIN.timers = [];\n  if (r && (r.streak >= 3 || r.packUnlocked || (r.goal && r.goal.hit))) WIN.timers.push(setTimeout(() => flourish(r), 1500));\n', 1],
];

// ------------------------------------------------------------------------------------------------------------------
// loopdoku-meta.js
// ------------------------------------------------------------------------------------------------------------------
export const META = [
  // own save, carried over from the first Chinese edition (loopdoku_cn_v1) when there is one
  ["const KEY = 'loopdoku_save_v1';", "const KEY = 'loopdoku_cn_v2';", 1],
  ["  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(fresh(), JSON.parse(raw)); } catch (_) { /* no storage: play without saving */ }\n",
    `  try {
    const raw = localStorage.getItem(KEY);
    if (raw) S = Object.assign(fresh(), JSON.parse(raw));
    else {
      const o = JSON.parse(localStorage.getItem('loopdoku_cn_v1') || 'null');
      if (o) {
        S.points = S.earned = o.points || 0;
        for (const k in o.solved || {}) S.solved[k] = { stars: o.solved[k].stars || 1, bestMs: o.solved[k].ms || 0 };
        S.wins = Object.keys(S.solved).length;
        S.settings = { sound: o.sound !== false, music: o.music !== false, assist: false, tutDone: !!o.tut };
        localStorage.setItem(KEY, JSON.stringify(S));
      }
    }
  } catch (_) { /* no storage: play without saving */ }
`, 1],
  // one look only (the others are separate pages that are not part of this edition)
  [/const SKINS = \(LD\.SKINS = \[[\s\S]*?\]\);/, "const SKINS = (LD.SKINS = [\n    { id: 'idol', name: '偶像舞台', artist: 'Kira Cel', file: 'index.html', cost: 0 },\n  ]);", 1],
  ["current: null, skin: 'neon',", "current: null, skin: 'idol',", 1],
  ["    supportDue() {\n", "    supportDue() {\n      return false;\n", 1],
  ['    if (!nl) return \'<div class="ldx-look"><span></span><div>Every look unlocked. Legend!</div></div>\';', "    if (!nl) return '';", 1],
  // pack names, tour cities and gig types
  ['const PACKS = RAW.plan.map((p, pk) => ({ id: p.id, name: p.name,', "const PACK_ZH = { easy: '简单', normal: '普通', chill: '休闲大盘', hard: '困难', expert: '专家', terror: '恐怖', extreme: '极限', melt: '崩溃', nightmare: '噩梦' };\n  const PACKS = RAW.plan.map((p, pk) => ({ id: p.id, name: PACK_ZH[p.id] || p.name,", 1],
  [/const CITIES = \[[\s\S]*?\];/, "const CITIES = [\n    ['哥本哈根', 'DK'], ['奥胡斯', 'DK'], ['欧登塞', 'DK'], ['奥尔堡', 'DK'], ['埃斯比约', 'DK'], ['罗斯基勒', 'DK'], ['瓦埃勒', 'DK'],\n    ['柏林', 'DE'], ['汉堡', 'DE'], ['科隆', 'DE'], ['布鲁塞尔', 'BE'], ['安特卫普', 'BE'], ['根特', 'BE'], ['巴黎', 'FR'],\n    ['里昂', 'FR'], ['斯德哥尔摩', 'SE'], ['马尔默', 'SE'], ['哥德堡', 'SE'], ['阿姆斯特丹', 'NL'], ['鹿特丹', 'NL'], ['乌得勒支', 'NL'],\n    ['雅典', 'GR'], ['塞萨洛尼基', 'GR'], ['基多', 'EC'], ['瓜亚基尔', 'EC'],\n  ];", 1],
  [/const VENUES = \[[\s\S]*?\];/, "const VENUES = ['港口舞台', '坚信礼派对', '婚礼', '俱乐部之夜', '街头音乐节', '运河游船', '屋顶专场', '公司年会', '露天剧场', '校园工作坊', '城市广场',\n    '海滩派对', '夏日音乐节', '圣诞派对', '生日派对', '爵士咖啡馆', '图书馆夜场', '花园派对', '口技对战', '剧院午场'];", 1],
  ['Daily Jam', '每日挑战', 0],
  ['World Tour', '世界巡演', 0],
  // the duo's lines
  ["['A ' + lost + '-win streak! Win the next one to start a new one.', 'Even legends drop a mic. ' + lost + ' in a row was huge, go again!']",
    "[lost + ' 连胜！赢下一场，开始新的连胜。', '传奇也会掉麦克风。' + lost + ' 连胜已经很厉害了，再来！']", 1],
  ["['So close! Every gig you finish brings a new look nearer.', 'Shake it off and loop it again!', 'Roxor says: one more take. Jasmin agrees.']",
    "['就差一点！再试一次就能过。', '甩掉失误，再循环一遍！', 'Roxor 说：再来一条。Jasmin 也同意。']", 1],
  ["return 'New stage unlocked: ' + r.packUnlocked + '! Jasmin is already warming up.';", "return '新舞台解锁：' + r.packUnlocked + '！Jasmin 已经在热身了。';", 1],
  ["return 'You can unlock ' + r.affordable[0].name + ' now! Open Looks.';", "return '';", 1],
  ["return 'Only ' + r.nextLook.need + ' pts to ' + r.nextLook.name + '. One more gig?';", "return '';", 1],
  ["return 'Daily set complete: +' + r.goal.bonus + ' pts! Roxor drops the beat for you.';", "return '今日三连完成：+' + r.goal.bonus + ' 分！Roxor 为你来一段节奏。';", 1],
  ["pick([r.streak + ' in a row! The crowd is going wild!', 'Unstoppable! ' + r.streak + ' gigs straight!'])", "pick([r.streak + ' 连胜！观众疯狂了！', '势不可挡！连续 ' + r.streak + ' 场！'])", 1],
  ["pick(['Hat trick! Keep the loop going for a bigger bonus.', r.streak + ' in a row! Next win pays even more.'])", "pick(['帽子戏法！保持连胜，奖励更多。', r.streak + ' 连胜！下一场得分更高。'])", 1],
  ["return 'One more gig today for the daily set bonus!';", "return '今天再赢一场就能拿到三连奖励！';", 1],
  ["return r.tease.need + ' more ' + r.tease.from + ' gig' + (r.tease.need > 1 ? 's' : '') + ' to open ' + r.tease.pack + '!';", "return '再完成 ' + r.tease.need + ' 场「' + r.tease.from + '」就能解锁「' + r.tease.pack + '」！';", 1],
  ["return 'New personal best! You are getting fast.';", "return '个人新纪录！你越来越快了。';", 1],
  ["pick(['Encore! The crowd wants one more.', 'That was smooth. Ready for the next gig?', 'Roxor: \"Boots and cats!\" Jasmin: \"One more!\"', 'Loop it again? The next stage is calling.', 'Mic drop! Keep the tour rolling.'])",
    "pick(['安可！观众还想再听一首。', '太流畅了。准备好下一场了吗？', 'Roxor：「动次打次！」Jasmin：「再来一首！」', '再循环一遍？下一个舞台在召唤你。', '帅气收麦！巡演继续！'])", 1],
  // overlays
  ["<span class=\"ldui-pts\">★ ${S.points} pts</span>", "<span class=\"ldui-pts\">★ ${S.points} 分</span>", 1],
  ['aria-label="Close"', 'aria-label="关闭"', 1],
  ["`${esc(sizes)} boards. ${p.solved} of ${p.total} gigs played.` : `Locked. Clear ${p.need.count} ${esc(p.need.name)} gigs to open it.`",
    "`${esc(sizes)} 棋盘 · 已完成 ${p.solved} / ${p.total} 场` : `未解锁：先完成 ${p.need.count} 场「${esc(p.need.name)}」演出。`", 1],
  ["${d.done ? '✓ 每日挑战 played today' : '★ 每日挑战: double points today'}", "${d.done ? '✓ 今天的每日挑战已完成' : '★ 每日挑战：今天双倍积分'}", 1],
  ['aria-label="${esc(p.name)} gig ${L.num}, ${L.n} by ${L.n}${L.solved ? \', \' + L.stars + \' stars\' : \'\'}${L.unlocked ? \'\' : \', locked\'}"',
    'aria-label="${esc(p.name)} 第 ${L.num} 场，${L.n}×${L.n}${L.solved ? \'，\' + L.stars + \' 星\' : \'\'}${L.unlocked ? \'\' : \'，未解锁\'}"', 1],
  ["row('sound', 'Sound', 'Beatbox clicks and voices') + row('music', 'Loop Station music', 'The groove that builds as you play')", "row('sound', '音效', '口技音效和人声') + row('music', '循环台音乐', '随着你的演出一层层叠加的节奏')", 1],
  ["row('assist', 'Auto-cross helper', 'Cross out everything a performer rules out (makes gigs easier)')", "row('assist', '自动打叉助手', '自动排除表演者影响到的格子（更简单）')", 1],
  ['<button class="ldui-btn alt" type="button" data-support="1">💗 Support the duo</button><button class="ldui-btn alt" type="button" data-reset="1">Reset all progress</button>', '<button class="ldui-btn alt" type="button" data-reset="1">重置全部进度</button>', 1],
  ["const r = open('Settings', html, { onClose: o.onClose });", "const r = open('设置', html, { onClose: o.onClose });", 1],
  ["    r.querySelector('[data-support]').addEventListener('click', () => { click(); supportUI(); });\n", '', 1],
  ["confirmUI('Reset all progress? Points, stars and unlocked looks will be gone.', 'Reset everything', () => { meta.resetProgress(); toast('Progress reset');",
    "confirmUI('确定重置全部进度吗？积分和星星都会清空。', '全部重置', () => { meta.resetProgress(); toast('进度已重置');", 1],
  ["open('Are you sure?',", "open('确定吗？',", 1],
  ['data-n="1">Cancel</button>', 'data-n="1">取消</button>', 1],
  ["esc(rl.cheer || 'So close! Go again.')", "esc(rl.cheer || '就差一点！再来一次。')", 1],
  ["🔥 ' + r.streak + ' in a row' + (r.streakBonus ? ' +' + r.streakBonus : '')", "🔥 ' + r.streak + ' 连胜' + (r.streakBonus ? ' +' + r.streakBonus : '')", 1],
  ["📅 Day ' + r.dayStreak + ' +' + r.dayBonus", "📅 连续 ' + r.dayStreak + ' 天 +' + r.dayBonus", 1],
  ["'\">Daily set ' + goalDots(r.goal)", "'\">今日三连 ' + goalDots(r.goal)", 1],
  ["🔒 ' + esc(r.tease.pack) + ': ' + r.tease.need + ' to go</span>'", "🔒 ' + esc(r.tease.pack) + '：还差 ' + r.tease.need + ' 场</span>'", 1],
  ["📅 ' + t.dayStreak + '-day streak' + (t.atRisk && !t.playedToday ? ': win today to keep it!' : '')", "📅 连续 ' + t.dayStreak + ' 天' + (t.atRisk && !t.playedToday ? '：今天赢一场保持连续！' : '')", 1],
  ["'<span class=\"ldx-pill\">Daily set ' + goalDots(t.goal) + ' +' + t.goal.bonus + '</span>'", "'<span class=\"ldx-pill\">今日三连 ' + goalDots(t.goal) + ' +' + t.goal.bonus + '</span>'", 1],
  ["'<span class=\"ldx-pill hot\">🔥 ' + t.streak + ' in a row</span>'", "'<span class=\"ldx-pill hot\">🔥 ' + t.streak + ' 连胜</span>'", 1],
  ["🔒 ' + esc(ts.pack) + ': ' + ts.need + ' ' + esc(ts.from) + ' to go</span>'", "🔒 ' + esc(ts.pack) + '：还差 ' + ts.need + ' 场' + esc(ts.from) + '</span>'", 1],
  // the display font was a fat one at weight 400
  ['font:400 26px/1.05 var(--ld-font-display', 'font:900 24px/1.1 var(--ld-font-display', 1],
  ['font:400 28px/1.05 var(--ld-font-display', 'font:900 26px/1.1 var(--ld-font-display', 1],
  ['font:400 17px/1.2 var(--ld-font-display', 'font:900 16px/1.35 var(--ld-font-display', 1],
  ['.ldui-toast{position:fixed;left:50%;', '.ldui-toast{max-width:92vw;white-space:normal!important;text-align:center;position:fixed;left:50%;', 1],
  // ---- harder sooner: a level picker, challenge-to-unlock on every locked pack, more gigs open at once
  ['    openAhead: 3,', '    openAhead: 5,', 1],
  ['settings: { sound: true, music: true, assist: false }', 'settings: { sound: true, music: true, assist: false, vibrate: true }', 1],
  ['    if (need) { const other = PACKS.find((p) => p.id === need[0]); unlocked = !!other && other.levels.filter((L) => S.solved[L.id]).length >= need[1]; }\n',
    '    if (need) { const other = PACKS.find((p) => p.id === need[0]); unlocked = !!other && other.levels.filter((L) => S.solved[L.id]).length >= need[1]; }\n    if (S.open && S.open[pack.id]) unlocked = true;  // opened by the level picker or a won challenge\n', 1],
  ['    markSupportShown() { S.supportLast = S.wins; save(); },\n',
    "    markSupportShown() { S.supportLast = S.wins; save(); },\n    openPacks(ids) { S.open = Object.assign({}, S.open); for (const id of ids) S.open[id] = true; save(); },\n    packOpen(id) { const p = PACKS.find((x) => x.id === id); return !!p && packInfo(p).unlocked; },\n    packOf(id) { const L = BY_ID.get(id); return L ? L.pack : null; },\n", 1],
  ['      const packsBefore = meta.packs().filter((p) => p.unlocked).map((p) => p.id);\n',
    "      const packsBefore = meta.packs().filter((p) => p.unlocked).map((p) => p.id);\n      { const Lw = BY_ID.get(id); if (Lw && !packInfo(PACKS[Lw.pk]).unlocked) { S.open = Object.assign({}, S.open); S.open[Lw.pack] = true; } }  // a won challenge opens its pack\n", 1],
  ["      if (sel === 'easy' || p.unlocked) {\n",
    "      if (!p.unlocked) html += `<button class=\"ldui-btn gold\" type=\"button\" data-try=\"${p.levels[0].id}\" style=\"width:100%;margin-bottom:12px\">⚡ 挑战解锁：赢下第 1 场，「${esc(p.name)}」立即开放</button>`;\n      if (sel === 'easy' || p.unlocked) {\n", 1],
  ["      const dj = r.querySelector('[data-daily]');\n",
    "      const tr = r.querySelector('[data-try]');\n      if (tr) tr.addEventListener('click', () => { click(); const id = tr.dataset.try; close(true); window.dispatchEvent(new CustomEvent('ld-try', { detail: id })); });\n      const dj = r.querySelector('[data-daily]');\n", 1],
  ["row('assist', '自动打叉助手', '自动排除表演者影响到的格子（更简单）')",
    "row('assist', '自动打叉助手', '自动排除表演者影响到的格子（更简单）')\n      + (navigator.vibrate ? row('vibrate', '震动', '放置表演者和失误时手机轻轻震动') : '')", 1],
  ['<button class="ldui-btn alt" type="button" data-reset="1">重置全部进度</button>',
    '<button class="ldui-btn gold" type="button" data-pick="1">⚡ 选择难度（更快玩到难关）</button><button class="ldui-btn alt" type="button" data-reset="1">重置全部进度</button>', 1],
  ["    r.querySelector('[data-reset]').addEventListener(",
    "    r.querySelector('[data-pick]').addEventListener('click', () => { click(); close(true); window.dispatchEvent(new Event('ld-pick')); });\n    r.querySelector('[data-reset]').addEventListener(", 1],
];

// the Loop Station layer names (core stays untouched, so they are set at runtime)
export const LAYERS = ['底鼓', '踩镲', '军鼓', '贝斯', '和声', '沙锤', '旋律', '拍手', '切片'];  // Kick Hats Snare Bass Pad Shaker Hook Claps Chops
