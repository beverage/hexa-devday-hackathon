# CallAble constitution

*Copied from [jermiah/404-brainnotfound](https://github.com/jermiah/404-brainnotfound/blob/main/CONSTITUTION.md) on 27 October 2026. The original is the source of truth.*

These articles bind every change to CallAble: code, prompts, specs, demos and pitch. Each one is derived from the
baseline documents, the PRD (`callable-docs/CallAble_PRD_v1.md`) and the technical architecture
(`callable-docs/CallAble_Technical_Architecture_v1.md`). The source sections are cited so an article can be traced
back and challenged. An article adds no product requirement the baseline does not already state.

When a spec, a plan or an instruction conflicts with an article, the article wins until it is amended (article 10).

## 1. Accessibility and user control

1. Every core workflow works by keyboard and with a screen reader. Approval and hangup never require voice input.
   (PRD §8)
2. Captions can be resized and status is carried by text, not by colour alone. (PRD §8)
3. The user can end any call at any time with one control that works on its own. **End call** terminates the
   telephone leg even when model processing has stalled. (PRD §4.1 criteria, FR-01; architecture §2 invariant 2)
4. The user is never put under time pressure to approve. An approval waits; the call pauses or the agent says it
   must check. (PRD §4.1 step 8, §8)
5. Every error state says what the user can do next, including switching to typed input. (PRD §8, §13)
6. Nobody claims full accessibility compliance before representative user testing. (PRD §8)

## 2. Explicit approval before consequential actions

1. The user approves each outbound call and its destination number before dialing. (PRD §7 consent)
2. A consequential action or a disclosure of a sensitive fact happens only after the user approves that exact
   action. An unapproved request is blocked, not delayed and then performed. (FR-08; architecture §2 invariant 3)
3. Payment authorization, consent to contractual terms and disclosure of account secrets are out of the MVP. The
   system refuses them even with an approval. (PRD §3 non-goals, §7)
4. A failure never triggers an automatic redial or a second unapproved external action. (PRD §6 state machine;
   architecture §2 invariant 4)
5. Every approval decision and every external side effect is recorded in an immutable audit record. (PRD §9)

## 3. Preservation of meaning, amounts, dates and sourced facts

1. The user's own words are the source of intent. A rewrite may fix grammar and fill in authorized, reliably
   retrieved references. It never adds facts and never changes the user's chosen outcome. (PRD §4.3)
2. No rewrite, translation or agent turn may silently introduce prices, identities, promises or deadlines.
   (PRD §4.3 criteria; architecture §7)
3. Every fact an agent can read carries its provenance and an allowed-disclosure flag. (PRD §7)
4. Amounts and dates shown to the user are formatted by code from the source, never rephrased by a model. (D-019,
   D-020, consistent with PRD §4.3)
5. When confidence is low or sources conflict, ask a clarifying question instead of guessing. (PRD §4.3)

## 4. Privacy, scoped authorization and secrets

1. Demo fixtures and planning data remain synthetic until privacy, residency and consent review is complete. D-038 permits the user-requested manual personal profile for Call for Me through the existing Realtime path, with field-level sharing consent and an introduction preview. D-039 additionally permits browser-local profile and session history storage at the user’s request, with visible retention scope and local export/deletion controls. D-043 permits a bounded live-call lookup over a user's explicitly connected Google account: the OpenAI Agents API session receives only a user-scoped, read-only Composio MCP endpoint, returns one sourced fact into call memory, and the fact remains withheld until exact disclosure approval. These exceptions do not permit government ID, secrets, unrestricted uploads, write actions or personal data in Agents API planning. (PRD FR-12–FR-14, §7; architecture §6.4, §10)
2. Reading a fact does not authorize disclosing it to the representative. (PRD §7)
3. Access to documents and accounts is least-privilege, scoped to selected records and revocable. (PRD §7)
4. The model never receives Supabase admin credentials or OAuth refresh tokens. Provider keys, telephony credentials
   and the Supabase service-role key live only in server-side secret stores. (PRD §7; architecture §3, §12)
5. Secret values never appear in the repository, in docs, in logs or in chat. `.env.example` lists names only.
6. Call audio is not stored by default. Logs record decisions and metadata. (architecture §9, §10)
7. The AI and translation participation is disclosed to the representative where appropriate. (PRD §9;
   architecture §10)

## 5. Deterministic enforcement outside model prompts

1. Permissions, approvals, disclosure rules and call state are enforced in backend code. A prompt may describe a
   rule; it never enforces one. (architecture §10)
2. The call controller, not the model, is authoritative for call status. Every transition goes through one
   transition table and is persisted with a timestamp and correlation IDs. (PRD §6; D-022)
3. Tools with external side effects validate the user ID, the case scope, the approval record and an idempotency
   key before they act. (PRD §7)
4. Provider SDKs and model names stay out of the product UI, the application data model and telephony control.
   Providers are chosen at call creation and validated against a capability matrix before dialing. (architecture
   §2 invariants 5 and 6; FR-22)

## 6. Audio isolation and explicit failure behavior

1. Raw browser microphone audio never reaches the representative in Translate with Me. Only audio meant for the
   other side crosses between rooms, through the media worker. (FR-06; architecture §2 invariant 1, §4)
2. In Call for Me the browser microphone is not published toward the service room. (architecture §4.2)
3. Buffers are bounded and timestamped. Generated audio made obsolete by barge-in or hangup is discarded.
   (PRD §9; architecture §4.4)
4. A provider failure mid-call is shown to the user and pauses or ends the call. The system never silently switches
   models or providers. (architecture §5.5)
5. If the media worker crashes, the call is terminated or visibly marked disrupted. Nobody promises transparent
   recovery. (PRD §9)
6. Every external wait has an explicit timeout and a user-visible acknowledgement when it runs long. (PRD §9)

## 7. Verification before completion claims

1. Done means the acceptance criterion was observed on the real artifact. Compiling and unit tests do not prove an
   integration criterion. (PRD §14 implementation note)
2. Each feature's `verification.md` records the actual result and its evidence. A planned check is never marked
   passed.
3. Simulated results are labelled simulated. Simulated PSTN connectivity, provider switching or tool actions are
   never presented as implemented. (architecture §15 cut 5)
4. A provider appears as selectable only after it passes the adapter conformance suite with real credentials.
   (architecture §13)

## 8. Small, reviewable changes and controlled scope

1. Work follows the gate order G1 to G5. If G1 fails, the PRD's stop/go rule applies: no integration work, one
   verified mode with a controlled telephone participant. (PRD §10)
2. A change is the smallest complete behavior that a check can demonstrate. No scaffolding without a user-visible
   or testable behavior on top of it.
3. Scope changes only through the specs and a `DECISIONS.md` row. Nobody narrows scope to make a test pass.
4. A shared contract (`packages/contracts`) changes only with a `DECISIONS.md` row and an update to every affected
   spec.

## 9. Honest representation

1. The demo uses fictional organizations and synthetic documents, never a real company's name, logo or look.
2. The pitch says which beats are real and which are simulated. (PRD §10 stop/go; architecture §15)

## 10. Amending this constitution

1. Propose the change as a `DECISIONS.md` row naming the article, the new text and the reason, citing the baseline
   section it derives from or the baseline change that forces it.
2. Update every spec and skill that relies on the article in the same change.
3. The team lead reviews the change before merge. An amendment that loosens articles 2, 4, 5 or 6 also needs the
   baseline documents updated first, because those articles restate baseline requirements.

D-053 amendment to article 4.1, explicitly requested by the user: bounded call goal, final representative questions and disclosure-allowed facts may enter the in-call Agents API lookup. Exclude known withheld values echoed in text; this does not authorize raw profile export, inferred location, new tools or disclosure without approval.

D-055 amendment to article 4.1, explicitly requested by the user: after an in-app location-sharing tap and browser permission, one device position (coordinates, accuracy and capture time) may enter the call's user-scoped Agents/Composio Maps lookup. No background tracking. The resulting address remains subject to exact-fact disclosure approval.

### D-058: one-shot location disclosure consent (2026-10-25)
At the user's request, the location prompt may explicitly authorize finding and sharing the resolved current address with the representative on this call. `LocationSubmission.share_address: true` records this consent for that request only; omitted/false retains the exact-address review. This never authorizes documents, passports, other targets or later calls. Browser permission, target confirmation, valid fresh coordinates, sourced Maps results and the existing audited approval/execution gate remain required. No continuous tracking.


### D-062: approve the requested lookup before reading (2026-10-25)
The user explicitly requests an in-call prompt before connected document lookup: show the question and source, ask permission to retrieve and share only its answer, and search only after an owner-authenticated approval. That consent covers one sourced answer for that question/source/call; a second disclosure popup is not required. Rejection reads and shares nothing. Forbidden secrets remain forbidden; missing, ambiguous, unreadable or conflicting evidence never becomes an answer. Backend-generated request IDs, immutable consent events and ApprovalService.execute enforce this exception to exact-value review. Location continues to use its own D-058 consent.

D-062 PDF/image implementation: after request-specific consent, a short-lived bearer capability exposes the same user-pinned Composio Drive session through the API. Drive downloads of PDFs, PNG/JPEG/WebP images, text and DOCX are read by OpenAI Responses (gpt-5.4, store=false); only relevant verbatim excerpts return to the managed agent. Native Google documents use Drive GET_DOCUMENT. Signed URLs never reach the returned tool result or logs. Three-file limit per lookup, bounded timeouts, capability revoked on turn completion and call end. Returned PDF/image quotes must match the reader’s excerpts and source file. Government ID fields requested by the user are included in this explicitly authorized scope; account secrets remain forbidden. No document bytes are stored locally. API_PUBLIC_URL must be public HTTPS; Fly derives it from FLY_APP_NAME. Local development needs a public HTTPS API tunnel for the managed agent to reach the reader.
D-060 amendment to articles 2.2 and 4.1, explicitly requested by the user: a per-call opt-in, made on Prepare before dialing and off by default for every call, lets a fact found by a lookup in the user's own connected accounts (D-043) be said on that call without an approval card each time; the setting is the user's approval of that disclosure and each release is recorded in the audit as `auto_approved_by_user_setting`. It covers connected-account facts only. Facts flagged `never`, secrets, card and bank-account details and government identity documents are not covered and keep their existing refusal or approval; the fact must still pass the usual validation; the dial approval is unchanged.

D-062 integration with D-060: retain the explicit per-call connected-account opt-in for ordinary facts. Explicit government-ID queries still require the request-specific pre-search consent. If an ordinary opt-in lookup unexpectedly returns an identity fact, withhold it behind the existing exact-fact approval. Never broaden the opt-in to secrets or government identity documents.
