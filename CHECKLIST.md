# CHECKLIST

"Done when" is the check that proves the item works. An account on its own is not done.

## Tonight (Fri 23 Oct)

- [x] ElevenLabs: redeem the Accel codes; API key into the repo-root `.env` as `ELEVENLABS_API_KEY` (Scribe v2
      batch answered on all five smoke clips, 10-23)
- [x] OpenAI: redeem the Accel $50; `OPENAI_API_KEY` in the same file; one chat completion from this folder works
      (`gpt-5.4-nano`, 10-23; the key also sees `gpt-transcribe`, `gpt-live-transcribe`, `gpt-4o-transcribe`, `whisper-1`)
- [x] **STT spike** (`stt-spike/README.md`): record 5 clips → `convert` → `all` → `report` → decision line at the
      top of its README. Done when D-003 in `DECISIONS.md` is no longer "pending" → **D-007: ElevenLabs** (1 real
      clip, 3 synthesized in the clone; `de-learner` not recorded)
- [ ] Codex CLI installed and signed in; Codex MCP config pointing at the Levelang MCP server, verified by one
      `translate` call (the Codex-workflow story needs this to be real)
- [ ] Message Boris via "Contact the host" with the two rules questions (text in `BRIEF.md`)
- [ ] `git init` here; first commit (this folder); decide public/private after the kickoff answers the submission question
- [ ] Deploy target chosen and warm: Fly.io `cdg` (Levelang's home) or Vercel; a hello-world page is live at a URL
- [x] Which OpenAI model(s) have tuned Levelang prompts: `llc db language fra -L beginner --instruction -m <model>`
      or `GET /api/v1/admin/models` → note them in `IDEA.md` § 6 → **none usable**: GPT prompts failed under test,
      render stays on Gemini (D-010)
- [ ] Read `levelang-backend/supabase/functions/chat/index.ts` end to end; note what to keep for the agent spine

## Saturday 24 Oct

- [ ] 09:45 voice recorder running; 10:00 kickoff (link in the calendar); questions in the chat
      (`BRIEF.md`); redeem the kickoff credits
- [x] Kickoff: tracks (impact · build in public · hardware), "tracks compound", "graded as an immediate product" →
      `BRIEF.md`; the two rules questions and the submission format: write the answers into `BRIEF.md`
- [x] 10:30 build decision recorded in `DECISIONS.md` → **D-011 impact reframe** (spine unchanged; electricity
      supplier, job interview, person-first pitch), **D-012 build in public**, **D-013 team roles**
- [x] Slide facts checked with caveats (INSEE 7.7 M immigrants 2024 · EAA since 28 Jun 2025 · FALC) → `IDEA.md` § 0
- [x] Team of four formed at the kickoff (D-014); names, roles, Monday attendance and reach → `BRIEF.md`
- [ ] 30-minute team brainstorm on impact, voice-recorded; D-014 closed with the build decision (pitch kept or
      pivot) in `DECISIONS.md`; then the first commit and the URL
- [ ] **Build in public (D-012), ≤ 1 h total:** public repo live (this folder scrubbed of internal paths and voice IDs,
      or a new one) with `DECISIONS.md` as the devlog and `AGENTS.md`; post 1 (the build decision; tag Hexa and the
      ambassadors; event channel) by 13:00; post 2 (the text loop) after the 22:00 freeze
- [x] URL live: https://hexa-devday-hackathon.vercel.app (hello-world with the tagline, Vercel, 11:50); first commit of
      product code: `agent/CONTRACT.md`, `agent/fixtures/scenario-1.json`, `agent/probe-draft.mjs`, `web/index.html`
- [x] Draft leg timed (`IDEA.md` § 2, measured 24 Oct): nano 1.28 + 0.92 s, mini 0.68 + 0.99 s; mini is the default brain
- [x] Render leg timed on staging (`IDEA.md` § 2, 12:05): fra ~2.0 s a cell, 3 cells in parallel 2.15 s; **deu beginner
      9 s, ita beginner 6.5 s** (backend follow-up for the Levelang backlog)
- [ ] Detector spike: test (2) from `IDEA.md` § 2 — a text-only judge on Levelang outputs at each level
      plus hand-written learner turns; a 20-turn timing table for draft + render
- [ ] Agent loop: OpenAI draft → Levelang render (current cell + neighbours) → judge update → next turn, text in / text out
- [ ] Console page: transcript, English draft, rendered cells with the chosen one highlighted, level/register meter
- [ ] `context` field in `levelang-backend` (branch) **or** consistency carried in the agent prompt — decide by 14:00
- [ ] Scripted rejected-direct-debit conversation (`DEMO.md` scenario 1, 8 turns) runs end to end; beats (1) and (2)
      visible; 142 € and 47,33 € survive the beginner render
- [ ] **Freeze 22:00: the text demo is the submission floor.** Commit, deploy, check from a logged-out browser

## Sunday 25 Oct

- [ ] Morning: voice in (the spike's provider) and out (stock voice) on the same page; filler phrase on slow turns
- [ ] Press-play mode: the three `DEMO.md` scenarios, recorded by Alex turn by turn, play through the agent
- [ ] Evaluation: run the simulated callers, score the detector against the planted markers; numbers for the slide
- [ ] Posts 3 (voice, morning) and 4 (URL + video, after submission) (D-012)
- [ ] Optional beats if ahead: Stripe test payment link + QR; confirmation email at the same register; Mirror voice
      20 s (a beat at most, D-011)
- [ ] 15:00 feature freeze. Two-minute video: person-with-a-problem first (tagline and impact topic in the first
      15 s), then beats (1), (2), the console, the numbers, the honesty lines (`IDEA.md` § 0)
- [ ] Submit whatever Sunday night asks for (from the kickoff); check URL and repo logged out; fallback video linked
- [ ] Write the outcome line in `~/Cowork/career/companies/hexa/notes.md` and a `log.md` entry

## Monday 26 Oct

- [ ] 17:30 at 12 rue Martel; laptop, charger, headphones, external mic, phone hotspot; the video on the phone too
- [ ] If finalist: 2-minute live demo (mic beat), console on the screen, fallback video ready
- [ ] Hexa people and the ambassadors: introductions; LinkedIn QR
- [ ] If it wins: DevDay Exchange Paris, Wed 28 Oct from 14:00

## After

- [ ] **Downgrade ElevenLabs Creator → Free before Mon 23 Nov** (next invoice $26.40, ~20:11 Paris). Calendar
      reminder Fri 20 Nov 10:00, with an email the day before. Done when the subscription page shows the pending
      change to Free
