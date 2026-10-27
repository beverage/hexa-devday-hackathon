# STT provider spike — Gradium vs ElevenLabs Scribe v2 (before Sat 24 Oct 11:00)

**Decision 2026-10-23: ElevenLabs Scribe v2 for input (D-007).** Verbatim kept 21/21 planted markers on the four
French clips against 17/21 for Gradium's best legs. On the one real take (`fr-beginner`) it kept 6/6 against 3–4/6:
Gradium dropped every "euh" and turned the English gap-fill into French-looking words ("Cancelmon Paramount");
on Franglais it lost "PR" both ways ("l'APR", "la pillard") even on its own TTS. Not measured: three of the four
clips are synthetic (Alex's Gradium clone, a home-field edge for Gradium) and `de-learner` is not recorded.

**Realtime is weaker than batch (18/21, two runs, same misses):** on the real take it drops "veux" from the false
start and rewrites the register slip "tu peux" as "vous pouvez", and on Franglais it writes "PIAR". Fillers, English
jargon and fluent features survive, and its lowest logprobs land on exactly the rewritten words ("vous" −2.2,
"pouvez" −1.7, "PIAR" −0.82). With a 1.5 s silence threshold it never cut the hesitant caller (one commit, at the
end) and committed 7 of 8 real turn ends on time across two runs; final commit 0.1–0.4 s after the audio (once
1.3 s). Per-commit language detection is noise on one-word turns ("Oui." → it, "D'accord." → en): pin
`language_code`. **So: realtime drives the live turn (agent reply, turn-taking); batch re-reads each committed turn's
audio for the detector** (~1–1.6 s, off the reply path, since the judge runs in the background anyway).

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

A clip you can't perform convincingly can be rendered instead (done for `fr-fluent-formal` on 10-23, in Alex's
localized clone): `node spike.mjs synth --clip fr-fluent-formal --voice vox_emb_hIesT0mkjkIS3A7u` writes
`clips/fr-fluent-formal.wav` with a second of silence at each end (gitignored: it is Alex's voice). Clean TTS audio,
and Gradium may read its own TTS more easily, so it is a control that fluent features survive, not a test of real
fluent speech; its `source` field in `reference.json` says so, and the report prints it. A recorded `.m4a` wins.

## 2. Run (20 min)

```bash
node spike.mjs convert                    # m4a (or a synth wav) → clips/wav/*.wav (24 kHz mono 16-bit, plain PCM header)
node spike.mjs gradium-rest               # plain + keywords variants per clip
node spike.mjs gradium-ws                 # real-time paced; keeps the VAD trace (add --fast to skip pacing)
node spike.mjs eleven-batch               # verbatim default, word timestamps, auto language
node spike.mjs eleven-rt                  # Scribe v2 Realtime, paced, VAD commits (--silence 1.5, --lang to pin)
node spike.mjs report
```

Optional variants: `--any` (Gradium `language:"any"` on the Franglais clip), `--keyterms` (ElevenLabs term
boosting, +20%), `--clean` (ElevenLabs `no_verbatim`, as a contrast to see what "cleaning" removes), `--lang`
(force `language_code` instead of auto-detect). `--clip fr-beginner` runs one clip.

**Smoke-tested 2026-10-23 (Code session)** on synthetic clips made with macOS `say` (Jacques, Anna) from the
reference texts: every leg and variant (`gradium-rest`, `gradium-ws` paced and `--fast`, `eleven-batch` with
`--clean` and `--keyterms`) and `report` run end to end. Scribe returns punctuation as `word` tokens, now filtered
out of rate, pauses and logprob. Synthetic speech says nothing about learner evidence (`say` speaks English with a
French accent, and Gradium REST hears its "euh" as "peu"), so none of those transcripts count; only the recordings do.

Two fixes from the first real recording (`fr-beginner`, 10-23): from an AAC source `afconvert` writes
`WAVE_FORMAT_EXTENSIBLE`, which Gradium REST answers with an empty 200, so `convert` now rewrites a plain PCM header;
and the semantic-VAD summary counted lead-in silence as a cut, so it now starts after the first word (the recipe only
flushes once there is a transcript) and `report` recomputes it from the saved steps.

The **ElevenLabs realtime leg** (`eleven-rt`, added 10-23) needs no SDK: a raw WebSocket to
`wss://api.elevenlabs.io/v1/speech-to-text/realtime` with the `xi-api-key` header, `audio_format=pcm_24000`,
`commit_strategy=vad`, `include_timestamps` and `include_language_detection`; `input_audio_chunk` messages of 80 ms,
the last one with `commit: true`. Each committed segment brings word timestamps (continuous across commits) and
`logprob`, both undocumented-to-unknown before. The server closes with 1005/1006 after the final commit; harmless.
Partials (saved since 10-23) show where the "tu peux" rewrite happens: the partial reads "tu peux m'aider ?" ~0.8 s
after it is said, and ~1 s later, when "Euh, merci" arrives, the model re-decodes it to "vous pouvez" in the same
time slots, and that is what gets committed. The session echoes an undocumented `max_tokens_to_recompute: 5`, but
the server ignores it as a query parameter (`--recompute 0` and `1` both came back 5, same rewrite). So a word that
changes between partial and commit, or has a logprob under −1, is the cue to trust the batch re-read for that turn.
Two more knobs tried on the four French clips (10-23): `--commit turn_prediction` is refused ("not supported by
model_id 'scribe_v2_realtime'", the only realtime model), so silence-based VAD is the only automatic turn end; and
`--secondary en` (`secondary_languages=en`, echoed back) changed nothing: same transcripts, still "PIAR", 18/21.
Across three fr-short runs VAD at 1.5 s committed 11 of 12 real turn ends on time, about 2–2.7 s after the last word.
In the browser, use a single-use token (`?token=`) instead of the key.

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
