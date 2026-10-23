# DECISIONS — hackathon-local

Decisions that outlive the weekend (anything that changes Levelang's contract or reverses a recorded decision)
go in `~/Code/Apps/levelang/.product/decisions/` via `/decide`. This file is for the weekend.

| # | Date | Decision | Why |
|---|---|---|---|
| D-001 | 2026-10-23 | **The agent speaks in a stock voice, not Alex's clone.** The clone stays with Mirror voice (the user speaking for themselves). | A service agent answering a customer in the customer's own voice is uncanny; it also removes the main reason to prefer Gradium for output. |
| D-002 | 2026-10-23 | **Text loop first, voice second.** Saturday: the calibrated agent end to end on one page (OpenAI brain → Levelang render → judge → console with grid). Freeze Saturday night as the submission floor. Sunday morning: voice in and out on the same page, plus a press-play mode with pre-recorded callers. Sunday afternoon: the two-minute video. | Everything unproven is on the text side (detector, context field, OpenAI in the loop); voice is the layer that is already mostly built and the one that wins the room on Monday. Finalists are chosen Sunday night by people who will do one thing on the landing page. |
| D-003 | 2026-10-23 | **The STT provider is decided by `stt-spike/` before Saturday 11:00**, by the rule in its README (ElevenLabs by default if it keeps the planted learner evidence; Gradium if it alone keeps it; tie → ElevenLabs). Output voice is a separate, cheap choice through the backend's `VoiceProvider`. | The detector works from transcript text and timing; a transcriber that cleans fillers and errors blinds it. The docs leave this open for both vendors. |
| D-004 | 2026-10-23 | **No Spanish.** French and German only. | Levelang has no Spanish; an untuned third language weakens the calibration-quality claim and German already shows it is a platform. |
| D-005 | 2026-10-23 | **The brain is an OpenAI model** (event rule). Levelang's render stays on its current provider (Gemini) unless the "Levelang calibration on GPT" harness angle is picked up as narration; the backend already supports OpenAI models with per-model prompts. | Rule compliance with the smallest change to the product. |
| D-006 | 2026-10-23 | **Shadowing N agent configurations is out.** One draft per turn; Levelang renders the current estimate and its neighbouring cells; the judge picks after the turn. Put the calibration directive after the conversation history so the prompt cache survives a level switch. | The agent endpoint receives the whole conversation every turn anyway, so a switch costs nothing to "re-read"; Levelang's grid already varies the one thing shadowing would vary. Pre-rendered neighbours make the mid-turn "je ne comprends pas" re-say instant. |

Pending: input provider (D-003, after the spike) · existing-product and voice-provider rules (kickoff) · Sunday
submission format (kickoff) · whether the `context` field lands in `levelang-backend` this weekend (IDEA.md § 3).
