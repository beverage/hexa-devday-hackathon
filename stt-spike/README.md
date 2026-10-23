# STT provider spike — Gradium vs ElevenLabs Scribe v2 (before Sat 24 Oct 11:00)

Written Fri 2026-10-23 17:30 by Claude (Cowork) for the Code session. Decides one thing: **which speech-to-text
feeds the level/register detector in the Hexa / DevDay hack**, so the build starts at 11:00 Saturday with no
provider question open. Same shape as `../../gradium/spike/`: throwaway, Node, no dependencies, ~75 minutes.

Context: the agent is "the model decides what to say, Levelang decides how to say it", with a background judge
reading the caller's level and register from their turns. The judge works mostly from transcript text, so the
provider question is really: **which transcriber keeps the evidence?** Fillers, false starts, grammar errors and
English gap-fills are the detector's ceiling evidence; word timing gives speech rate and hesitation; a language
switch is an interaction signal. A transcriber that quietly cleans all that up leaves the detector blind.
No clone is involved: the agent speaks in a stock voice (a service agent in the caller's own voice is uncanny).

What the docs say each provides (read 2026-10-23; the spike checks the parts the docs leave open):

| | Gradium | ElevenLabs Scribe v2 / v2 Realtime |
|---|---|---|
| Transcript | segments: `text`+`start_s`, `end_text`+`stop_s`; documented as segment-level only, but observed (smoke test) as one word, sometimes two, per segment, each `start_s` = the previous `stop_s` | words: `text`,`start`,`end`,`type` (word/spacing/audio_event); realtime only on committed segments with `include_timestamps` |
| Fillers / false starts kept | **undocumented** → spike | `no_verbatim` (default false) "removes filler words, false starts, and disfluencies", so default is verbatim → spike confirms |
| Grammar errors kept vs auto-corrected | undocumented → spike | undocumented → spike |
| Per-word confidence | none | `logprob` per word (batch; not documented for realtime) |
| Language detected | `language:"any"` auto-detects, no output field documented | `language_code` + `language_probability` (batch); per committed segment in realtime with `include_language_detection` |
| Hesitation / end of turn | **semantic VAD** `step` every 80 ms, `inactivity_prob` per horizon (0.5/1/2/3 s) → spike checks it doesn't cut a hesitation | VAD only as a commit trigger (`vad_silence_threshold_secs` 0.3–3.0, `vad_threshold`), no signal stream |
| Mixed language in one utterance | undocumented ("set the dominant language") → spike | undocumented → spike |
| Term boosting | `keywords` ≤500, `boost` −6..6 (3 recommended), no spaces, accent-sensitive | `keyterms` (realtime ≤50 × 20 chars; +20%) |
| Languages | en fr de es pt | 90+ incl. all six Levelang languages |
| Latency | 80 ms steps; `delay_in_frames` 16 ≈ 1.3 s context | ~150 ms claimed |

## 0. Prerequisites (10 min)

- `~/Code/Apps/hackathon/.env` already has `GRADIUM_API_KEY` (≈118k credits left on 10-18; STT costs 3 credits/s,
  this spike is ≈1–2k). Put `ELEVENLABS_API_KEY` in the repo-root `.env`; the script reads that first, then the
  hackathon file for anything left empty.
- ElevenLabs: redeem the Accel codes first (110k credits per participant) so the key has quota; Scribe is billed
  per hour of audio, so the spike costs almost nothing either way.
- macOS `afconvert` is used for conversion (built in).
- Copy this folder somewhere outside the career folder if you prefer (`~/Code/Apps/hackathon/stt-spike`); the
  script only needs `clips/` next to it.

## 1. Record the five clips (15 min)

QuickTime Player → File → New Audio Recording, laptop mic, quiet room. Read each text in `clips/reference.json`
**exactly as written**: say the "euh"/"ähm", say the false start then the correction, say the errors as errors,
pause about two seconds where ⏸ is marked, then continue. Save as `clips/<name>.m4a`:

| Clip | Persona | What it tests |
|---|---|---|
| `fr-beginner` | hesitant beginner | fillers, false start, `la problème`, `tu peux`, English `cancel`, a 2 s mid-sentence pause |
| `fr-fluent-formal` | fluent, vous, conditionnel passé | that fluent features come through intact (floor evidence) |
| `fr-franglais` | fluent Franglais, fast | English jargon mid-sentence: kept as English, frenchified, or dropped |
| `de-learner` | German learner | same as fr-beginner in German (`das Zahlung`, `dieses Monat`, `ähm`) |
| `fr-short` | "oui / d'accord / je ne comprends pas / plus lentement" with long pauses | short turns; VAD behaviour across genuine turn ends |

Don't act the beginner by slowing down artificially; speak at your pace, the planted markers do the work.
**Leave about a second of silence after pressing record, before the first word**: in the smoke test, Gradium
dropped a first word that started at 0.0 s (both REST and WS) and kept it with 0.7 s of lead-in.

## 2. Run (20 min)

```bash
node spike.mjs convert                    # m4a → clips/wav/*.wav (24 kHz mono 16-bit)
node spike.mjs gradium-rest               # plain + keywords variants per clip
node spike.mjs gradium-ws                 # real-time paced; keeps the VAD trace (add --fast to skip pacing)
node spike.mjs eleven-batch               # verbatim default, word timestamps, auto language
node spike.mjs report
```

Optional variants: `--any` (Gradium `language:"any"` on the Franglais clip), `--keyterms` (ElevenLabs term
boosting, +20%), `--clean` (ElevenLabs `no_verbatim`, as a contrast to see what "cleaning" removes), `--lang`
(force `language_code` instead of auto-detect). `--clip fr-beginner` runs one clip.

**Smoke-tested 2026-10-23 (Code session)** on synthetic clips made with macOS `say` (Jacques, Anna) from the
reference texts: `convert`, `gradium-rest`, `gradium-ws` (paced and `--fast`) and `report` run end to end with no
fixes; the `x-api-key` header on Node's WebSocket is accepted. The ElevenLabs leg has **not run** (no key yet);
its form fields and response fields (`language_code`, `language_probability`, `words[].text/start/end/type/logprob`)
match the API reference. Synthetic speech says nothing about learner evidence (`say` reads "euh" as "peu"), so
none of those transcripts count; only the recordings do.

Not scripted, by choice: the **ElevenLabs realtime leg**. The batch call answers the detector questions (verbatim,
errors, language, logprob) and the docs settle what realtime adds or removes (timestamps only on committed
segments; `logprob` and audio events undocumented in realtime; `include_timestamps` cannot be combined with
`filter_background_audio`). If there are 20 spare minutes, `@elevenlabs/client` → `Scribe.connect({ token,
modelId: "scribe_v2_realtime", commitStrategy: "vad", includeTimestamps: true, audioFormat: PCM_16000 })` with
`connection.send({ audioBase64 })` chunks confirms the realtime word timestamps arrive.

## 3. Read the report (20 min)

For each clip, one block per provider/variant:

- **planted markers kept n/m** — the headline. Each ✗ is evidence the detector loses.
- **auto-corrected to "…"** — the transcriber fixed the learner's grammar. Fatal for ceiling evidence if it
  happens on most errors.
- **english** — Franglais handling: kept as English (good), replaced by a French word (bad: looks fluent),
  or dropped (bad: looks hesitant for the wrong reason). Compare Gradium `plain` vs `keywords`.
- **timing** — ElevenLabs: words/s and pauses ≥0.5 s from word timestamps; the planted pause should appear after
  the named word. Gradium, `timing (segments)`: no word onsets, but since each segment starts where the last one
  stopped, a pause shows up as a segment ≥1 s long, reported as "pause before" the word that follows it. Coarser,
  but it found both planted pauses in the smoke test, so compare the two before concluding Gradium has no signal.
- **lowest logprob** (ElevenLabs batch) — should land on the mangled or English words if it means anything.
- **semantic VAD** (Gradium WS) — `would have cut the turn at …`: if the 3-consecutive-steps-above-0.5 recipe
  fires inside `fr-beginner` or `de-learner` before the last segment, Gradium's turn-taking would have cut the
  caller off mid-hesitation. If it fires only in `fr-short` (real turn ends), the semantic VAD is doing its job.
- **language** (ElevenLabs) — `fra`/`deu` with high probability on the clean clips; watch what Franglais does.
- **final text … ms after last audio** (Gradium WS) and **wall ms** (REST/batch) — rough latency only.

Listen-and-read, not just numbers: open two transcripts side by side with the reference text.

## 4. Decide

1. **ElevenLabs for input** if it keeps ≥ ⅔ of the planted markers across the four French/German clips *and*
   the planted pauses show up in the word timing. Default pick: languages, the Accel credits, and the post-call
   batch pass (logprob, audio events, diarization) are all on this side.
2. **Gradium for input** if ElevenLabs auto-corrects most errors or drops the Franglais while Gradium keeps them
   (with or without `keywords`), or if ElevenLabs' auto language detection flips the French clips to English.
3. **If both clean the errors**, the detector leans on timing and interaction signals instead of grammar: then
   pick by whichever gives a usable hesitation signal (ElevenLabs word gaps vs Gradium `inactivity_prob`), and
   say so honestly on the evaluation slide.
4. **Tie → ElevenLabs.** Output voice is a separate choice and can stay Gradium (code-switching in synthesized
   French, TTS word timestamps for the console) or move to Eleven v4 (all six languages, delivery tags); the
   backend's `VoiceProvider` makes it a config change.
5. Contingency that no spike settles: if the kickoff says non-OpenAI voice is not allowed, the input becomes
   OpenAI transcription and the output OpenAI TTS; the detector design is unchanged, the cue inventory shrinks.

Write the decision as one line at the top of this README (date, provider, kept-markers score, one sentence why),
and carry it into the Levelang repo with `/decide` on Saturday, since it fixes the input contract for the
detector. The planted-marker list doubles as the first test cases for the detector's evidence rule.

## Sources (read 2026-10-23)

Gradium: https://docs.gradium.ai/guides/speech-to-text.md · https://docs.gradium.ai/guides/transcription-settings.md ·
https://docs.gradium.ai/guides/speech-to-text-overview.md · https://docs.gradium.ai/guides/recipes/turn-taking.md ·
https://docs.gradium.ai/api-reference/endpoint/stt-post.md · https://docs.gradium.ai/api-reference/endpoint/stt-websocket.md
ElevenLabs: https://elevenlabs.io/docs/overview/capabilities/speech-to-text.mdx · https://elevenlabs.io/docs/api-reference/speech-to-text/convert ·
https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/transcripts-and-commit-strategies.md ·
https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/event-reference.md ·
https://elevenlabs.io/docs/eleven-api/resources/libraries/scribe-stt/javascript-scribe.md · https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4.md
