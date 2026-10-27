# Before the pivot

This folder holds the prep repo as it stood at 14:08 on Saturday 24 October 2026, the morning the hackathon
started. It is kept as history. Nothing here describes what we shipped.

The idea we came in with was a customer-service voice agent that meets the caller at their level: OpenAI decides
what to say, and [Levelang](https://www.levelang.app) decides how to say it, calibrated to the caller's
proficiency in the language. It had three demo scenarios: an electricity payment plan, a negotiated purchase, and a
job interview.

At Saturday afternoon's team brainstorm we chose CallAble instead. Levelang first kept a role on the user's side of
the call, then gave way to the product requirements the team adopted later that day. The decisions are recorded in the
[CallAble decision log](https://github.com/jermiah/404-brainnotfound/blob/main/DECISIONS.md), rows D-015 to D-021.

| Path | What it was |
|---|---|
| `BRIEF.md` | The event: clock, rules, prize, hosts and open questions for the kickoff |
| `IDEA.md` | The original idea and the state of each thread on Saturday morning |
| `DEMO.md` | The pitch and the three scenarios |
| `BRAINSTORM.md` | The frame for Saturday's team brainstorm |
| `CHECKLIST.md`, `DECISIONS.md` | The prep checklist and decisions D-001 to D-014 |
| `AGENTS.md`, `CLAUDE.md` | Orientation for the coding agents |
| `agent/` | The agent contract, the first scenario fixture and draft and render probes |
| `stt-spike/` | The speech-to-text spike that picked ElevenLabs Scribe v2 |
| `web/` | The hello-world page once served at hexa-devday-hackathon.vercel.app |
