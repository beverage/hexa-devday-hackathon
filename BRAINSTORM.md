# Impact track brainstorm

Sat 24 Oct 2026 · Alex Beverage · the same content as the shared Claude doc, for teammates on Codex.

The build decision is open for one 30-minute pass, then closed. The incumbent is the pitch below; whatever wins
keeps the assets and the rules, and the first commit follows within the hour.

## The incumbent

**Customer service that meets you at your level.** Millions of people in France deal with their energy bill, their
job search or their bank in a language that is not their first, and the call centre answers everyone in the same
French at the same speed. Our voice agent reads how you speak, adapts its level and register turn by turn, and when
you don't follow, says it again simpler and slower, instantly, without changing what it decided. OpenAI decides what
to say; Levelang decides how to say it.

Impact topics it claims: disability inclusion (the instant re-say is comprehension accessibility), affordable
essentials (an electricity bill turned into a payment plan instead of a cut-off), new opportunities (a job interview
in Germany). Not claimed: climate, even with energy as the setting.

## Assets any pivot must keep

A pivot that keeps these costs a Saturday morning. A pivot that drops them costs the weekend, and finalists are picked
Sunday night.

| Asset | What it does today | Proven |
| --- | --- | --- |
| Levelang render | Text and speech at four levels and two registers in French, German, Italian, Mandarin, Cantonese, Japanese; deployed API and MCP server | In production |
| Transcription with learner evidence | ElevenLabs Scribe v2 keeps fillers, restarts and grammar slips the detector needs; realtime for the turn, batch for the judge | Spike, 23 Oct: 21 of 21 planted markers kept in batch |
| Voice output layer | Provider interface with Gradium live and ElevenLabs slot ready; stock voices, no clone | Built for Mirror voice, 18 Oct |
| OpenAI brain and judge design | Fast model drafts in English and holds the tools; a judge updates the caller's level from quoted evidence; a strong model plays simulated callers offline | Designed, not yet timed |
| Deploy path | Fly.io or Vercel, one URL, no sign-in | Used on earlier hacks |

Rules that travel with the assets: one URL where the demo completes, text loop first and voice on top, press-play
callers so a remote judge never needs a microphone, a Saturday 22:00 freeze as the submission floor, a fallback video
Sunday afternoon.

## How we build: the agentic groundwork

The groundwork is already in the repo, and it is the same file every coding agent reads, so four people on Codex or
Claude Code work as one team rather than four. Proposal: **Alex leads the dev**, owns the spine and the repo
conventions, and the other three own a seam each, end to end.

| In place | What it gives the team |
| --- | --- |
| One orientation file, `AGENTS.md`, imported by `CLAUDE.md` | Codex and Claude Code read the same brief, rules and pointers; a new teammate's agent is oriented in one read, no onboarding call |
| Five planning files: brief, idea, demo, checklist, decisions | The plan lives in the repo, not in heads; the decisions log (D-001 to D-014) records every choice with its why, so nothing is re-argued on Sunday |
| Levelang as an MCP server, deployed | The coding agent calls the render while building; the agent we ship calls the same API; one contract, no mocks |
| Spike harness pattern | The transcription spike ran as a scripted pipeline with planted markers and a written decision rule; the detector spike reuses it today |
| Per-repo rules in the Levelang repos | Each repo carries its own hard constraints; product changes go on a branch with a recorded decision, so the weekend cannot break production |
| Deploy path and the hosting-first rule | A URL exists before product code does; the demo completes on the page the judge lands on |

How four people work it:

1. Every agent reads `AGENTS.md` first. Codex CLI is pointed at the Levelang MCP server; verifying that with one call
   is this morning's first task.
2. One owner per seam, and two writers never share files: the agent loop (brain, judge, tools), the console page,
   voice in and out, evaluation and pitch.
3. A decision goes into the log with its why within the hour it is made. Small commits, main always deployable,
   22:00 freeze tonight as the submission floor.
4. The lead dev reviews merges, keeps the log and the checklist, and holds the spine; everyone else ships their seam
   without waiting.
5. The groundwork is also the build-in-public entry: the public repo with `AGENTS.md` and the decisions log is the
   devlog, and a Codex workflow from founders is exactly the story the Codex Ambassadors judging us are primed for.

## Criteria, in order

A candidate that fails the first test is out, whatever it scores on the rest.

1. **Two or more impact topics by its setting**, not by its slide. Judges should see the topic in the demo before
   anyone names it.
2. **An immediate product.** A judge uses it on the landing page without a microphone or a sign-in, and a business
   could switch it on Monday.
3. **Text loop end to end by tonight.** Voice, video and polish come Sunday; the freeze at 22:00 is the submission
   floor.
4. **OpenAI visibly the brain.** The model decides what to say and reads the caller; the event rule is also the story.
5. **Splits across four people** without two of us in the same files: agent, page, voice, evaluation and pitch are
   natural seams.

Tie-break: the candidate with the strongest single moment in a two-minute demo.

## Candidates

Two candidates pass the criteria; a third is the two combined and only works with four people.

| Candidate | What the judge sees | Topics by setting | Immediate product | Text loop tonight | Main risk |
| --- | --- | --- | --- | --- | --- |
| **Keep the agent** | A caller fumbles, the agent re-says it simpler and slower; the caller turns fluent, the agent follows; the same deal in every cell | Essentials, assistive, jobs | Yes: an endpoint any voice agent points at, plus the console | Yes, already specced | Latency on the voice turn (4.5 to 5 s); the detector is unproven |
| **Letters at your level** | Photograph an official letter from the energy supplier, the housing office or the job centre; the page says what it says, what to do and by when, at your level, in your language, read aloud | Essentials, assistive, jobs | Yes: anyone with a phone uses it Monday; press-play becomes sample letters | Yes, and lower risk: no realtime voice | Reads as a reader, not an agent; OpenAI is less visible unless the "what to do" is agentic (book, pay, reply) |
| **Both as one product** | The letter leads to the call, or the call ends with the letter, on one page | Same | Yes | Only with four people splitting cleanly | Two surfaces on one landing page; the demo must stay one flow |

Same spine in all three: OpenAI reads the input and decides what to say in English; Levelang renders it at the
person's level; a judge keeps the level estimate. Only the input channel changes.

## Rejected, one line each

- **Anything that reads as language learning.** Levelang is a calibration product, not a learning product; the
  framing is refused on purpose.
- **An interpreter between the caller and a real service.** French-to-French simplification is not supported, and
  two-party audio is a new build.
- **Mirror voice as the spine.** Its one assistive angle, voice banking, has no OpenAI role; it already lost once when
  the payoff was not on the landing page.
- **Any climate claim.** Energy is the setting, not the impact.
- **Anything that drops Levelang.** Thirty hours, finalists Sunday night.

## Agenda, 30 minutes

Voice-record from the first minute. Decide once.

| Minutes | What | Output |
| --- | --- | --- |
| 0 to 10 | People: what each of us builds or brings, who is at Hexa Monday evening, who has an audience | The team table below, filled |
| 10 to 25 | Candidates against the criteria, in order; a candidate that fails test 1 is dropped on the spot | One winner, or the incumbent confirmed |
| 25 to 30 | Write the decision, name the owner of each seam, agree the first commit | Decision recorded in `DECISIONS.md`; first commit within the hour |

One question to settle early: does anyone have reach? With an audience on the team, build-in-public moves from
artefacts only to a scored track, and that changes who posts and when.

## Team, fill in your row

| Name | Builds or brings | At Hexa Monday 18:00 | Audience or community you can post to |
| --- | --- | --- | --- |
| Alex | Levelang, the agent spine, voice and transcription | Yes | None yet |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
