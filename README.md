# CallAble

**Your voice, your choice.**

[![Live: callableai.app](https://img.shields.io/badge/live-callableai.app-0B6E69?style=for-the-badge)](https://www.callableai.app) [![CI](https://img.shields.io/github/actions/workflow/status/jermiah/404-brainnotfound/ci.yml?branch=main&style=for-the-badge&label=CI)](https://github.com/jermiah/404-brainnotfound/actions/workflows/ci.yml) ![DevDay Exchange, Paris 2026: second place](https://img.shields.io/badge/DevDay_Exchange_Paris_2026-🥈_2nd_place-1D1D1F?style=for-the-badge) [![Code: jermiah/404-brainnotfound](https://img.shields.io/badge/code-jermiah%2F404--brainnotfound-1D1D1F?style=for-the-badge&logo=github&logoColor=white)](https://github.com/jermiah/404-brainnotfound) [![Built with Codex](https://img.shields.io/badge/built_with-Codex-1D1D1F?style=for-the-badge)](https://github.com/jermiah/404-brainnotfound/blob/main/AGENTS.md)

![OpenAI Realtime](https://img.shields.io/badge/OpenAI_Realtime-1D1D1F?style=for-the-badge) ![LiveKit](https://img.shields.io/badge/LiveKit-1D1D1F?style=for-the-badge&logo=livekit&logoColor=white) ![Twilio](https://img.shields.io/badge/Twilio-1D1D1F?style=for-the-badge) ![TypeScript](https://img.shields.io/badge/TypeScript-1D1D1F?style=for-the-badge&logo=typescript&logoColor=white) ![Fastify](https://img.shields.io/badge/Fastify-1D1D1F?style=for-the-badge&logo=fastify&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-1D1D1F?style=for-the-badge&logo=supabase&logoColor=white) ![Fly.io](https://img.shields.io/badge/Fly.io-1D1D1F?style=for-the-badge&logo=flydotio&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-1D1D1F?style=for-the-badge&logo=vercel&logoColor=white) ![Composio](https://img.shields.io/badge/Composio-1D1D1F?style=for-the-badge) ![Clerk](https://img.shields.io/badge/Clerk-1D1D1F?style=for-the-badge&logo=clerk&logoColor=white)

CallAble makes the phone calls you can't, or interprets them live. You approve every step.

> **🥈 Second place** at the DevDay Exchange Community hack, Paris, October 2026. This repo is the showcase. The
> code, specs and full docs live at **[jermiah/404-brainnotfound](https://github.com/jermiah/404-brainnotfound)**,
> and the app at **[callableai.app](https://www.callableai.app)**.

**[Join the waitlist →](https://www.callableai.app)** · Made with ❤️ in Paris by **404 Brain Not Found**: Alex
Beverage, Jermiah Jerome, Sundaravel Selvaraj and Thamimul Ansari, at the DevDay Exchange Community hack, 24–26 October
2026.

![The CallAble home dashboard with a call goal, Translate with Me and Call for Me controls, and suggested call topics](docs/images/home-dashboard.png)

**Watch the CallAble demo** · 4 minutes · Click to play and enable sound.

https://github.com/user-attachments/assets/20903223-2918-4a3e-b67b-a3a1c878c754

## Call for Me

> **Surrounded by a violent crowd during a protest in France.** In this scenario, someone is stuck inside a
> restaurant and cannot explain what has happened to the police. They don't know the address or how to share
> their location.

1. They type what has happened and approve the call to the police.
2. CallAble introduces itself as an AI assistant calling with their permission and explains their situation in French.
3. When the officer asks for the exact address, the app asks the user to share their current phone location.
4. With their permission, the app obtains the phone's coordinates. Google Maps resolves those coordinates to a
   street address, which CallAble shares with the officer as the phone's location at the time it was captured.
5. If the officer asks whether they are injured, the user can answer in the app by tapping **Yes** or **No**, or
   typing a reply. CallAble relays their answer without requiring them to speak.

```mermaid
flowchart TD
  A["You type a goal"] --> B["CallAble drafts a plan"]
  B --> C{"You approve the plan<br/>and the number?"}
  C -- "no" --> X["Nothing is dialled"]
  C -- "yes" --> D["The assistant calls<br/>and says it's an AI"]
  D --> E{"Asked for something<br/>personal?"}
  E -- "no" --> I["The call goes on"]
  E -- "yes" --> F{"Approval card"}
  F -- "approve" --> G["Said on the call"]
  F -- "reject or correct" --> H["Withheld, or said in your words"]
  G --> I
  H --> I
  I --> J["End call, any time"] --> K["Summary and next steps"]
```

## Translate with Me

> **Jordan doesn't speak French.** His electricity bill has gone up, and he wants to sort it out himself.

1. Jordan speaks English in his browser.
2. The representative hears French on an ordinary phone.
3. Jordan hears the answers in English and reads both sides as captions.
4. Stuck for words, he types a rough sentence. **Express Clearly** makes it clear, and he approves it before it's said.

```mermaid
flowchart TD
  A["You choose Translate with Me<br/>and check your microphone"] --> B{"You approve the number?"}
  B -- "no" --> X["Nothing is dialled"]
  B -- "yes" --> C["The representative hears, in French,<br/>that an AI interpreter is on the line"]
  C --> D["You speak English"]
  D --> E["They hear French"]
  E --> F["They answer in French"]
  F --> G["You hear English<br/>and read both sides as captions"]
  G --> D
  G --> H{"Stuck for words?"}
  H -- "yes" --> I["Type a rough sentence"]
  I --> J["Express Clearly rewrites it,<br/>with the French"]
  J --> K{"You approve it?"}
  K -- "yes" --> L["Spoken in French"]
  K -- "edit or reject" --> D
  L --> F
  G --> M["End call, any time"]
  M --> N["Captions kept in your History"]
```

The representative only ever hears the translation, never Jordan's own voice.

## Always

- Nothing is dialled until you approve.
- You choose, detail by detail, what may be shared. Anything else asks first, and never times out.
- The AI says it's an AI.
- **End call** always works.
- No payments, contracts, passwords or bank details. Ever.
- No call audio is recorded. Your profile and history stay in your browser.
- Not for emergencies: call 112, or contact 114 by text if you can't speak or hear.

Built for keyboard and screen reader, without speaking. Not yet audited for accessibility.

[Terms](https://www.callableai.app/legal/terms.html) · [Privacy](https://www.callableai.app/legal/privacy.html) ·
[CGU](https://www.callableai.app/legal/cgu.html) · [Confidentialité](https://www.callableai.app/legal/confidentialite.html)

## Architecture

### System

```mermaid
flowchart LR
  subgraph WEB["Your browser"]
    UI["Web app<br/>Expo · Vercel"]
  end
  subgraph FLY["Fly.io · Paris"]
    API["Control API"]
    W["Media worker"]
  end
  UI -- "HTTPS + live events" --> API
  UI -- "WebRTC" --> UR[("LiveKit<br/>your room")]
  API <-- "tool requests, results<br/>and call control" --> W
  W <--> UR
  W <--> SR[("LiveKit<br/>phone room")]
  SR -- "SIP" --> TW["Twilio"] -- "phone network" --> REP["📞 Representative"]
  W <-- "audio + tool calls" --> RT["OpenAI Realtime"]
  W --> EL["ElevenLabs (optional)"]
  API --> DB[("Supabase · EU")]
  API <-- "plans, rewrites,<br/>document reading, summaries" --> RESP["OpenAI Responses API"]
  API <-- "lookup task + sourced answer" --> AG["OpenAI Agents API<br/>saved lookup agent"]
  AG <-- "user-scoped MCP<br/>Drive via backend reader" --> CP["Composio"]
  CP <--> GOOGLE["Google Drive · Gmail<br/>Calendar · Maps<br/>read-only tools"]
```

Two rooms. The media worker is the only participant in both. The API never touches audio.

### In-call lookup path

Realtime requests a lookup through a tool call. The media worker forwards it to the Control API, which checks
consent and starts the saved agent through the OpenAI Agents API. The agent uses the user's connected Composio
tools. The backend validates the sourced answer and disclosure permission before the worker returns it to
Realtime to say on the call. Realtime does not open an Agents API session or call Composio directly.

```mermaid
sequenceDiagram
  participant RT as OpenAI Realtime
  participant W as Media worker
  participant API as Control API
  participant U as User in app
  participant AG as OpenAI Agents API
  participant CP as Composio / Google tools
  RT->>W: Lookup tool call
  W->>API: Tool request
  opt Request needs user input or consent
    API->>U: Ask question or show approval
    U->>API: Answer or approve
  end
  API->>AG: Authorized lookup task
  AG->>CP: Read from selected connected source
  CP-->>AG: Source contents
  AG-->>API: Sourced answer
  Note over API: Validate evidence and disclosure permission
  API-->>W: Approved result, when available
  W-->>RT: Tool result
  Note over RT: Say only the approved answer
```

Drive lookups pass through the backend's scoped document-reader MCP proxy, which calls Composio and uses the
Responses API to read supported PDFs and images when needed. Gmail, Calendar and Maps lookups use their
source-specific Composio MCP connection. For current location, the app supplies user-authorized device coordinates;
Maps resolves them to an address. Pending lookups return a status while the call waits for consent or a result.

### Translate audio path

```mermaid
flowchart LR
  subgraph UR["Your room"]
    MIC["Your mic"]
    EAR["Your speaker"]
  end
  subgraph SR["Phone room"]
    PHONE["Representative"]
  end
  MIC --> W1["Worker"] --> T1["gpt-realtime-translate<br/>EN → FR"] --> PHONE
  PHONE --> W2["Worker"] --> T2["gpt-realtime-translate<br/>FR → EN"] --> EAR
```

Only translated audio crosses rooms. One translation session per direction.

### Call lifecycle

```mermaid
stateDiagram-v2
  [*] --> draft
  draft --> prepared: plan ready
  prepared --> authorized: you approve
  authorized --> dialing
  dialing --> ringing
  dialing --> connected: answered
  ringing --> connected: answered
  ringing --> declined: no answer
  dialing --> declined: no answer
  dialing --> ending: End call
  connected --> ending: End call
  ending --> ended
  connected --> ended: they hang up
  prepared --> cancelled: you cancel
  ended --> [*]
  declined --> [*]
  cancelled --> [*]
```

The API owns call state. One transition table. Any state can fail; nothing redials on its own.

### Approval gate

```mermaid
sequenceDiagram
  participant R as Representative
  participant A as Voice agent
  participant API as Control API
  participant U as You
  R->>A: "What's your customer number?"
  A->>API: request: share customer number
  API->>U: approval card, exact text
  A->>R: "One moment, I'm checking."
  U->>API: Approve
  API->>A: release the value
  A->>R: says the number
  Note over API: Every decision is written to the audit log.
```

The model asks. Code decides. You approve.

### Models

| Job | Model |
|---|---|
| Call for Me voice | `gpt-realtime-2.1`, voice *marin* |
| Hearing the representative | `gpt-realtime-whisper` |
| Live interpreting | `gpt-realtime-translate` |
| Express Clearly rewrite | `gpt-5.4`, Responses API |
| Plan, invoice reading, summary | `gpt-5-mini`, Responses API |
| Lookups in Gmail, Drive, Calendar, Maps | Saved agent, OpenAI Agents API |

Amounts and dates are formatted by code, never by a model.

### Spec-driven development with Codex

```mermaid
flowchart LR
  A["AGENTS.md"] --> S["Feature skill"] --> P["spec.md<br/>acceptance criterion"] --> T["Test first"] --> C["Change"] --> V["verification.md<br/>evidence"]
  H[".codex/hooks.json<br/>no secrets · no keys · no stray deletes"] -. "guards" .-> C
```

We built feature by feature, using specs to coordinate our team and multiple coding agents. The team brainstormed
with ChatGPT and Codex, defined the architecture, then split implementation into workstreams: call control and
approvals, telephony and media, AI sessions, and the frontend.

[AGENTS.md](https://github.com/jermiah/404-brainnotfound/blob/main/AGENTS.md) was the shared starting point for Codex and Claude Code. It gives each agent the same
product context, document precedence, feature routing and verification rules. When we spun up coding agents for
separate workstreams, they followed that shared map and the matching [feature skill](https://github.com/jermiah/404-brainnotfound/tree/main/.agents/skills). The coding
tools launch the agents; `AGENTS.md` tells them how to work together and where their task belongs.

The development contract runs from the [constitution](CONSTITUTION.md), through the
[product requirements](https://github.com/jermiah/404-brainnotfound/blob/main/callable-docs/CallAble_PRD_v1.md) and
[technical architecture](https://github.com/jermiah/404-brainnotfound/blob/main/callable-docs/CallAble_Technical_Architecture_v1.md), to the individual feature spec.
[DECISIONS.md](https://github.com/jermiah/404-brainnotfound/blob/main/DECISIONS.md) records changes to scope and shared contracts; [ROADMAP.md](https://github.com/jermiah/404-brainnotfound/blob/main/ROADMAP.md) tracks
what is ready to build and what is actually verified.

Each of the eleven [feature folders](https://github.com/jermiah/404-brainnotfound/blob/main/specs/README.md) keeps its development record together:

| File | Purpose |
|---|---|
| `spec.md` | Intended behavior, acceptance criteria, boundaries and failure cases |
| `plan.md` | Implementation approach, dependencies and experiments |
| `tasks.md` | Small, ordered implementation steps tied to acceptance criteria |
| `verification.md` | Checks actually run, their results, evidence and remaining limitations |

For example, [F05 Call for Me](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F05-call-for-me/spec.md),
[F06 Translate with Me](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F06-translate-with-me/spec.md) and
[F07 Context Intake](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F07-context-intake/spec.md) each have their own spec, plan, tasks and evidence.
Agents work from an acceptance criterion, test the behavior, make a small change, and record what the check proved.
Simulated checks stay labelled simulated. Work follows the gates: media proof → Call for Me → translation →
context and safety → demo polish, with independent dashboard work alongside them.

Shared skills and guard hooks live in [`.agents/`](https://github.com/jermiah/404-brainnotfound/tree/main/.agents). This gave the coding agents a consistent workflow
for permissions, secrets and verification across the repository, while the team reviewed and integrated their work.

## Status

A private, invitation-only prototype built in a weekend. English and French only. What's proven on a real call and
what's simulated: [honesty slide](pitch/honesty-slide.md), [ROADMAP.md](https://github.com/jermiah/404-brainnotfound/blob/main/ROADMAP.md).

## Before the pivot

This repo started as Alex's prep for the weekend: a customer-service voice agent that meets the caller at their
level, with OpenAI deciding what to say and [Levelang](https://www.levelang.app) deciding how to say it. At
Saturday's team brainstorm we chose CallAble instead, and the build moved to
[jermiah/404-brainnotfound](https://github.com/jermiah/404-brainnotfound). The prep files are kept in
[`pre-pivot/`](pre-pivot/README.md).

## How we built it

Paris times, from the team's account and the merge log.

**Saturday 24 October**

- 🛒 **Around noon · Discussing the idea at a Monoprix.** The library was closed, so that is where we started.
- **13:00 · Shaping our first idea.** We explored the problem and what CallAble could do.
- **14:00 · The idea was settled; architecture came next.** Our team brainstormed with Codex and ChatGPT,
  working through the call flow, permissions and the tools described above to derive the architecture.
- ☕ **At La Felicità at Station F, we started building**, in public from the first commit.
- 17:53 · Baseline: constitution, specs, call controller, approval gate.
- 18:25 · Voice spike: `gpt-realtime-2.1` asked before agreeing on 16 of 16 test calls.
- 🚪 **19:00 · Evicted from La Felicità.** We carried on remotely for the evening.
- 19:58 · **First real phone call**, through LiveKit and Twilio.
- 20:22 · The Expo app, and calls saved to Supabase.
- 23:26 · Call for Me's voice agent, its tools behind the approval gate.

**Sunday 25 October**

- 01:04 · API and media worker live on Fly.io in Paris. Personal workspace and history.
- 02:12 · **Translate with Me**: two OpenAI translation sessions per call.
- 02:55 · Google connections through Composio.
- 🏠 **Day two at Station F's Flatmates**, all the way through the night.
- 12:13 · Express Clearly, then the post-call summary.
- 13:44 · Two demo stories take shape: an electricity-bill conversation and a police assistance scenario.
- 18:13 · Live at [www.callableai.app](https://www.callableai.app).
- 19:22 · First real Gmail lookup, on a fictional demo inbox.
- **Through the afternoon and evening · Testing Agents API orchestration through Composio.** We worked through
  Google Drive document retrieval, Gmail questions, Google Maps address resolution from user-approved phone
  coordinates, and Calendar lookups for appointments and booking details. We tested the request, tool result,
  approval and answer paths, and investigated failures using the session traces. Calendar access remained read-only.
- 20:29 · The Ink and Glass look.
- 22:01 · The assistant can ask you a question in the app mid-call.
- 23:07 · A landing page with a scripted demo call.
- 23:59 · Terms and privacy policy, in English and French.

**What stood out: OpenAI's Agents API.** Having a managed agent runtime was a huge help over a two-day build.
OpenAI manages the agent sessions, orchestration, context compaction and recovery. We could focus on connecting
tools and building the approval flow without building and operating our own agent execution service. That made
the infrastructure side of growing the agent workload much simpler. Our application still runs its own control
API, media worker and permission checks. See the [Agents API overview](https://developers.openai.com/api/docs/guides/agents-api/overview).

**Monday 26 October**

- 18:00 · Finale at Hexa.
- 🥈 **Second place.**

## Run it

Clone [jermiah/404-brainnotfound](https://github.com/jermiah/404-brainnotfound), then:

```sh
npm install
npm run dev
```

Node.js 24+. Add `?simulate` to the URL for a scripted call: no keys, no phone calls. Live setup:
[docs/DEVELOPMENT.md](https://github.com/jermiah/404-brainnotfound/blob/main/docs/DEVELOPMENT.md).

## Contribute

Issues and pull requests go to [jermiah/404-brainnotfound](https://github.com/jermiah/404-brainnotfound).

[AGENTS.md](https://github.com/jermiah/404-brainnotfound/blob/main/AGENTS.md) · [CONSTITUTION.md](CONSTITUTION.md) · [specs](https://github.com/jermiah/404-brainnotfound/blob/main/specs/README.md) · [DECISIONS.md](https://github.com/jermiah/404-brainnotfound/blob/main/DECISIONS.md) ·
[docs/DEVELOPMENT.md](https://github.com/jermiah/404-brainnotfound/blob/main/docs/DEVELOPMENT.md)

No open-source licence yet: all rights reserved.
