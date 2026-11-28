// Builds cn/index.html, the Chinese edition: the Anime Idol Stage look (idol.html) translated, with a guided tutorial,
// as ONE self-contained page. Engine, levels, menus and the duo's drawing kit are inlined and minified, the page uses the
// phone's own fonts and loads nothing from any other host, so it can open in mainland China and be uploaded anywhere.
// Translations: tools/cn_strings.mjs. Tutorial: tools/cn_tutorial.js. Usage: node tools/build_cn.mjs (after node tools/build.mjs)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { IDOL, META } from './cn_strings.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
let esbuild = null;
try { esbuild = await import('esbuild'); } catch (e) { console.log('esbuild not installed (npm install): building without minifying'); }

function apply(src, table, name) {
  for (const [en, zh, count] of table) {
    let n;
    if (en instanceof RegExp) {
      const re = en.global ? en : new RegExp(en.source, en.flags + 'g');
      n = (src.match(re) || []).length;
      if (count && n !== count) throw new Error(`${name}: ${en} found ${n} times, expected ${count}`);
      if (!n) throw new Error(`${name}: ${en} not found`);
      src = src.replace(re, zh);
      continue;
    }
    n = src.split(en).length - 1;
    if (count ? n !== count : n < 1) throw new Error(`${name}: "${en.slice(0, 70)}" found ${n} times, expected ${count || '1+'}`);
    src = src.split(en).join(zh);
  }
  return src;
}
const min = async (js) => (esbuild ? (await esbuild.transform(js, { minify: true, target: 'es2019', legalComments: 'none', charset: 'utf8' })).code.trim() : js);

let page = apply(read('idol.html'), IDOL, 'idol.html');
const meta = apply(read('loopdoku-meta.js'), META, 'meta');

// tutorial markup + styles
const EXTRA_HTML = `<div class="over" id="tutIntro"><div class="card">
  <div class="rib"><svg class="tl" viewBox="0 0 26 32"><path d="M1 2h24v28H1l7-14z"/></svg><svg class="tr" viewBox="0 0 26 32"><path d="M25 2H1v28h24l-7-14z"/></svg><div class="rb"><div class="rtxt">怎么玩</div></div></div>
  <div class="tduo"><canvas id="tutR" width="120" height="120"></canvas><canvas id="tutJ" width="120" height="120"></canvas></div>
  <ul class="trules" id="tutRules"></ul>
  <p class="tnote">每一关只有一个答案，只靠逻辑就能解开，不用猜。</p>
  <button class="gem big wide" data-tut="go"><svg class="ic"><use href="#i-play"/></svg>开始教学</button>
  <button class="gem lav wide" data-tut="skip">跳过</button>
</div></div>
<div class="over" id="lbBox"><div class="card lbcard">
  <div class="rib"><svg class="tl" viewBox="0 0 26 32"><path d="M1 2h24v28H1l7-14z"/></svg><svg class="tr" viewBox="0 0 26 32"><path d="M25 2H1v28h24l-7-14z"/></svg><div class="rb"><div class="rtxt"></div></div></div>
  <button class="lbx" type="button" data-lbx="1" aria-label="关闭">×</button>
  <div class="lbtabs" id="lbTabs"></div>
  <ol class="lblist" id="lbList"></ol>
  <button class="gem big wide" id="lbJoin" type="button"></button>
  <p class="tnote" id="lbHow"></p>
</div></div>
<div class="over" id="lbNameBox"><div class="card">
  <div class="rib"><svg class="tl" viewBox="0 0 26 32"><path d="M1 2h24v28H1l7-14z"/></svg><svg class="tr" viewBox="0 0 26 32"><path d="M25 2H1v28h24l-7-14z"/></svg><div class="rb"><div class="rtxt"></div></div></div>
  <p class="tnote" id="lbNameP"></p>
  <input id="lbInput" type="text" maxlength="24" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="例如：小明">
  <p class="lberr" id="lbErr"></p>
  <button class="gem big wide" type="button" data-lbok="1"></button>
  <button class="gem lav wide" type="button" data-lbno="1"></button>
</div></div>
<div class="over" id="pickLv"><div class="card">
  <div class="rib"><svg class="tl" viewBox="0 0 26 32"><path d="M1 2h24v28H1l7-14z"/></svg><svg class="tr" viewBox="0 0 26 32"><path d="M25 2H1v28h24l-7-14z"/></svg><div class="rb"><div class="rtxt">选择难度</div></div></div>
  <p class="tnote" style="font-size:15px;color:#3b1d5e">你玩过这类逻辑谜题吗？</p>
  <button class="gem lav wide lvopt" data-lv="0"><b>🌱 新手</b><small>从「简单」开始，一步一步来</small></button>
  <button class="gem green wide lvopt" data-lv="1"><b>🎧 玩过类似的</b><small>马上开放「普通」「休闲大盘」「困难」</small></button>
  <button class="gem big wide lvopt" data-lv="2"><b>🔥 逻辑高手</b><small>再开放「专家」和「恐怖」</small></button>
  <p class="tnote">之后也可以在「设置」里更改，或在演出列表里挑战解锁。</p>
</div></div>
`;
const EXTRA_CSS = `
#lbBox,#lbNameBox{z-index:31}
.tlb{position:absolute;left:12px;top:4px;z-index:3;background:linear-gradient(#fff6c2,#ffd84d)!important}
.lbcard{max-height:calc(100% - 30px)}
.lbx{position:absolute;right:10px;top:10px;width:36px;height:36px;border-radius:50%;border:2px solid var(--ink);background:#f1e8ff;font:900 20px/1 var(--ui);color:var(--ink);padding:0}
.lbtabs{display:flex;gap:6px;width:100%;margin-top:4px}
.lbtab{flex:1;padding:8px 0;border-radius:99px;border:2px solid var(--ink);background:#f1e8ff;font:900 14px/1 var(--ui);color:var(--ink)}
.lbtab.on{background:var(--p);color:#fff}
.lblist{list-style:none;margin:0;padding:2px;width:100%;display:grid;gap:5px;overflow:auto;max-height:46vh}
.lblist li{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:14px;background:#f7f0ff;font:800 15px/1.2 var(--ui);color:var(--ink)}
.lblist li b{width:28px;text-align:center;flex:none}
.lblist li span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lblist li em{font-style:normal;color:var(--pd);font-weight:900;white-space:nowrap}
.lblist li.me{background:#ffe3f0;box-shadow:0 0 0 2px var(--p)}
.lblist li i{font-style:normal;font-size:11px;background:var(--p);color:#fff;border-radius:99px;padding:1px 6px;vertical-align:2px}
.lblist li small{font-size:11px;color:#7a5fa6}
.lblist li.gap{background:none;justify-content:center;padding:0}
.lblist li.none{justify-content:center;color:#7a5fa6;white-space:normal;text-align:center}
#lbInput{width:100%;padding:12px 14px;border-radius:14px;border:3px solid var(--ink);font:900 18px/1.2 var(--ui);color:var(--ink);text-align:center;-webkit-user-select:text;user-select:text;background:#fff;outline:none}
#lbInput:focus{box-shadow:0 0 0 3px var(--p)}
.lberr{margin:0;min-height:18px;color:#e3124a;font:800 13px/1.3 var(--ui);text-align:center}
.lbjoin{margin-top:6px;width:100%;padding:8px;border-radius:14px;border:2px solid var(--ink);background:linear-gradient(#fff6c2,#ffd84d);font:900 14px/1.2 var(--ui);color:var(--ink)}
.lbclimb{margin-top:6px;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:7px 10px;border-radius:16px;border:2px solid var(--ink);background:linear-gradient(#fff,#ffeaf4);font:900 14px/1 var(--ui);color:var(--ink);box-shadow:0 3px 0 #a283e8;transition:transform .2s var(--spring)}
.lbclimb.go{animation:lbgo .5s var(--spring)}
.lbclimb.rose{background:linear-gradient(#fff6c2,#ffd84d);box-shadow:0 3px 0 #d9a21f,0 0 18px rgba(255,216,77,.8)}
.lbclimb .lbn{font-size:20px;color:var(--pd);min-width:2.2em;text-align:right;font-variant-numeric:tabular-nums}
.lbclimb small{font-size:12px}
.lbclimb .lbg{color:#3f7f18;font-size:13px}
.lbclimb .lbr{padding:4px 8px;border-radius:99px;background:var(--ink);color:#fff;font-size:12.5px;display:inline-block}
.lbclimb .lbr.pop{animation:lbpop .3s var(--spring)}
.lbclimb .lbup{color:#e3124a;font-size:14px}
.lblist li.climb{animation:lbglow 1.6s ease-out}
@keyframes lbgo{0%{transform:scale(.9)}60%{transform:scale(1.06)}100%{transform:none}}
@keyframes lbpop{0%{transform:scale(1.6)}100%{transform:none}}
@keyframes lbglow{0%,60%{box-shadow:0 0 0 3px #ffd84d,0 0 22px rgba(255,216,77,.9)}100%{box-shadow:0 0 0 2px var(--p)}}
.lbline{margin-top:6px;text-align:center;font:900 13.5px/1.3 var(--ui);color:var(--pd)}
#pickLv{z-index:30}
.gem.lvopt{height:auto!important;min-height:62px;flex-direction:column;gap:3px;padding:9px 14px;line-height:1.2}
.lvopt b{font-size:18px}.lvopt small{font-size:12.5px;font-weight:900;white-space:normal;text-shadow:0 1px 1px rgba(0,0,0,.35)}.gem.lav.lvopt small{text-shadow:none;color:#5a3f86}#pickLv .card{gap:12px}
.say{white-space:normal;width:max-content;max-width:min(94vw,380px);line-height:1.3}
#tutIntro{z-index:30}
.tduo{display:flex;justify-content:center;gap:4px;margin:2px 0 -4px}.tduo canvas{width:64px;height:64px}
.trules{list-style:none;margin:0;padding:0;width:100%;display:grid;gap:7px}
.trules li{display:flex;align-items:center;gap:10px;font:900 16px/1.3 var(--ui);color:var(--ink)}
.trules li i{flex:none;width:30px;height:30px;border-radius:10px;display:grid;place-items:center;font-style:normal;background:#ffe3f0;color:var(--pd);box-shadow:0 0 0 2px var(--ink)}
.trules li:nth-child(odd) i{background:#e6f9cf;color:var(--gd)}
.tnote{margin:0;font:800 13px/1.4 var(--ui);color:#7a5fa6;text-align:center}
.tskip{display:none;position:absolute;right:8px;bottom:4px;z-index:6;padding:5px 12px;border-radius:99px;border:2px solid #fff;background:rgba(34,16,63,.75);color:#fff;font:900 12px/1 var(--ui)}
#scr-game.tut .tskip{display:block}
#scr-game.tut .crowdbox{height:108px}
#scr-game.tut .say{left:50%;top:4px;bottom:auto;width:94%;max-width:440px;white-space:normal;align-items:flex-start;border-radius:20px;padding:8px 14px 8px 8px;font-size:15px;line-height:1.4}
.say .tstep{display:block;font-size:11px;line-height:1.2;color:var(--pd);margin-bottom:1px}
.tglow{animation:tglow .9s ease-in-out infinite!important;z-index:5}
@keyframes tglow{0%,100%{filter:drop-shadow(0 0 0 #ffd84d) brightness(1)}50%{filter:drop-shadow(0 0 10px #ffd84d) drop-shadow(0 0 4px #fff) brightness(1.25)}}
`;
const one = (s, a, b) => { if (s.split(a).length !== 2) throw new Error('anchor not unique: ' + a.slice(0, 60)); return s.replace(a, () => b); };
page = one(page, '<div id="vig"></div>', EXTRA_HTML + '<div id="vig"></div>');
page = one(page, '<div class="crowdbox"><canvas id="crowd"></canvas>', '<div class="crowdbox"><canvas id="crowd"></canvas><button class="tskip" id="tutSkip" type="button">跳过教学</button>');
page = one(page, '</style>', EXTRA_CSS + '</style>');
page = one(page, '<div class="tstage" id="tStageBox"><canvas id="tStage"></canvas>', '<div class="tstage" id="tStageBox"><canvas id="tStage"></canvas><button class="pill tlb" id="lbBtn" type="button" style="display:none"></button>');
page = one(page, '<div id="wX"></div>', '<div id="wX"></div><div id="wLB"></div>');
// the tutorial goes inside the page script, right before its boot code
const tut = fs.readFileSync(path.join(here, 'cn_tutorial.js'), 'utf8') + '\n' + fs.readFileSync(path.join(here, 'cn_board.js'), 'utf8')
  + "\nfunction tutFaces() { drawMiniFace($('#tutR'), 'roxor'); drawMiniFace($('#tutJ'), 'jasmin'); }\n"
  + "const tutIntroOrig = tutIntro; tutIntro = function () { tutFaces(); tutIntroOrig(); };\n";
page = one(page, '\n// ---------------------------------------------------------------------------------------------------------- boot\n', '\n' + tut + '\n// ---- boot\n');
page = one(page, 'resize();\nrequestAnimationFrame(frame);\n', "resize();\nrequestAnimationFrame(frame);\nif (!LD.meta.settings().tutDone && scr === 'title') setTimeout(tutIntro, 400);\n");

// inline every script, minified
// the drawing kit ships the whole Hocus Vocus data core (cards, enemies, ...); the chibis only need it to exist
let rj = read('rj-cast.js');
const d0 = rj.indexOf('// Hocus Vocus data core:'), d1 = rj.indexOf('// Hocus Vocus: ART:');
if (d0 < 0 || d1 < d0) throw new Error('rj-cast.js layout changed: cannot drop the data core');
rj = rj.slice(0, d0) + 'const DATA = { LISTS: { sizeHeight: {}, fx: [] } };\n' + rj.slice(d1);
const SRC = { 'loopdoku-core.js': read('loopdoku-core.js'), 'loopdoku-levels.js': read('loopdoku-levels.js'), 'loopdoku-meta.js': meta, 'rj-cast.js': rj };
for (const [f, js] of Object.entries(SRC)) page = one(page, `<script src="${f}"></script>`, '<script>' + (await min(js)).replace(/<\/script/gi, '<\\/script') + '</script>');
// the page's own script (the one inline script left that is not minified yet)
const m = /<script>\n\(\(\) => \{\n'use strict';[\s\S]*?<\/script>/.exec(page);
if (!m) throw new Error('page script not found');
const pageJs = await min(m[0].slice('<script>'.length, -'</script>'.length));
page = page.replace(m[0], () => '<script>' + pageJs.replace(/<\/script/gi, '<\\/script') + '</script>');
// nothing the page itself loads may come from another host
if (/<(script|link|img|iframe|audio|video|source)\b[^>]*\b(src|href)\s*=\s*["']?(https?:)?\/\//i.test(page) || /@import|url\(\s*["']?(https?:)?\/\//i.test(page)) throw new Error('the Chinese page must not load anything from another host');
fs.mkdirSync(path.join(root, 'cn'), { recursive: true });
fs.writeFileSync(path.join(root, 'cn', 'index.html'), page);
const gz = zlib.gzipSync(page, { level: 9 }).length;
console.log('built cn/index.html', (Buffer.byteLength(page) / 1024).toFixed(1) + ' KB,', (gz / 1024).toFixed(1) + ' KB gzipped');
