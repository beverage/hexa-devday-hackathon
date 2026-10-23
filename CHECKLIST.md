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
- [ ] Which OpenAI model(s) have tuned Levelang prompts: `llc db language fra -L beginner --instruction -m <model>`
      or `GET /api/v1/admin/models` → note them in `IDEA.md` § 6
- [ ] Read `levelang-backend/supabase/functions/chat/index.ts` end to end; note what to keep for the agent spine

## Saturday 24 Oct

- [ ] 09:45 voice recorder running; 10:00 kickoff (link in the calendar); questions in the chat
      (`BRIEF.md`); redeem the kickoff credits
- [ ] 10:30 build decision recorded in `DECISIONS.md` (spine, page, provider, what is cut); strategist once
- [ ] 11:30 first commit of product code; URL live
- [ ] Detector spike: tests (2) and (4) from `IDEA.md` § 2 — a text-only judge on Levelang outputs at each level
      plus hand-written learner turns; a 20-turn timing table for draft + render
- [ ] Agent loop: OpenAI draft → Levelang render (current cell + neighbours) → judge update → next turn, text in / text out
- [ ] Console page: transcript, English draft, rendered cells with the chosen one highlighted, level/register meter
- [ ] `context` field in `levelang-backend` (branch) **or** consistency carried in the agent prompt — decide by 14:00
- [ ] Scripted failed-renewal conversation (8 turns) runs end to end; beats (1) and (2) visible
- [ ] **Freeze 22:00: the text demo is the submission floor.** Commit, deploy, check from a logged-out browser

## Sunday 25 Oct

- [ ] Morning: voice in (the spike's provider) and out (stock voice) on the same page; filler phrase on slow turns
- [ ] Press-play mode: three pre-recorded callers (hesitant learner, fluent formal, Franglais) play through the agent
- [ ] Evaluation: run the simulated callers, score the detector against the planted markers; numbers for the slide
- [ ] Optional beats if ahead: Stripe test payment link + QR; follow-up email at the same register; Mirror voice 20 s
- [ ] 15:00 feature freeze. Two-minute video: person-with-a-problem first, then beats (1), (2), the console, the numbers
- [ ] Submit whatever Sunday night asks for (from the kickoff); check URL and repo logged out; fallback video linked
- [ ] Write the outcome line in `~/Cowork/career/companies/hexa/notes.md` and a `log.md` entry

## Monday 26 Oct

- [ ] 17:30 at 12 rue Martel; laptop, charger, headphones, external mic, phone hotspot; the video on the phone too
- [ ] If finalist: 2-minute live demo (mic beat), console on the screen, fallback video ready
- [ ] Hexa people and the ambassadors: introductions; LinkedIn QR
- [ ] If it wins: DevDay Exchange Paris, Wed 28 Oct from 14:00
