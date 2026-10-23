# IDEA — a customer-service agent that calibrates to the caller's level and register

Pitch line: **"The agent decides what to say. Levelang decides how to say it."** A calibration layer any voice
agent can point its model setting at. Designed for Accel (22 Oct), scrapped there because that brief demanded
data-dependent agents on Aiven Runtime; back on the table here with an OpenAI brain. State as of Fri 23 Oct 17:30.

## 1. The spine (Saturday)

```
caller turn (text, later speech) ─▶ calibration endpoint
                                      ├─ OpenAI model drafts the reply in English, holds the tools (payment link)
                                      ├─ Levelang renders it in spoken-mode French at the caller's current level + register
                                      │     (current estimate ± one neighbour → 2–3 cells; chosen cell highlighted on the console)
                                      ├─ background judge updates the caller's estimate from the turn (floors/ceilings/confidence)
                                      └─ reply ─▶ caller (text, later TTS)
console (one page): transcript · English draft · the rendered cells · level/register meter · payment QR
```

- The endpoint receives the whole conversation every turn, so a level switch is a parameter change, not a
  re-read. Calibration directive goes **after** the history so the prompt-cache prefix survives the switch.
- **Existing skeleton to start from:** `levelang-backend/supabase/functions/chat/index.ts` — a multi-turn
  tool-calling assistant (Gemini via Vertex) that extracts level/mood/mode from the conversation and calls
  `translate` / `translate_compare` against the backend, with per-user turn limits. Swap the brain to an
  OpenAI model, replace "the user names the level" with the detector, and that is day one.
- Demo scenario: a **failed-renewal call**. (1) caller hesitates → agent simplifies and slows; (2) caller turns
  formal → agent follows; (3) agent sends a Stripe test-mode payment link, judge pays with 4242; (4) follow-up
  email lands in the same level and register (Levelang's Supabase email automation exists); (5) evaluation scores
  from the simulated callers. Stripe and email are stretch; (1), (2) and (5) are the pitch. Now scenario 1 of three
  in `DEMO.md` (with a negotiated purchase and a German shop → French call).

## 2. The detector (the unproven core; spike it Saturday morning)

Reversing Levelang is not a detector: Levelang's levels are production rules; detection runs on noisier evidence.

- **Per turn, per axis (level, register):** a floor (features used correctly: plus-que-parfait or conditionnel
  passé ⇒ ≥ intermediate; subjunctive after "bien que" ⇒ advanced+), a ceiling (errors in basic forms:
  agreement, gender, simple conjugation; hesitant gap-fills into English), a confidence, the **quoted evidence**
  (reuse the quality judge's rule: every claim quotes the words), and **"can't tell"** for short turns.
- Stock phrases are no evidence ("je voudrais", "pourriez-vous" are allowed at beginner in the French design doc).
  Production is a lower bound on comprehension. Franglais cuts both ways: jargon vs gap-filling.
- **Across the conversation:** running estimate per axis, start intermediate / vous; weight longer turns;
  **lower quickly, raise slowly** (one comprehension failure drops a level at once: asking to repeat, answering
  beside the question, switching to English, "plus lentement"; raising needs two or more turns); check
  comprehension directly (did the reply answer what was asked at level X?).
- **Register via policy, not mimicry:** French customer service defaults to vous; the estimate feeds a policy.
- **Signals available in-call:** transcript text (floors, ceilings, register, interaction moves) + rough timing
  (response latency, turn length, pauses, interruptions). Richer audio signals (speech rate, pause placement,
  pronunciation) only post-call → "feeds the next contact", an honest roadmap line. Account data and past
  emails/tickets are the best long-term signal.
- **Feasibility tests, in order:** (1) does the transcriber keep "euh", restarts and grammar errors → `stt-spike/`;
  (2) can a text-only judge place turns within one level (Levelang outputs at each level + hand-written learner
  turns); (3) do VAD/word timings give usable response latency; (4) draft + render ≤ ~2 s median, else the
  model comes off the turn path (the backend dropped Anthropic for latency once; time it).
- Language-design docs for the rubric: `~/Code/Apps/levelang/levelang-docs/languages/fra/design.md` and
  `expectations.md` (and `deu/`). The 19-category quality harness and dual judge live in `levelang-backend`.

## 3. Conversational context for Levelang (the product change)

Levelang is great with full context, not fragments; sentence-by-sentence rendering is out. Multi-turn is
needed so renders stay consistent (terms, tu/vous, pronouns) across the call.

- **History:** the old `session_id` pulled prior user turns from a 10-minute Redis store into the translation
  prompt as more text → repetitive, buggy output ("a disaster", BL-112). Switched off on text, left live on
  voice, then removed entirely in June (DEC-036, itself since superseded by DEC-047).
  `test_translate_text_does_not_assemble_prior_context` guards the path. **As of staging HEAD 2026-10-21
  nothing has moved**: no `context` field, no backlog item, no decision for the redesign.
- **Redesign (Accel thread, 10-21; not built):** optional `context` field on the request with the last 4–6 turns
  from both sides, framed as reference ("conversation so far, do not translate") with one `CURRENT_TEXT`; no
  session store, no `session_id`; the app never sends it, so its path and the regression test are untouched.
  Measure latency at 0/2/6 turns; score term and tu/vous consistency on a scripted 8-turn conversation; a hard
  pass/fail check that nothing from the context leaks into the output. ~2–3 h of backend work. Needs `/decide`
  (reverses part of DEC-036) and a backlog item.
- Decide Saturday whether it lands this weekend or the agent carries consistency in its own prompt for the demo.

## 4. Voice (Sunday morning)

- Input STT: decided by `stt-spike/` (D-003). Output: stock voice, no clone (D-001); Gradium for fr/de via the
  existing `VoiceProvider` (`levelang-backend/src/clients/voice/`, Gradium implementation, `supports(language)`
  for routing) or Eleven v4 (all six languages, delivery tags, 110k Accel credits); ElevenLabs and OpenAI slots
  in `VoiceProvider` are empty. Rule permitting non-OpenAI voice is a kickoff question.
- Cascade: STT → OpenAI draft → Levelang render → TTS, ≈ 2.5–4 s a turn; a filler phrase covers it; stream TTS.
- **Press-play mode:** three pre-recorded callers (hesitant learner, fluent formal, Franglais) the Sunday judge
  plays without a microphone; the live mic is Monday's beat.
- Pace in the voice: Gradium `padding_bonus` stretches gaps rather than words on short cells (spike finding), so
  per-level pace needs `<break>` tags or a bigger setting; Eleven v4 takes pace tags but "adherence is not
  perfect yet", no speed slider, no SSML.
- Backend already has streamed voice input: `WS /api/v1/translate/voice/stream`, one turn per socket (BL-173,
  contract in `levelang-docs/superpowers/specs/2026-10-09-voice-stream-protocol.md`).

## 5. Mirror voice as a beat (optional, proven)

voice.levelang.app + public repo `beverage/levelang-voice`: record 15 s → Gradium clone → Voice Localization →
each grid cell playable in your own voice, pace per level, accent picker. Proven 10-18 ("those are great").
Useful as a 20-second beat ("and when the customer speaks for themselves, the same calibration in their voice"),
not as the agent's voice. Lesson from its judging: the payoff must be on the landing page.

## 6. Narration angle: Levelang calibration on GPT

**Out for the weekend (D-010, 10-23):** the GPT render prompts failed under test and won't be tuned by the
deadline, so the render stays on Gemini and this line stays off the stage. The OpenAI story is the brain, the judge,
the evaluation and Codex instead: "OpenAI decides what to say and reads how you speak; Levelang decides how to say
it." The original idea, kept for after the weekend:

The backend supports OpenAI models with per-model prompts; the 19-category harness and dual judge can be pointed
at GPT models on the French set in about an hour. "Same prompt, three providers, here is who holds register in
German" is a line Codex Ambassadors understand, and it makes the OpenAI rule part of the product story rather
than a compliance box. Background task, not the spine.

## 7. Out of scope this weekend

Spanish (D-004) · the clone as the agent voice (D-001) · Lightdash / Modal / n8n extras · Mandarin, Cantonese,
Japanese voice · Pro clones · the MCP App widget as a demo surface (judges won't install Claude Desktop) ·
Levelang rendering on GPT models (§ 6, D-010).

## 8. Open questions

Kickoff rules (BRIEF.md) · does the `context` field land this weekend · Stripe and email beats in or out ·
exact OpenAI models for the brain and the judge (roles in D-010; pick from Saturday's draft and judge timing) ·
does a French draft via auto-detect beat the English draft (D-009) · one page: Expo web, the website, or a
standalone page in this repo. Decided 10-23: STT provider (D-007), response-config design (D-009).
