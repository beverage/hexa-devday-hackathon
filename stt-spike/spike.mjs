#!/usr/bin/env node
// STT provider spike: Gradium vs ElevenLabs Scribe v2, on the same learner clips.
// Decides the input provider for the Hexa / DevDay hack before Saturday 11:00.
//
// Node 24, no dependencies. Written 2026-10-23 by Claude (Cowork) from the vendor docs; every leg
// smoke-tested the same day on synthetic `say` clips.
//
//   node spike.mjs synth --clip <n> --voice <id>   Gradium TTS of the reference text → clips/<n>.wav (no recording)
//   node spike.mjs convert                 clips/*.m4a → clips/wav/*.wav (24 kHz mono 16-bit, afconvert)
//   node spike.mjs gradium-rest            POST each wav → out/<clip>.gradium-rest.<variant>.json
//   node spike.mjs gradium-ws              stream pcm over the WebSocket, keep the VAD trace → out/<clip>.gradium-ws.json
//   node spike.mjs eleven-batch            POST each wav to Scribe v2 (word timestamps, verbatim) → out/<clip>.eleven-batch.<variant>.json
//   node spike.mjs eleven-rt               stream each wav to Scribe v2 Realtime, paced, VAD commits (--silence s) → out/<clip>.eleven-rt.<variant>.json
//   node spike.mjs all                     the three legs above (not eleven-rt)
//   node spike.mjs report                  the comparison, one block per clip
//
// Flags: --env <file> (default: ../.env, then ~/Code/Apps/hackathon/.env; needs GRADIUM_API_KEY, ELEVENLABS_API_KEY)
//        --clip <name>  one clip only          --fast  don't pace the WebSocket at real time
//        --any          Gradium language:"any" variant too      --keywords  Gradium keyword boost on the WS leg
//        --keyterms     ElevenLabs keyterms variant (20% surcharge)   --clean  ElevenLabs no_verbatim variant, for contrast
//        --lang         ElevenLabs: force language_code instead of auto-detect     --delay <n>  Gradium delay_in_frames (default 16)

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const CLIPS = path.join(here, 'clips');
const OUT = path.join(here, 'out');
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const cmd = args[0];
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const has = (name) => args.includes(name);

// ---- env --------------------------------------------------------------------
// The project root .env first, then the shared hackathon one; a key left empty in the first falls through to the second.
const envPaths = flag('--env') ? [flag('--env')] : [path.join(here, '..', '.env'), path.join(process.env.HOME ?? '', 'Code/Apps/hackathon/.env')];
for (const envPath of envPaths) {
  if (!existsSync(envPath)) continue;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*"?([^"#]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
const GRADIUM_KEY = process.env.GRADIUM_API_KEY;
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
const need = (v, name) => { if (!v) { console.error(`missing ${name} (env files: ${envPaths.join(', ')})`); process.exit(1); } };

// ---- clips ------------------------------------------------------------------
const ref = JSON.parse(readFileSync(path.join(CLIPS, 'reference.json'), 'utf8'));
delete ref._readme;
const clipNames = flag('--clip') ? [flag('--clip')] : Object.keys(ref);
const wavPath = (name) => path.join(CLIPS, 'wav', `${name}.wav`);
function sourcePath(name) {
  for (const ext of ['m4a', 'mp3', 'wav', 'aiff', 'caf', 'mp4']) {
    const p = path.join(CLIPS, `${name}.${ext}`);
    if (existsSync(p)) return p;
  }
  throw new Error(`no recording for "${name}" in ${CLIPS} (expected ${name}.m4a)`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = (file, obj) => writeFileSync(path.join(OUT, file), JSON.stringify(obj, null, 2));
const splitWords = (list) => list.flatMap((w) => w.split(/\s+/)); // Gradium keywords cannot contain spaces

function convert() {
  mkdirSync(path.join(CLIPS, 'wav'), { recursive: true });
  for (const name of clipNames) {
    const src = sourcePath(name), dst = wavPath(name);
    // 24 kHz mono 16-bit: what Gradium's pcm/wav paths expect; ElevenLabs accepts any file.
    execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@24000', '-c', '1', src, dst], { stdio: 'inherit' });
    // From an AAC source afconvert writes WAVE_FORMAT_EXTENSIBLE plus a FLLR chunk, and Gradium REST answers that
    // with an empty 200 (found on the first real recording). Rewrite it with a plain 44-byte PCM header.
    const { sampleRate, pcm } = wavPcm(readFileSync(dst));
    writeFileSync(dst, wavFromPcm(pcm, sampleRate));
    console.log(`${name}: ${path.basename(src)} → clips/wav/${name}.wav`);
  }
}

function wavFromPcm(pcm, rate) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); // PCM, mono
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

// Minimal WAV reader: returns the PCM payload and its sample rate (afconvert adds extra chunks, so no 44-byte assumption).
function wavPcm(buf) {
  let off = 12, fmt = {}, pcm = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') fmt = { channels: buf.readUInt16LE(off + 10), sampleRate: buf.readUInt32LE(off + 12), bits: buf.readUInt16LE(off + 22) };
    if (id === 'data') { pcm = buf.subarray(off + 8, off + 8 + size); break; }
    off += 8 + size + (size % 2);
  }
  return { ...fmt, pcm };
}

// Gradium emits text segments as `text` (start_s) followed by `end_text` (stop_s); pair them.
function pairSegments(msgs) {
  const segs = [];
  for (const m of msgs) {
    if (m.type === 'text') segs.push({ text: m.text, start_s: m.start_s });
    else if (m.type === 'end_text' && segs.length) segs[segs.length - 1].stop_s = m.stop_s;
  }
  return segs;
}

// ---- leg A: Gradium REST ----------------------------------------------------
// POST /post/speech/asr, raw audio body, Content-Type picks the format, json_config as a URL-encoded query parameter.
// Response is NDJSON: text / end_text / error lines.
async function gradiumRest() {
  need(GRADIUM_KEY, 'GRADIUM_API_KEY');
  for (const name of clipNames) {
    const r = ref[name];
    const variants = [{ tag: 'plain', cfg: { language: r.language } }];
    const english = r.planted?.english ?? [];
    if (english.length) variants.push({ tag: 'keywords', cfg: { language: r.language, keywords: { words: splitWords(english), boost: 3 } } });
    if (has('--any')) variants.push({ tag: 'any', cfg: { language: 'any' } });
    for (const v of variants) {
      const url = `https://api.gradium.ai/api/post/speech/asr?json_config=${encodeURIComponent(JSON.stringify(v.cfg))}`;
      const t0 = performance.now();
      const res = await fetch(url, { method: 'POST', headers: { 'x-api-key': GRADIUM_KEY, 'Content-Type': 'audio/wav' }, body: readFileSync(wavPath(name)) });
      const body = await res.text();
      const wall_ms = Math.round(performance.now() - t0);
      if (!res.ok) { console.error(`${name}/${v.tag}: HTTP ${res.status} ${body.slice(0, 300)}`); continue; }
      const msgs = body.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return { type: 'raw', line: l }; } });
      const segments = pairSegments(msgs);
      const out = { provider: 'gradium-rest', variant: v.tag, clip: name, config: v.cfg, wall_ms, transcript: segments.map((s) => s.text).join(' ').trim(), segments, raw: msgs };
      save(`${name}.gradium-rest.${v.tag}.json`, out);
      console.log(`${name}/${v.tag} (${wall_ms} ms): ${out.transcript}`);
    }
  }
}

// ---- leg B: Gradium WebSocket (the VAD trace lives here) -------------------
// wss://api.gradium.ai/api/speech/asr; first message must be setup; audio as base64 JSON; `step` every 80 ms with inactivity_prob per horizon.
async function gradiumWs() {
  need(GRADIUM_KEY, 'GRADIUM_API_KEY');
  for (const name of clipNames) {
    const r = ref[name];
    const { sampleRate, pcm } = wavPcm(readFileSync(wavPath(name)));
    if (sampleRate !== 24000 || !pcm) throw new Error(`${name}: need a 24 kHz wav (run convert), got ${sampleRate}`);
    const english = r.planted?.english ?? [];
    const json_config = { language: r.language, delay_in_frames: Number(flag('--delay') ?? 16) };
    if (has('--keywords') && english.length) json_config.keywords = { words: splitWords(english), boost: 3 };

    const result = await new Promise((resolve, reject) => {
      // Node's global WebSocket (undici) accepts a non-standard `headers` option. If this throws, mint a token
      // instead: GET https://api.gradium.ai/api/api-keys/token with x-api-key → {token}; connect with ?token=…
      const ws = new WebSocket('wss://api.gradium.ai/api/speech/asr', { headers: { 'x-api-key': GRADIUM_KEY } });
      const msgs = [], steps = [];
      let ready = null, tLastAudio = null, tEnd = null;
      const t0 = performance.now();
      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ type: 'setup', model_name: 'default', input_format: 'pcm', json_config }));
      });
      ws.addEventListener('message', async (ev) => {
        const text = typeof ev.data === 'string' ? ev.data : Buffer.from(await ev.data.arrayBuffer()).toString();
        const m = JSON.parse(text);
        if (m.type === 'ready') { ready = m; streamAudio().catch(reject); return; }
        if (m.type === 'step' || m.type === 'vad') { steps.push(m); return; }
        msgs.push({ ...m, t_ms: Math.round(performance.now() - t0) });
        if (m.type === 'error') reject(new Error(`${m.code ?? ''} ${m.message}`));
        if (m.type === 'end_of_stream') { tEnd = performance.now(); ws.close(); }
      });
      ws.addEventListener('error', (e) => reject(new Error(`websocket error: ${e.message ?? e.type}`)));
      ws.addEventListener('close', () => resolve({ ready, msgs, steps, tail_ms: tEnd && tLastAudio ? Math.round(tEnd - tLastAudio) : null }));
      async function streamAudio() {
        const chunk = 3840; // 1920 samples × 2 bytes = 80 ms at 24 kHz, the size the docs recommend
        for (let off = 0; off < pcm.length; off += chunk) {
          ws.send(JSON.stringify({ type: 'audio', audio: pcm.subarray(off, off + chunk).toString('base64') }));
          if (!has('--fast')) await sleep(80); // real-time pacing so the VAD trace means something
        }
        tLastAudio = performance.now();
        ws.send(JSON.stringify({ type: 'end_of_stream' }));
      }
    });

    const segments = pairSegments(result.msgs);
    const out = {
      provider: 'gradium-ws', clip: name, config: json_config, ready: result.ready,
      transcript: segments.map((s) => s.text).join(' ').trim(), segments,
      tail_ms: result.tail_ms, vad: summarizeVad(result.steps, segments), steps: result.steps, messages: result.msgs,
    };
    save(`${name}.gradium-ws.json`, out);
    console.log(`${name} (final text ${out.tail_ms} ms after last audio): ${out.transcript}`);
    console.log(`  semantic VAD: ${JSON.stringify(out.vad)}`);
  }
}

// Would the turn-taking recipe (3 consecutive steps with longest-horizon inactivity_prob > 0.5) have cut the turn
// during a hesitation, i.e. before the last segment began? Rough, but it is the question that matters for the agent.
function summarizeVad(steps, segments) {
  // The recipe only flushes once there is a transcript, so silence before the first word ends is lead-in, not a cut.
  const firstStop = segments.length ? segments[0].stop_s : Infinity;
  const lastStart = segments.length ? segments[segments.length - 1].start_s : Infinity;
  let run = 0, maxBefore = 0;
  const cuts = [];
  for (const s of steps) {
    const longest = s.vad?.[s.vad.length - 1];
    if (!longest) continue;
    const t = s.total_duration_s ?? (s.step_idx ?? 0) * (s.step_duration_s ?? 0.08);
    if (t < firstStop || t >= lastStart) { run = 0; continue; }
    maxBefore = Math.max(maxBefore, longest.inactivity_prob);
    run = longest.inactivity_prob > 0.5 ? run + 1 : 0;
    if (run === 3) cuts.push(Number(t.toFixed(2)));
  }
  return {
    horizons_s: steps[0]?.vad?.map((v) => v.horizon_s) ?? null,
    steps: steps.length,
    max_inactivity_before_last_segment: Number(maxBefore.toFixed(2)),
    would_have_cut_turn_at_s: cuts,
  };
}

// ---- leg C: ElevenLabs Scribe v2, batch -------------------------------------
// POST /v1/speech-to-text multipart. Defaults are what we want to observe: language auto-detected,
// timestamps per word, audio events tagged, verbatim (no_verbatim=false). Words carry logprob.
async function elevenBatch() {
  need(ELEVEN_KEY, 'ELEVENLABS_API_KEY');
  for (const name of clipNames) {
    const r = ref[name];
    const english = r.planted?.english ?? [];
    const variants = [{ tag: 'verbatim', extra: {} }];
    if (has('--keyterms') && english.length) variants.push({ tag: 'keyterms', extra: { keyterms: english } });
    if (has('--clean')) variants.push({ tag: 'no_verbatim', extra: { no_verbatim: 'true' } });
    for (const v of variants) {
      const fd = new FormData();
      fd.set('model_id', 'scribe_v2');
      fd.set('timestamps_granularity', 'word');
      fd.set('tag_audio_events', 'true');
      fd.set('diarize', 'false');
      if (has('--lang')) fd.set('language_code', r.language);
      for (const [k, val] of Object.entries(v.extra)) Array.isArray(val) ? val.forEach((x) => fd.append(k, x)) : fd.set(k, val);
      fd.set('file', new Blob([readFileSync(wavPath(name))], { type: 'audio/wav' }), `${name}.wav`);
      const t0 = performance.now();
      const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': ELEVEN_KEY }, body: fd });
      const wall_ms = Math.round(performance.now() - t0);
      const text = await res.text();
      let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
      if (!res.ok) { console.error(`${name}/${v.tag}: HTTP ${res.status} ${text.slice(0, 300)}`); continue; }
      const all = json.words ?? [];
      const words = realWords(all);
      const out = {
        provider: 'eleven-batch', variant: v.tag, clip: name, wall_ms,
        language_code: json.language_code, language_probability: json.language_probability,
        transcript: json.text, words: all, timing: timing(words),
        audio_events: all.filter((w) => w.type === 'audio_event').map((w) => w.text),
        low_logprob: lowLogprob(words),
      };
      save(`${name}.eleven-batch.${v.tag}.json`, out);
      console.log(`${name}/${v.tag} (${wall_ms} ms, ${out.language_code} p=${out.language_probability}): ${out.transcript}`);
      console.log(`  ${out.timing.words_per_s} w/s; pauses ${JSON.stringify(out.timing.pauses)}; events ${JSON.stringify(out.audio_events)}`);
    }
  }
}

// Scribe types punctuation ("?", "…") as `word` too; keep real words only for rate, pauses and logprob.
const realWords = (all) => all.filter((w) => w.type === 'word' && /[\p{L}\p{N}]/u.test(w.text));
const lowLogprob = (words) => words.filter((w) => typeof w.logprob === 'number').sort((a, b) => a.logprob - b.logprob).slice(0, 5)
  .map((w) => ({ text: w.text, logprob: Number(w.logprob.toFixed(3)) }));

// ---- leg D: ElevenLabs Scribe v2 Realtime ----------------------------------
// wss://api.elevenlabs.io/v1/speech-to-text/realtime with the xi-api-key header; pcm_24000 in 80 ms chunks paced at
// real time; VAD commits after --silence seconds (vad_silence_threshold_secs, default 1.5). Each commit is where the
// agent would take the turn, so a commit inside fr-beginner's hesitations means the caller got cut off.
async function elevenRt() {
  need(ELEVEN_KEY, 'ELEVENLABS_API_KEY');
  const silence = Number(flag('--silence') ?? 1.5);
  for (const name of clipNames) {
    const r = ref[name];
    const { sampleRate, pcm } = wavPcm(readFileSync(wavPath(name)));
    if (sampleRate !== 24000 || !pcm) throw new Error(`${name}: need a 24 kHz wav (run convert), got ${sampleRate}`);
    const q = new URLSearchParams({ model_id: 'scribe_v2_realtime', audio_format: 'pcm_24000', commit_strategy: 'vad',
      vad_silence_threshold_secs: String(silence), include_timestamps: 'true', include_language_detection: 'true' });
    if (has('--lang')) q.set('language_code', r.language);

    const result = await new Promise((resolve, reject) => {
      const ws = new WebSocket(`wss://api.elevenlabs.io/v1/speech-to-text/realtime?${q}`, { headers: { 'xi-api-key': ELEVEN_KEY } });
      const msgs = [], commits = [], lateErrors = [];
      let config = null, sentS = 0, tLastAudio = null, tFinal = null, idle = null;
      const t0 = performance.now();
      const finish = () => { clearTimeout(idle); ws.close(); };
      ws.addEventListener('message', async (ev) => {
        const text = typeof ev.data === 'string' ? ev.data : Buffer.from(await ev.data.arrayBuffer()).toString();
        const m = JSON.parse(text);
        if (m.message_type === 'session_started') { config = m.config; streamAudio().catch(reject); return; }
        if (m.message_type === 'partial_transcript') return;
        msgs.push({ ...m, t_ms: Math.round(performance.now() - t0), audio_s: Number(sentS.toFixed(2)) });
        if (m.error) {
          // After the last audio, a throttled or empty final commit is noise, not a failure.
          if (tLastAudio) { lateErrors.push(`${m.message_type}: ${m.error}`); idle = idle ?? setTimeout(finish, 1500); return; }
          reject(new Error(`${m.message_type}: ${m.error}`)); ws.close(); return;
        }
        if (m.message_type === 'committed_transcript_with_timestamps') {
          commits.push({ audio_s: Number(sentS.toFixed(2)), text: m.text, words: m.words ?? [], language_code: m.language_code });
          if (tLastAudio) { tFinal = performance.now(); clearTimeout(idle); idle = setTimeout(finish, 1500); }
        }
      });
      let wsError = null;
      ws.addEventListener('error', (e) => { wsError = e.message || e.type; });
      ws.addEventListener('close', (ev) => {
        clearTimeout(idle);
        // An unclean close after the last audio still leaves every commit in hand; one mid-stream is a failure.
        if (!tLastAudio) return reject(new Error(`socket closed at ${sentS.toFixed(2)} s of audio (code ${ev.code} ${ev.reason || ''} ${wsError ?? ''}); last messages ${JSON.stringify(msgs.slice(-2)).slice(0, 400)}`));
        if (wsError || ![1000, 1005].includes(ev.code)) lateErrors.push(`close ${ev.code} ${ev.reason || wsError || ''}`.trim());
        resolve({ config, msgs, commits, lateErrors, tail_ms: tFinal && tLastAudio ? Math.round(tFinal - tLastAudio) : null });
      });
      async function streamAudio() {
        const chunk = 3840; // 80 ms at 24 kHz, 16-bit mono
        for (let off = 0; off < pcm.length; off += chunk) {
          const last = off + chunk >= pcm.length; // commit whatever is pending with the last chunk
          ws.send(JSON.stringify({ message_type: 'input_audio_chunk', audio_base_64: pcm.subarray(off, off + chunk).toString('base64'), commit: last, sample_rate: 24000 }));
          sentS = Math.min(off + chunk, pcm.length) / 2 / 24000;
          await sleep(80);
        }
        tLastAudio = performance.now();
        idle = setTimeout(finish, 8000); // hard stop if the final commit never answers
      }
    });

    const all = result.commits.flatMap((c) => c.words);
    const words = realWords(all);
    const out = {
      provider: 'eleven-rt', variant: `vad${silence}${has('--lang') ? '-lang' : ''}`, clip: name, config: result.config,
      // Detected per commit, so a one-word turn ("Oui.") can come back as another language: keep them all.
      language_code: [...new Set(result.commits.filter((c) => c.text.trim()).map((c) => c.language_code))].join('/') || null,
      transcript: result.commits.map((c) => c.text).join(' ').replace(/\s+/g, ' ').trim(),
      commits: result.commits.filter((c) => c.text.trim()).map(({ audio_s, text, language_code }) => ({ audio_s, text, language_code })),
      late_errors: result.lateErrors,
      tail_ms: result.tail_ms, words: all, timing: timing(words), low_logprob: lowLogprob(words), messages: result.msgs,
    };
    save(`${name}.eleven-rt.${out.variant}.json`, out);
    console.log(`${name}/${out.variant} (final commit ${out.tail_ms} ms after last audio, ${out.language_code}): ${out.transcript}`);
    console.log(`  commits at ${out.commits.map((c) => `${c.audio_s}s`).join(', ')}${out.late_errors.length ? `; after the audio: ${out.late_errors.join('; ')}` : ''}`);
  }
}

// Speech rate and intra-turn pauses from word timestamps (the cues Gradium's segment timestamps cannot give).
function timing(words) {
  if (words.length < 2) return { words_per_s: null, span_s: null, pauses: [] };
  const span = words[words.length - 1].end - words[0].start;
  const pauses = [];
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (gap >= 0.5) pauses.push({ after: words[i - 1].text, before: words[i].text, gap_s: Number(gap.toFixed(2)) });
  }
  return { words_per_s: Number((words.length / span).toFixed(2)), span_s: Number(span.toFixed(2)), pauses };
}

// Gradium's docs promise segment timestamps only, but in practice (smoke test 10-23) each `text` is one word or
// two, and its start_s is the previous segment's stop_s: a pause hides inside the segment after it. So a segment
// lasting ≥ 1 s means the speaker paused before that word. The first segment also holds the lead-in silence, so
// it is left out of both the rate and the pauses.
function segmentTiming(segments) {
  const timed = segments.filter((s) => typeof s.start_s === 'number' && typeof s.stop_s === 'number');
  if (timed.length < 3) return { words_per_s: null, span_s: null, pauses: [] };
  const rest = timed.slice(1);
  const words = rest.reduce((n, s) => n + s.text.split(/\s+/).filter(Boolean).length, 0);
  const span = rest[rest.length - 1].stop_s - rest[0].start_s;
  const pauses = rest.filter((s) => s.stop_s - s.start_s >= 1).map((s) => ({ before: s.text, span_s: Number((s.stop_s - s.start_s).toFixed(2)) }));
  return { words_per_s: Number((words / span).toFixed(2)), span_s: Number(span.toFixed(2)), pauses };
}

// ---- synth: a clip the speaker can't perform, in a Gradium voice ------------
// Same REST TTS call as the Mirror voice spike (~/Cowork/career/companies/gradium/spike). Writes clips/<name>.wav,
// which `convert` then treats like a recording (a real clips/<name>.m4a still wins). Synthetic audio is clean and
// Gradium may read its own TTS more easily, so give the clip a `source` note in reference.json.
// Each ⏸ becomes 2 s of real silence: the pieces between pauses are rendered separately and spliced.
async function synth() {
  need(GRADIUM_KEY, 'GRADIUM_API_KEY');
  const voice = flag('--voice');
  if (!voice) { console.error('synth needs --voice <gradium voice id>'); process.exit(2); }
  for (const name of clipNames) {
    const r = ref[name];
    // `tts_text` spells words phonetically for the voice (e.g. "PR" the English way); scoring stays on `reference`.
    const pieces = (r.tts_text ?? r.reference).split(/\s*⏸\s*/).map((p) => p.trim()).filter(Boolean);
    const rendered = [];
    for (const piece of pieces) rendered.push(await gradiumTts(piece, voice, r.language));
    const rate = rendered[0].rate;
    const silence = (s) => Buffer.alloc(Math.round(rate * s) * 2);
    // 1 s lead-in (Gradium STT drops a word at 0.0 s) and tail; 2 s for each ⏸.
    const audio = Buffer.concat([silence(1), ...rendered.flatMap((x, i) => (i ? [silence(2), x.pcm] : [x.pcm])), silence(1)]);
    writeFileSync(path.join(CLIPS, `${name}.wav`), wavFromPcm(audio, rate));
    console.log(`${name}: ${voice} → clips/${name}.wav (${(audio.length / 2 / rate).toFixed(1)} s at ${rate} Hz, ${pieces.length} piece${pieces.length === 1 ? '' : 's'})`);
    console.log(`  text sent: ${pieces.join(' ⏸ ')}`);
  }
}

async function gradiumTts(text, voice, language) {
  const res = await fetch('https://api.gradium.ai/api/post/speech/tts', {
    method: 'POST', headers: { 'x-api-key': GRADIUM_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ text, voice_id: voice, output_format: 'pcm', model_name: 'default', only_audio: false, // localized clones: ≤300 chars, REST only
      json_config: JSON.stringify({ temp: 0.5, rewrite_rules: language }) }), // a JSON-encoded string on REST
  });
  if (!res.ok) throw new Error(`TTS HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  let rate = 48000;
  const pcm = [];
  for (const line of (await res.text()).split('\n')) {
    const t = line.trim().replace(/^data:\s*/, '');
    if (!t) continue;
    const m = JSON.parse(t);
    if (m.type === 'ready' && m.sample_rate) rate = m.sample_rate;
    else if (m.type === 'audio') pcm.push(Buffer.from(m.audio, 'base64'));
    else if (m.type === 'error') throw new Error(`TTS error ${JSON.stringify(m)}`);
  }
  return { rate, pcm: Buffer.concat(pcm) };
}

// ---- report -----------------------------------------------------------------
const norm = (s) => s.toLowerCase().normalize('NFC').replace(/[’`]/g, "'").replace(/[.,!?;:()\[\]"«»…⏸]/g, ' ').replace(/\s+/g, ' ').trim();
const hit = (transcript, phrase) => new RegExp(`(^|[^\\p{L}\\p{N}])${norm(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}\\p{N}])`, 'u').test(transcript);

function report() {
  const files = readdirSync(OUT).filter((f) => f.endsWith('.json'));
  const totals = {};
  for (const name of clipNames) {
    const r = ref[name];
    console.log(`\n=== ${name} (${r.language}) — ${r.persona}\n    said: ${r.reference}`);
    if (r.source) console.log(`    source: ${r.source}`);
    // Markers the take on disk doesn't actually contain (a slip while recording): left out of every score.
    const unscored = new Set((r.unscored ?? []).map(norm));
    if (unscored.size) console.log(`    unscored: ${r.unscored.join(', ')} (${r.unscored_why ?? 'not in this take'})`);
    const results = files.filter((f) => f.startsWith(`${name}.`)).sort().map((f) => JSON.parse(readFileSync(path.join(OUT, f), 'utf8')));
    for (const o of results) {
      const label = `${o.provider}${o.variant ? '/' + o.variant : ''}`;
      const t = norm(o.transcript ?? '');
      let kept = 0, total = 0;
      const lines = [];
      for (const [group, items] of Object.entries(r.planted ?? {})) {
        const marks = items.filter((p) => !unscored.has(norm(p)))
          .map((p) => { const ok = hit(t, p); total++; kept += ok ? 1 : 0; return `${ok ? '✓' : '✗'} ${p}`; });
        if (marks.length) lines.push(`  ${group}: ${marks.join('   ')}`);
      }
      for (const c of (r.corrected ?? []).filter((c) => !unscored.has(norm(c)))) lines.push(`  ${hit(t, c) ? `✗ auto-corrected to "${c}"` : `✓ "${c}" absent (not normalised)`}`);
      totals[label] = totals[label] ?? { kept: 0, total: 0, clips: 0 };
      totals[label].kept += kept; totals[label].total += total; totals[label].clips += 1;
      const timingBits = [o.wall_ms ? `${o.wall_ms} ms` : null, o.tail_ms != null ? `final text ${o.tail_ms} ms after last audio` : null].filter(Boolean).join(', ');
      console.log(`\n  [${label}] ${total ? `${kept}/${total} planted markers kept` : ''}${timingBits ? ` · ${timingBits}` : ''}`);
      console.log(`  → ${o.transcript}`);
      for (const l of lines) console.log(l);
      if (o.language_code) console.log(`  language: ${o.language_code}${o.language_probability != null ? ` (p=${o.language_probability})` : ''}`);
      if (o.commits?.length) console.log(`  VAD commits (where the agent takes the turn): ${o.commits.map((c) => `${c.audio_s}s ${c.language_code ?? ''} "${c.text}"`).join(' | ')}`);
      if (o.timing?.words_per_s) console.log(`  timing: ${o.timing.words_per_s} words/s over ${o.timing.span_s} s; pauses ≥0.5 s: ${o.timing.pauses.map((p) => `${p.gap_s}s after "${p.after}"`).join(', ') || 'none'}${r.pause_after ? ` (planted after "${r.pause_after}")` : ''}`);
      if (o.provider?.startsWith('gradium') && o.segments?.length) {
        const g = segmentTiming(o.segments);
        if (g.words_per_s) console.log(`  timing (segments): ${g.words_per_s} words/s over ${g.span_s} s; segments ≥1 s (pause before the word): ${g.pauses.map((p) => `${p.span_s}s before "${p.before}"`).join(', ') || 'none'}${r.pause_after ? ` (planted after "${r.pause_after}")` : ''}`);
      }
      if (o.audio_events?.length) console.log(`  audio events: ${o.audio_events.join(', ')}`);
      if (o.low_logprob?.length) console.log(`  lowest logprob: ${o.low_logprob.map((w) => `${w.text} ${w.logprob}`).join(', ')}`);
      // Recomputed from the saved steps so a fix to summarizeVad applies to runs already on disk.
      const vad = o.steps?.length ? summarizeVad(o.steps, o.segments ?? []) : o.vad;
      if (vad) console.log(`  semantic VAD: ${vad.steps} steps, horizons ${JSON.stringify(vad.horizons_s)}; max inactivity between the first word and the last segment ${vad.max_inactivity_before_last_segment}; recipe would have cut the turn at ${vad.would_have_cut_turn_at_s.length ? vad.would_have_cut_turn_at_s.join(' s, ') + ' s' : 'no point'}${r.pause_after ? ` (planted pause after "${r.pause_after}")` : ''}`);
      if (o.segments?.length) console.log(`  segments: ${o.segments.map((s) => `[${s.start_s}–${s.stop_s ?? '?'}] ${s.text}`).join(' | ')}`);
    }
  }
  console.log('\n=== planted markers kept, all clips ===');
  // Variants run on different clip sets (keywords/keyterms only where English is planted): compare like with like.
  for (const [label, t] of Object.entries(totals)) console.log(`  ${label.padEnd(28)} ${t.kept}/${t.total}  (${t.clips} clip${t.clips === 1 ? '' : 's'})`);
  console.log('\nDecision rule: README.md § Decide.');
}

// ---- main -------------------------------------------------------------------
const run = { convert, synth, 'gradium-rest': gradiumRest, 'gradium-ws': gradiumWs, 'eleven-batch': elevenBatch, 'eleven-rt': elevenRt, report,
  all: async () => { await gradiumRest(); await gradiumWs(); await elevenBatch(); } };
if (!run[cmd]) { console.error('usage: node spike.mjs synth --voice <id> | convert | gradium-rest | gradium-ws | eleven-batch | all | report [--clip name] [--env file]'); process.exit(2); }
await run[cmd]();
