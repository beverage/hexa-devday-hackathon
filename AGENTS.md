# Hexa × Codex Ambassadors — DevDay Exchange Community hack (Paris, 24–26 Oct 2026)

This folder is Alex Beverage's build for the hackathon. It is read by Claude Code (`CLAUDE.md` imports this
file) and by Codex (which reads `AGENTS.md` directly), so keep it the single orientation file.

## Read first, in this order

1. `BRIEF.md` — the event: clock, rule, prize, hosts, what is still unknown and must be asked at the kickoff.
2. `IDEA.md` — what we are building, why, and the current state of every thread (agent spine, detector,
   conversational context, voice, Mirror voice beat). Includes the existing assets to reuse.
3. `DEMO.md` — the three scenarios (support, negotiated purchase, German shop → French): beats, lines, tools,
   which runs live on Monday and which as press-play on Sunday night.
4. `CHECKLIST.md` — tonight, Saturday, Sunday, Monday. Tick items as you go.
5. `DECISIONS.md` — hackathon-local decisions. Product decisions that outlive the weekend go into the Levelang
   repo with `/decide` instead.
6. `stt-spike/README.md` — the speech-to-text spike; decided 10-23 as ElevenLabs Scribe v2, realtime + batch (D-007).

## The one rule of the event

Build with **Codex or the OpenAI API**. The brain of the agent is an OpenAI model. Everything else (Levelang,
voice providers) is allowed until the kickoff says otherwise; the two rules questions are in `BRIEF.md`.

## Who

Alex, solo unless a team forms at Saturday's online kickoff (teams ≤ 4). Background: Microsoft, Amazon,
Zalando, Criteo, then a founder journey. He runs the codebase; a partner, if any, takes design and pitch.
He speaks French; demo language is French with German as the second language.

## What we build on

**Levelang** — a proficiency-and-register calibration product, **not a language-learning product** (never say
"learners"; say "at your level"). It renders text and speech at a listener's level (beginner, intermediate,
advanced, fluent) and register (casual/formal; Japanese adds honorific) in six languages: fra, deu, ita, cmn,
yue, jpn. Always ISO 639-3 codes in code and docs.

The constellation lives at `~/Code/Apps/levelang/` (parent repo with `.product/` decisions and backlog,
`levelang-docs/` language design docs, skills) with the service repos beside it: `levelang-backend` (FastAPI,
Gemini + OpenAI providers with per-model prompts, Fly.io `cdg`), `levelang-mcp`, `levelang-mcp-app`,
`levelang-app`, `levelang-website`, `levelang-reader`. **Read each repo's own `CLAUDE.md` before touching it**,
and respect its rules (bash-command constraints, never `supabase config push`, never first-apply a migration
with psql, emoji commit prefixes).

Hackathon code that is not a Levelang product change lives **here**, in this repo. Product changes (the
`context` field, a new voice provider) go in the Levelang repos on a branch, with `/decide` where they reverse
or extend a recorded decision.

## Working rules (Alex's hackathon lessons, apply them)

- Voice-record from the first minute of the kickoff; the build decision is made within 30 minutes, once.
- First commit before 11:30 Saturday. Hosting is ready before product code is written.
- **The demo completes on the page the judge lands on.** One URL, no sign-in, no second surface. The Gradium
  challenge judges cloned a voice on voice.levelang.app and never crossed to levelang.app to hear it.
- Text loop end to end first (Saturday), voice on top (Sunday morning), press-play scripted callers so a remote
  judge never needs a microphone, fallback video Sunday afternoon. Finalists are chosen **Sunday night**.
- Judicious model and effort: strong model for the design pick and the judge; cheap fast model for the turn loop.
- Say what is measured and what is not. The detector has no test coverage yet; the evaluation slide shows numbers.

## Keys and credits

- New keys go in `.env` at this repo's root (gitignored, created 10-23 with empty `OPENAI_API_KEY`,
  `ELEVENLABS_API_KEY`, `GRADIUM_API_KEY`). Scripts read it first, then `~/Code/Apps/hackathon/.env` for any key
  left empty; that file holds `GRADIUM_API_KEY` (≈118k credits on 10-18). Never commit keys.
- Accel credits to redeem: ElevenLabs 110k, OpenAI $50. The kickoff hands out more credits Saturday.
- Gradium voice assets (from the Mirror voice spike, `~/Cowork/career/companies/gradium/spike/state.json`):
  localized clone General French `vox_emb_hIesT0mkjkIS3A7u` (unsaved candidate, REST only, ≤300 chars,
  expires 2026-11-17), Standard German `vox_emb_5htEvj3RSmHofpJh`. Flagship French voices Gaspard
  `iEu63s1rhn_kegTr`, Apolline `6oIkS98REoVZ1dEw`. **The agent does not speak in Alex's clone** (DECISIONS D-001).

## Where the notes are

Career folder `~/Cowork/career/`: `companies/hexa/2026-10-18-devday-community-hack-prep.md` (event research,
angles, risks), `companies/hexa/stt-spike/` (the same spike as here), `companies/gradium/` (Mirror voice
handoff + spike), `followups.md`, `log.md`. The Accel folder `~/Code/Apps/accel-hackathon/` has the platform
bootstrap pattern (deploy script, checklist) if a Runtime-style deploy is useful.
