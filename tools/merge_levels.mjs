// Merges tools/levels-main.json (easy..expert) with the race finds tools/extreme.jsonl and tools/nightmare.jsonl into tools/levels.json.
// Usage: node tools/merge_levels.mjs
import fs from 'node:fs';
const main = JSON.parse(fs.readFileSync('tools/levels-main.json', 'utf8'));
const score = (g) => g[1] + g[2] * 3 + g[3] * 9;
for (const [id, name] of [['extreme', 'Extreme'], ['nightmare', 'Nightmare']]) {
  const f = 'tools/' + id + '.jsonl';
  const list = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split(String.fromCharCode(10)).filter(Boolean).map((l) => JSON.parse(l.trim())) : [];
  list.sort((a, b) => a.n - b.n || score(a.g) - score(b.g));
  main.plan = main.plan.filter((p) => p.id !== id);
  if (list.length) { main.plan.push({ id, name }); main.packs[id] = list; }
}
fs.writeFileSync('tools/levels.json', JSON.stringify(main));
console.log('levels:', Object.entries(main.packs).map(([k, v]) => k + ' ' + v.length + ' (' + [...new Set(v.map((q) => q.n))].join('/') + ')').join(', '));
