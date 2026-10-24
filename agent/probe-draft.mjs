// Times the OpenAI draft leg of one turn: tool call, then the English draft after the tool result.
// Usage: node agent/probe-draft.mjs [--models gpt-5.4-nano,gpt-5.4-mini] [--runs 3]
// Reads OPENAI_API_KEY from ../.env (repo root). Prints a markdown table of medians.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
for (const line of fs.readFileSync(path.join(here, '..', '.env'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}
const KEY = process.env.OPENAI_API_KEY; if (!KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }
const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d; };
const MODELS = arg('--models', 'gpt-5.4-nano,gpt-5.4-mini').split(',');
const RUNS = Number(arg('--runs', '3'));
const fixture = JSON.parse(fs.readFileSync(path.join(here, 'fixtures', 'scenario-1.json'), 'utf8'));

const system = `You are the customer-service agent of Lucioles Énergie, an electricity supplier. The caller speaks French; you reply in plain, level-neutral ENGLISH (another system renders it in French at the caller's level). Never simplify or stylise. Decide what to say and which tools to call; be concrete (amounts, dates). Keep replies under 60 words. Never threaten a cut-off.`;
const tools = [
  { type: 'function', function: { name: 'lookup_account', description: 'Account by phone: plan, amount due, return code, cut-off status', parameters: { type: 'object', properties: { phone: { type: 'string' } }, required: ['phone'] } } },
  { type: 'function', function: { name: 'propose_payment_plan', description: 'Split the amount due into equal monthly instalments', parameters: { type: 'object', properties: { months: { type: 'integer', minimum: 2, maximum: 6 } }, required: ['months'] } } },
  { type: 'function', function: { name: 'send_payment_link', description: 'Send a secure payment link for one instalment', parameters: { type: 'object', properties: { amount_eur: { type: 'number' } }, required: ['amount_eur'] } } },
];
const toolResult = JSON.stringify(fixture.account);

async function call(model, messages, extra) {
  const body = { model, messages, tools, stream: true, stream_options: { include_usage: true }, ...extra };
  const t0 = performance.now(); let tFirst = null; let text = ''; let toolName = null; let usage = null;
  const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { authorization: `Bearer ${KEY}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '';
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    let i; while ((i = buf.indexOf('\n')) > -1) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:') || line === 'data: [DONE]') continue;
      const j = JSON.parse(line.slice(5)); const d = j.choices?.[0]?.delta; if (j.usage) usage = j.usage;
      if (d && (d.content || d.tool_calls)) { if (tFirst === null) tFirst = performance.now(); }
      if (d?.content) text += d.content;
      if (d?.tool_calls?.[0]?.function?.name) toolName = d.tool_calls[0].function.name;
    }
  }
  return { ttft: tFirst ? tFirst - t0 : null, total: performance.now() - t0, text, toolName, usage };
}

const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const rows = [];
for (const model of MODELS) {
  const extra = {};
  // gpt-5 family: try low reasoning effort first; fall back if the model rejects it
  let probe; try { probe = await call(model, [{ role: 'system', content: system }, { role: 'user', content: 'ping' }], { reasoning_effort: 'low', max_completion_tokens: 20 }); extra.reasoning_effort = 'low'; }
  catch (e) { if (!/reasoning_effort|Unsupported|unknown parameter/i.test(e.message)) { console.error(model, e.message.slice(0, 200)); rows.push({ model, error: e.message.slice(0, 80) }); continue; } }
  const leg1 = [], leg2 = [], leg2ttft = []; let sample = '', toolSeen = 0;
  for (let r = 0; r < RUNS; r++) {
    try {
      const msgs = [{ role: 'system', content: system }, { role: 'user', content: fixture.turns[0].caller }];
      const a = await call(model, msgs, extra); leg1.push(a.total); if (a.toolName) toolSeen++;
      const msgs2 = [...msgs,
        { role: 'assistant', content: null, tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'lookup_account', arguments: JSON.stringify({ phone: fixture.account.phone }) } }] },
        { role: 'tool', tool_call_id: 'call_1', content: toolResult }];
      const b = await call(model, msgs2, extra); leg2.push(b.total); leg2ttft.push(b.ttft ?? b.total); sample = b.text || sample;
    } catch (e) { console.error(model, 'run', r, e.message.slice(0, 200)); }
  }
  rows.push({ model, effort: extra.reasoning_effort ?? 'default', leg1: median(leg1), leg2: median(leg2), leg2ttft: median(leg2ttft), toolSeen, runs: leg1.length, sample });
}
console.log(`\n| Model | Effort | Tool-call leg, median | Draft leg, median | Draft first token | Tool called | Runs |`);
console.log(`|---|---|---|---|---|---|---|`);
for (const r of rows) {
  if (r.error) { console.log(`| ${r.model} | | error: ${r.error} | | | | |`); continue; }
  const f = v => v == null ? '—' : `${(v / 1000).toFixed(2)} s`;
  console.log(`| ${r.model} | ${r.effort} | ${f(r.leg1)} | ${f(r.leg2)} | ${f(r.leg2ttft)} | ${r.toolSeen}/${r.runs} | ${r.runs} |`);
}
for (const r of rows) if (r.sample) console.log(`\n${r.model} draft sample: ${r.sample.replace(/\s+/g, ' ').slice(0, 300)}`);
