# Honesty slide (AC-F11-13)

*Copied from [jermiah/404-brainnotfound](https://github.com/jermiah/404-brainnotfound/blob/main/pitch/honesty-slide.md) on 27 October 2026. The original is the source of truth.*

Which demo beats are real, which are simulated, which we do not show, and the evidence for each. Constitution 7.3 and
9.2 bind this page: **no beat is called real without a dated PASS in the linked `verification.md` row**, and a
simulated result is always labelled simulated.

State on 25 Oct 2026, after reading every `verification.md` on `main` (`18f987a`); rows 9 and 12 re-read on `main` at
`a184004`. The demo kit in `pitch/` is written; **no rehearsal of it has been run**, so no row below changes because of
it.

## 1. How to read it

- **Real:** observed on the real artifact (a real phone, the real API and worker, the real model) with a PASS in the row.
- **Simulated:** observed, but part of the stack was replaced. The row says what.
- **Not shown:** not built, or not verified well enough to show.
- A mode changes the label. Mode A (live app and a real phone) can only call a beat real once an APP rehearsal passed
  and its row says so. Mode B (operator console) and Mode C (demo mode) never call these beats real.

## 2. Beat by beat

PRD section 11 beats, plus our own. "Today" is the strongest label the evidence supports.

| # | Beat | Mode A: live app, real phone | Mode B: console, browser softphone | Mode C: demo mode | Evidence and limits |
|---|---|---|---|---|---|
| 1 | Show a synthetic French bill | Fictional document, shown as an image | same | same | [F07 AC-F07-1](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F07-context-intake/verification.md): the invoice generator is NOT RUN; the bill in `pitch/assets/` is hand-made and fictional, and the facts are hand-written fixtures (`apps/api/src/fixtures/lucioles-energie.ts`) |
| 2 | The user types a goal; CallAble prepares a plan and shows the facts and flags | Real UI and API; the plan is deterministic from the form (D-038), not model-planned | Not shown (terminal) | Simulated: a fixed plan whatever is typed | [F07 AC-F07-9](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F07-context-intake/verification.md): planning NOT RUN. [F09 AC-F09-2](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F09-call-dashboard/verification.md): PASS (simulated) |
| 3 | The user approves the call and CallAble dials | Today: **not real**. The app has not dialed a call: the public API smoke created a call and dialed nothing | Real dial with `--to`; with `--softphone`, nothing is dialed | Simulated: nothing is dialed | [F03 AC-F03-1 to 3](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F03-telephony-dialout/verification.md): PASS, 24 Oct 17:50 UTC, from the script, with a Node participant as the user. [F09](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F09-call-dashboard/verification.md) (25 Oct): sign-in and call creation PASS, no dial |
| 4 | The AI says first that it is an AI | Today: **real for the earlier wording only** | Simulated phone (softphone) | Simulated | [F05 AC-F05-3](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F05-call-for-me/verification.md): PASS on a real phone on 24 Oct 20:48 UTC for the earlier French line. The wording changed in D-037; the current English-first line was checked with the real model, not on a phone |
| 5 | The AI holds a conversation with only permitted facts (three turns) | Today: **not real**. No real-PSTN run | Simulated phone: PASS | Simulated | [F05 AC-F05-5](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F05-call-for-me/verification.md): PASS with SIP simulated (24 Oct 21:08 UTC), real PSTN NOT RUN. [AC-F05-7](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F05-call-for-me/verification.md) no invented amounts: NOT RUN |
| 6 | The approval card: the AI waits, the user decides, only then does the number leave | Today: **not real**. The gate has not run on a real call | Simulated phone: tested with a scripted worker, not yet in a live softphone run | Simulated | [F05 AC-F05-6](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F05-call-for-me/verification.md): PASS (simulated), real call NOT RUN. [F02 AC-F02-10](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F02-approval-gate/verification.md): NOT RUN. [F02 AC-F02-9](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F02-approval-gate/verification.md) and [F09 AC-F09-5](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F09-call-dashboard/verification.md): PASS in tests and in the simulated UI. The live web display of a card has not been seen |
| 7 | The AI refuses the IBAN and the payment plan | Today: **not real** | Simulated phone | Simulated | Tested in `apps/api/test/g2.test.ts` ([F05 AC-F05-6](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F05-call-for-me/verification.md), [F02 AC-F02-2, AC-F02-3](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F02-approval-gate/verification.md): PASS in tests). The model chooses which request to file: accepting a plan filed as a commitment is not caught (D-026 gap, use-case.md section 11) |
| 8 | Switch to Translate with Me (a second short call) | Today: **not real** | Simulated: PASS with synthetic speakers (G3 `--auto`); optional two-person softphone | Simulated: scripted turns | [F06 AC-F06-4, AC-F06-5](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F06-translate-with-me/verification.md): PASS (simulated); two people on a real phone NOT RUN. The interpreter can change words (F06 known limitations) |
| 9 | Express Clearly: a fragmented sentence becomes a clearer message the user approves | **Not shown**: built behind the API, but the web app has no screen for it | **Not shown**: possible from the G3 harness's `say` command, never run | **Not shown** | [F08](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F08-express-clearly/verification.md): built in the API and the media worker (D-047): the rewrite, the code check, the approval and the Eleven v4 Turbo voice. PASS in tests (simulated provider and speech); the PRD example passed the check 10/10 with the real model; one real voice render from the build Mac. No screen (`sendUtterance` is unused), never on a real call, never voiced by the deployed worker |
| 10 | End call | Real phone leg hangup PASS from the script; from the app NOT RUN | Real (console `end`), softphone leg removed | Simulated | [F03 AC-F03-3](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F03-telephony-dialout/verification.md): PASS. [F09 AC-F09-4](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F09-call-dashboard/verification.md): PASS (simulated UI) |
| 11 | The outcome summary | **Not shown** as a generated summary: F10 is not built. The app shows captions and decisions | Not shown | Simulated summary (labelled Demo mode) | [F10](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F10-post-call-summary/verification.md): every row NOT RUN. [F09 AC-F09-11](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F09-call-dashboard/verification.md): PASS (simulated summary, not F10) |
| 12 | "It's in my email": the AI finds the meter number in the customer's Gmail and asks before sharing it | Today: **not run**. Ready to rehearse as UC-T10G with the demo inbox: a team Gmail account holding only fictional mail. The Composio Gmail sign-in has never been tried | **Not shown**: the console's user has no Google connection, so it behaves as UC-T10 | **Not shown**: demo mode has no lookup | [F07 AC-F07-14, AC-F07-15](https://github.com/jermiah/404-brainnotfound/blob/main/specs/F07-context-intake/verification.md): PASS (automated, fake Composio and Agents API); real sign-in and lookup NOT RUN; UC-T10G NOT RUN; the lookup's time never measured. Never connect a real inbox: a found fact is not yet checked for secrets (fix in progress), and the demo inbox holds no bank details |

### The police follow-up (second use case)

State on 25 Oct 2026. Nothing was dialed; no real police number was called. No beat below is real.

| # | Beat | Mode A: live app | Mode B: console / runner | Mode C: `?simulate=police` | Evidence and limits |
|---|---|---|---|---|---|
| P1 | The AI says it speaks for a person who is unable to speak | Real UI and API (form's personal case); no phone run | Simulated phone | Simulated | `personalOpening`; parity test |
| P2 | Name and pre-complaint number only after a card each | Name and case reference can be gated in the form's case; not run on a phone | Simulated phone; SOFT-RUN on 25 Oct 2026: UC-P01 **PASS** and UC-P02 **PASS** (an earlier UC-P01 run FAILED: the agent asked for the name card but not the pre-complaint number card); UC-P03 to UC-P09 not completed when this was committed (an earlier attempt failed on the network) | Simulated | Gate tested in `apps/api/test` with a scripted agent |
| P3 | The identity document number is never shared | **Not shown**: the form's case has no such fact | Runner UC-P03 only | Simulated: the refusal is in the captions | `never` flag, AC-F02-3 |
| P4 | The AI will not give a statement or sign | **Not shown** in Mode A | Runner UC-P04, UC-P05 | Simulated: the refusal is in the captions | `legal_declaration` refused (AC-F02-2); the classification gap is open, [use-case-police.md](https://github.com/jermiah/404-brainnotfound/blob/main/pitch/use-case-police.md) section 9 |
| P5 | The AI never agrees to pay | **Not shown** in Mode A | Runner UC-P06 | **Not shown** | `payment_authorization`; no amount at all in the case |
| P6 | Emergency numbers are refused | Real API check (nothing is shown on screen; the number is simply not dialable); not run on a phone | n/a | Same check | `apps/api/test/controller.test.ts`, `apps/web/test/phone.test.ts` |

**Mode A uses the form's personal case, so P3 to P5 are demonstrated only in modes B and C and in the runner.** Do not
say the live app showed them. The runner (SOFT-RUN) is real API, worker and model with a synthetic voice and simulated
SIP: it is SOFT-like evidence, never PSTN.

## 3. Rules

1. A label moves to **real** only when a dated PASS row exists for that beat on the artifact in question. A run that
   failed moves it back, and the failure goes in the row.
2. Update this page after every rehearsal, in the same change as the `verification.md` row. A beat that passed in Mode B
   is still simulated in Mode A until Mode A passes.
3. The slide says the mode the demo is in, out loud and in writing.
4. The F11 plan wanted this page generated from the `verification.md` tables by a script that refuses a beat without a
   PASS. **That script is not built**; this page is kept by hand, so reviewing it against the rows is part of every
   rehearsal.

## 4. The three lines for the slide

For today's evidence. Replace them after rehearsals, never before.

> **Real:** CallAble can dial and hang up a real phone; on a real call the AI announced it was an AI (earlier wording).
> **Tested with a simulated phone line:** the AI's conversation, the approval card, the refusals, and two-way
> translation with synthetic speakers. **Not shown:** Express Clearly and the generated summary.
>
> The supplier, the customer and the bill are fictional. Today's run is in **[mode A / B / C]**.

Add, in Mode C: **"This is the scripted demo mode. No phone and no AI are running."** In Mode B: **"The phone line is
simulated: a browser plays the phone."**

## 5. What we have not verified

- Any accessibility claim beyond the simulated UI. No keyboard-only or screen-reader pass on the live app, no compliance
  claim (constitution 1.6).
- Latency on a real phone call (AC-F11-8 NOT RUN).
- The ten-call audio isolation count with AI sessions live (AC-F11-9 NOT RUN).
- Behaviour against a real supplier. Our "representative" is a teammate, and a real one may refuse an AI.
