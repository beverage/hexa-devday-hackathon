# IDEA — a customer-service agent that calibrates to the caller's level and register

Tagline: **customer service that meets you at your level.** Tl;dr: millions of people in France deal with their
energy bill, their job search or their bank in a language that is not their first, and the call centre answers
everyone in the same French at the same speed. Our voice agent reads how you speak, adapts its level and register
turn by turn, and when you don't follow, says it again simpler and slower, instantly, without changing what it
decided. **OpenAI decides what to say; Levelang decides how to say it.** A calibration layer any voice agent can
point its model setting at. Designed for Accel (22 Oct), scrapped there because that brief demanded data-dependent
agents on Aiven Runtime; back on the table here with an OpenAI brain; aimed at the **impact track** since the
kickoff (§ 0, D-011). State as of Sat 24 Oct 11:00.

## 0. Tracks and framing (Sat 24 Oct, D-011)

The kickoff gave three tracks (`BRIEF.md`). The agent enters **impact** as its primary track and **build in public**
as a cheap second (D-012). Nothing in the spine changed; the settings and the first thirty seconds of the pitch did.

- **Topics claimed.** Disability inclusion as comprehension accessibility: the hero moment (a caller who did not
  follow gets the same reply re-said simpler and slower, instantly) is an assistive behaviour. Affordable essentials:
  scenario 1 is an electricity bill turned into a payment plan instead of a cut-off. New opportunities (jobs):
  scenario 3 is a job interview in Germany. **Not claimed:** climate, even with energy as the setting.
- **Facts for the slide**, checked 10-24, each with its caveat:
  - INSEE (Insee Première n° 2076, Oct 2025): **7.7 million immigrants in France in 2024** (7.6 M excluding Mayotte,
    11.2 % of the population; 6.0 M foreign nationals). Caveat: a large share is francophone, so the spoken pitch says
    "millions"; the slide shows the figure with the caveat.
  - **European Accessibility Act** (Directive (EU) 2019/882), applicable since **28 June 2025** to banking, e-commerce,
    electronic communications and transport services; microenterprises exempt. Caveat: it makes accessibility of these
    services a legal duty and asks support channels to inform about it; it does not prescribe plain-language calls.
    Cite as context, never as compliance.
  - **FALC** (facile à lire et à comprendre): the European easy-to-read rules from the 2009 Inclusion Europe
    "Pathways" project, adapted for France by Unapei and Nous Aussi, about 60 rules including review by people with
    intellectual disabilities. Caveat: Levelang *beginner* shares the sentence-level rules (short sentences, one idea
    each, common words) and none of the process rules. **Say "close to easy-to-read, not FALC-certified."**
- **Honesty lines** (evaluation slide): the demo caller is Alex performing a non-native speaker (a genuine one for
  the beginner turns if D-013 lands); no testing with disabled users yet; the detector has no test coverage until
  Saturday's spike.
- **Immediate product** (graded, per the kickoff): a deployed endpoint any voice agent points at, a live URL with no
  sign-in, press-play callers; one curl line on the console or the slide.

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
- Demo scenario: a **rejected direct debit at a fictional electricity supplier**, turned into a payment plan
  instead of a cut-off (D-011). (1) caller hesitates → agent simplifies and slows; (2) caller turns formal → agent
  follows; (3) agent sends a Stripe test-mode link for the first instalment, judge pays with 4242; (4) the
  confirmation email lands in the same level and register (Levelang's Supabase email automation exists); (5)
  evaluation scores from the simulated callers. Stripe and email are stretch; (1), (2) and (5) are the pitch.
  Scenario 1 of three in `DEMO.md` (with a negotiated purchase and a job interview in Germany → French).

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

### Measured 24 Oct 11:55: the draft leg (IDEA § 2 test 4, first half)

`agent/probe-draft.mjs`, scenario 1 turn 1, chat completions with the three scenario tools, streaming, 3 runs each,
median. Leg 1 = the model's first response (a `lookup_account` call every run); leg 2 = the English draft after the
tool result. `reasoning_effort: low` was rejected by both, so default effort.

| Model | Tool-call leg | Draft leg | Draft first token | Tool called |
|---|---|---|---|---|
| `gpt-5.4-nano` | 1.28 s | 0.92 s | 0.92 s | 3/3 |
| `gpt-5.4-mini` | 0.68 s | 0.99 s | 0.73 s | 3/3 |

So the draft path is **about 1.7 s (mini) to 2.2 s (nano) before the render**; with the 10-23 render (1.35–1.67 s a
cell) and the ~2 s realtime commit, a full turn lands around 5–6 s, in line with `DEMO.md`. Mini is faster where it
counts (the tool leg) at similar draft speed: the default brain unless cost says otherwise. Prompt note from the
samples: both drafts ask "would you like a plan?" instead of offering the three instalments and the link, and nano
writes an ISO date; the system prompt must say "offer, don't ask" and "dates in words". The Levelang MCP server on
Alex's machine could not reach its backend at 11:55 (it points at localhost), so the render was measured against
staging directly, below.

### Measured 24 Oct 12:05: the render leg on staging (test 4, second half)

`agent/probe-render.mjs` against `levelang-backend-staging.fly.dev`, the turn-1 draft (38 words), spoken, default
model (`gemini-3.1-flash-lite` on Vertex), 3 runs each, median.

| Cell | Median | Note |
|---|---|---|
| fra beginner/formal | 1.98 s | min 1.84, one outlier 2.90 |
| fra intermediate/formal | 1.99 s | |
| fra fluent/formal | 1.89 s | |
| fra fluent/casual | 1.67 s | *tu* throughout, numbers intact |
| fra beginner + intermediate + advanced in parallel | 2.15 s | the neighbour pre-render costs nothing extra |
| deu intermediate/formal | 2.18 s | single run |
| deu fluent/formal | 2.00 s | single run |
| **deu beginner/formal** | **9.3 s** | 7.3–10.9 s over five runs, pinned model no help |
| **ita beginner/formal** | **6.5 s** | single run, control |

Two findings. **French is ~0.4 s slower than on 10-23** (1.9–2.0 s a cell vs 1.35–1.67), so a French turn is draft ≈ 1.7–2.2 s
+ render ≈ 2.0 s + realtime commit ≈ 2 s: **about 6 s**, and the filler phrase is not optional. **The beginner cell in
German and Italian takes 4–5× longer** than every other cell, same model, same provider; French beginner is fine. That
is a backend matter for the Levelang backlog (the beginner prompt or a validation pass for those languages), not a
weekend fix. For scenario 3 it means the German beginner neighbour must start rendering the moment the first German
draft is done and may still land ~7–9 s later; the "Langsamer, bitte" re-say waits on it or falls back to the
intermediate cell slowed down. Quality check on the renders: 142 euros and "trois mensualités" survive at every level;
beginner splits the last sentence in two as designed.

**Follow-up 12:40, same prompts rebuilt and sent to Vertex directly** (`scratchpad/probe-backend-shape.py`,
`probe-levers.py`, 3 runs): the 9 s German beginner was **transient Vertex-side slowness**, not the prompt or the
backend; the same request on staging at 12:30 took 1.8 s and the rebuilt request from a laptop 1.4–1.7 s. Where the
time goes: the backend asks for a **transliteration of every render** (`TRANSLITERATION REQUIRED` for fra, deu, ita),
which triples the output (230 vs 76 tokens) and is the difference between 1.6 s and 0.8 s a cell in French, 1.4 s and
1.0 s in German. The agent never shows it. The **Vertex priority header** (`VERTEX_AI_PRIORITY`, unset on staging)
made no measurable difference in quiet conditions (1.61 vs 1.70 s); it is built for contention like the 12:05
episode, which is unverified. The AI Studio "422" is a **402: the AI Studio prepaid credits are depleted**; the
`GEMINI_PRIORITY` switch (`service_tier: priority`) is untestable until topped up. Proposed fix, a backend change: a
per-request opt-out of transliteration (default unchanged for the apps), which halves the render for the agent.

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
not as the agent's voice. Lesson from its judging: the payoff must be on the landing page. Decided 10-24 (D-011): a
beat at most, never the spine; its one assistive angle (voice banking for people losing their speech) has no OpenAI
role and thin new work.

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
Levelang rendering on GPT models (§ 6, D-010) · any climate claim (D-011) · Mirror voice as the spine (D-011).

## 8. Open questions

Team seams and owners (D-013) · kickoff rules (BRIEF.md) · does the `context` field land this weekend · Stripe and email beats in or out ·
exact OpenAI models for the brain and the judge (roles in D-010; pick from Saturday's draft and judge timing) ·
does a French draft via auto-detect beat the English draft (D-009) · one page: Expo web, the website, or a
standalone page in this repo. Decided 10-23: STT provider (D-007), response-config design (D-009). Decided 10-24: impact-track reframe (D-011),
build in public (D-012), team roles: everyone builds (D-013).
