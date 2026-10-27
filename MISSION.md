# CallAble mission

*Copied from [jermiah/404-brainnotfound](https://github.com/jermiah/404-brainnotfound/blob/main/MISSION.md) on 27 October 2026. The original is the source of truth.*

**Your voice. Your choice.** Verified in English and French, and built to be language-agnostic. Source: PRD §1 to
§4, §11, §12. This file is the short form. The PRD governs where they differ.

## Problem

Essential services still run on telephone calls. People are shut out when they cannot speak comfortably, do not
share the representative's language, or cannot put a complex request into words. The facts they need are often
scattered across invoices and messages. Today they depend on another person to speak or interpret for them, which
costs them independence and exposes their personal information.

## Target users

| Segment | Barrier | Need |
|---|---|---|
| Non-speaking people, or people with speech difficulties | Cannot reliably convey information by voice | Type or approve what a trusted assistant says |
| People with limited proficiency in the local language | Cannot sustain a service conversation | Speak and hear in their own language |
| People who struggle to formulate complex requests | Know what they want, cannot express it clearly | Context-aware wording help they control |
| People navigating unfamiliar administration | Facts spread across documents | Accurate, authorized facts in one conversation |

**Demo persona.** An English-speaking resident of France receives an unexpectedly high electricity bill from a
fictional supplier. They have a synthetic PDF invoice. They cannot explain the problem in French and need to ask a
human representative why the bill went up and whether instalments are possible.

## Product promise

CallAble helps users take part in and complete essential phone conversations, not just translate sentences. It
never invents information, commitments or decisions. Every consequential step waits for the user.

## Core journeys

1. **Call for Me.** The user states a goal, uploads the invoice and approves a call plan and the destination. An
   OpenAI voice agent calls a real phone number and talks to a human. The user watches captions, answers approval
   cards, corrects or hangs up. A summary closes the call.
2. **Translate with Me.** The user speaks English in the browser. The representative hears French on an ordinary
   phone and answers in French. The user hears English and sees captions. Only translated audio crosses sides.
3. **Express Clearly.** The user's fragmented sentence becomes a clearer, faithful message. The user sees the
   original, the rewrite and the French rendering, then approves, edits or rejects it before it is spoken.

## Hackathon MVP (P0, demo on 26 October 2026)

FR-01 to FR-11 and FR-22 from PRD §5: accessible dashboard, one real outbound PSTN call, a shared call controller,
the Call for Me voice agent, Translate with Me, audio isolation, a synthetic invoice or typed profile as context,
the approval gate, Express Clearly, live captions, the post-call summary and provider capability validation before
dialing. OpenAI is the only live provider required.

## Non-goals for the demo

From PRD §3: replacing or intercepting the native cellular dialer, carrier integration or number porting,
production-grade banking, health or government authentication, automatic payments, contract consent or secret
disclosure, guaranteed accuracy across every language, autonomous long or parallel calling, and Google integrations
before the audio path is proven.

## Future production work (not this weekend)

P1: Google Drive, Gmail and Calendar connectors (FR-12 to FR-14), persistent case history (FR-15), profiles and
preferences (FR-16), the Assisted and Delegated toggle (FR-17), response suggestions (FR-18), per-call provider
selection (FR-21) with Gemini or ElevenLabs adapters. P2: advanced assistive controls (FR-19) and broad connectors
(FR-20). Before real users: a GDPR basis, processing agreements, EU hosting, retention policy, recording consent,
residency review of the Agents API and accessibility validation (PRD §13).

## Success criteria

- **Product.** The user communicates the objective. Sensitive disclosures and commitments stay under their control.
  Facts and the requested outcome survive translation and rewriting. The task is possible without speaking or
  without French. The user can see what was said and correct it. (PRD §12)
- **Technical.** Dial-out and hangup are reliable. Zero raw-audio bypasses in 10 test calls. Translation delay P50
  under 1.5 s after a finished utterance, P95 inspected. Hangup works in every induced model failure. No invented
  amounts in scripted tests. 100% of test-sensitive actions require confirmation. (PRD §9; provisional targets, not
  vendor guarantees)

## Demo outcome

A 2 to 3 minute rehearsal that works repeatedly (PRD §10 G5, §11): the synthetic bill on screen, the typed goal, a
call plan with approved facts, a real call answered on another phone, the agent visibly respecting one approval,
a short Translate with Me exchange in English and French, one fragmented sentence turned into a clear French
message after approval, and the outcome summary. If G1 fails, the demo shrinks to one verified mode with a
controlled telephone participant and says so.
