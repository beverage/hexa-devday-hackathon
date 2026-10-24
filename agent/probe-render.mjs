// Times the Levelang render leg: one cell at a time, then the three neighbouring cells in parallel.
// Usage: node agent/probe-render.mjs [--runs 3] [--url https://levelang-backend-staging.fly.dev/api/v1] [--model <id>]
// Key: LEVELANG_API_KEY from ../.env, else LLB_STAGING_API_KEY from ~/Code/Apps/levelang/levelang-backend/.env.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const loadEnv = f => { try { for (const l of fs.readFileSync(f, 'utf8').split('\n')) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim(); } } catch {} };
loadEnv(path.join(here, '..', '.env'));
loadEnv(path.join(process.env.HOME ?? '', 'Code/Apps/levelang/levelang-backend/.env'));
const KEY = process.env.LEVELANG_API_KEY || process.env.LLB_STAGING_API_KEY;
if (!KEY) { console.error('no Levelang key found'); process.exit(1); }
const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d; };
const URL = arg('--url', 'https://levelang-backend-staging.fly.dev/api/v1');
const RUNS = Number(arg('--runs', '3'));
const MODEL = arg('--model', null);
const fixture = JSON.parse(fs.readFileSync(path.join(here, 'fixtures', 'scenario-1.json'), 'utf8'));
const TEXT = 'I understand. Your October payment of 142 euros was returned by your bank. Nobody is cutting your electricity today. I can split the amount into three monthly payments and text you a secure link for the first one.';

async function render(level, mood = 'formal', target = 'fra') {
  const body = { text: TEXT, source_language_code: 'eng', target_language_code: target, level, mood, mode: 'spoken' };
  if (MODEL) body.model = MODEL;
  const t0 = performance.now();
  const res = await fetch(`${URL}/translate`, { method: 'POST', headers: { authorization: `Bearer ${KEY}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const ms = performance.now() - t0;
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  return { ms, text: j.translation, model: j.metadata?.model ?? j.metadata?.model_used ?? JSON.stringify(j.metadata ?? {}).slice(0, 80) };
}
const median = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const f = v => `${(v / 1000).toFixed(2)} s`;

const cells = [['beginner', 'formal', 'fra'], ['intermediate', 'formal', 'fra'], ['fluent', 'formal', 'fra'], ['fluent', 'casual', 'fra'], ['beginner', 'formal', 'deu']];
const out = {}; let modelSeen = null;
console.log(`Levelang render benchmark, ${URL}, ${new Date().toISOString().slice(0, 16)}Z, ${RUNS} runs each\n`);
console.log('| Cell | Median | Min | Max |'); console.log('|---|---|---|---|');
for (const [level, mood, target] of cells) {
  const times = []; let last;
  for (let r = 0; r < RUNS; r++) { try { last = await render(level, mood, target); times.push(last.ms); modelSeen ??= last.model; } catch (e) { console.error(`${target} ${level}/${mood}:`, e.message); } }
  if (times.length) { out[`${target} ${level}/${mood}`] = last.text; console.log(`| ${target} ${level}/${mood} | ${f(median(times))} | ${f(Math.min(...times))} | ${f(Math.max(...times))} |`); }
}
const par = [];
for (let r = 0; r < RUNS; r++) {
  const t0 = performance.now();
  try { await Promise.all([render('beginner'), render('intermediate'), render('advanced')]); par.push(performance.now() - t0); } catch (e) { console.error('parallel:', e.message); }
}
if (par.length) console.log(`| 3 cells in parallel (fra beginner/intermediate/advanced) | ${f(median(par))} | ${f(Math.min(...par))} | ${f(Math.max(...par))} |`);
console.log(`\nModel reported by the backend: ${modelSeen}`);
for (const [k, v] of Object.entries(out)) console.log(`\n${k}:\n${v}`);
