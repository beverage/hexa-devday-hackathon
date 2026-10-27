# Agent endpoint contract

The interface between the four seams. The agent loop implements it; the console, voice and evaluation seams build
against it with the fixture in `fixtures/scenario-1.json`. Design decisions behind it: D-006, D-009, D-010.
Change the contract only with a row in `DECISIONS.md`.

## Principles

- **The endpoint is stateless per call.** The caller sends the whole conversation and the current estimate every
  turn; a level switch is a parameter change, not a re-read. The calibration directive goes after the history so the
  prompt cache prefix survives a switch.
- **The cell is decided before the draft is used, never by a call in front of the reply.** A pure-code gate reads the
  realtime text first (comprehension failure → drop one level and re-say the pre-rendered neighbour; explicit request
  → apply now; otherwise the current estimate). The judge runs in the background and its result applies next turn.
- **The draft is English and level-neutral.** Levelang does all calibration. The same draft renders in the chosen cell
  first and its neighbours in the background, so the next "plus lentement" is instant.
- **Tools hold the business rules**, not the prompt: a payment plan or a price floor is enforced in code.

## `POST /turn`

One caller turn in, one agent reply out. Synchronous JSON; streaming is a later addition on the same shapes.

### Request

```json
{
  "scenario": "lucioles-energie",
  "language": "fra",
  "conversation": [
    {"role": "caller", "text": "Allô ? Bonjour… euh… j'ai reçu une lettre, le… le prélèvement, il est… rejected ?",
     "source": "realtime", "started_at": 0.0, "ended_at": 6.2},
    {"role": "agent", "text": "Je comprends. Votre prélèvement d'octobre…", "cell": {"level": "intermediate", "register": "formal"}}
  ],
  "estimate": {
    "level": {"value": "intermediate", "confidence": 0.5, "floor": null, "ceiling": null},
    "register": {"value": "formal", "confidence": 0.9},
    "raise_votes": 0
  },
  "options": {"render_neighbours": true, "model": null}
}
```

- `conversation[].source`: `realtime` (drives this turn) or `batch` (the re-read; the console swaps it in later and
  history entries become batch text). Timing fields are seconds from the start of the call; optional.
- `estimate` is whatever the client last received; the first turn sends the start state (intermediate · formal).
- `language`: ISO 639-3, `fra` or `deu`. One estimate per language; the client keeps a map and sends the current one.

### Response

```json
{
  "gate": {"action": "none", "reason": null},
  "draft_en": "I understand. Your October payment of 142 euros was returned by your bank. Nobody is cutting your electricity today. I can split the amount into three monthly payments and text you a secure link for the first one.",
  "cell": {"level": "intermediate", "register": "formal"},
  "reply": "Je comprends. Votre prélèvement d'octobre, de 142 euros, a été rejeté par votre banque. …",
  "renders": {
    "beginner/formal": "Je comprends. Votre paiement d'octobre n'est pas passé. …",
    "intermediate/formal": "Je comprends. Votre prélèvement d'octobre, de 142 euros, …",
    "advanced/formal": "…"
  },
  "estimate": {
    "level": {"value": "intermediate", "confidence": 0.55, "floor": null, "ceiling": "intermediate"},
    "register": {"value": "formal", "confidence": 0.9},
    "raise_votes": 0,
    "evidence": [
      {"quote": "rejected", "axis": "level", "direction": "ceiling", "note": "English gap-fill"},
      {"quote": "euh", "axis": "level", "direction": "ceiling", "note": "hesitation ×2"},
      {"quote": "comment on dit", "axis": "level", "direction": "ceiling", "note": "asks for the word"}
    ]
  },
  "tool_calls": [
    {"name": "lookup_account", "arguments": {"phone": "+33600000000"},
     "result": {"plan": "Essentiel", "amount_due_eur": 142.00, "return_code": "mandate_not_recognised", "cutoff": "none"}}
  ],
  "card": {"type": "account", "amount_due_eur": 142.00, "status": "returned", "cutoff": "none", "plan": null},
  "timing_ms": {"gate": 1, "draft": 0, "render_first": 0, "render_all": 0, "judge": 0, "total": 0}
}
```

- `gate.action`: `none` | `resay` | `explicit`. On `resay`, `draft_en` repeats the previous draft, `cell` is the
  neighbour below, `reply` comes from the previous turn's `renders` and `timing_ms.draft` and `render_first` are 0.
  On `explicit`, `gate.reason` quotes the request ("on peut se tutoyer").
- `renders` always includes `cell`; neighbours are present when `options.render_neighbours` is true and done.
- `estimate` is the judge's result **if it arrived before the draft finished**; otherwise the request's estimate is
  echoed and the update lands next turn. `evidence` quotes the caller's words; the console shows them as chips.
  `raise_votes` counts floor evidence in the last three turns; a raise needs 2.
- `card` is the scenario's object (account, deal or interview), updated by tool results, rendered by the console.
- `timing_ms` is filled on every turn; the evaluation seam collects it.

### Errors

`400` with `{"error": "…"}` for a malformed request; `502` with the failing dependency (`openai`, `levelang`) and the
upstream status. The console shows a filler phrase on anything slower than 2.5 s and keeps the turn open.

## `GET /scenarios/{id}`

Returns the scenario's fixture: start state, caller turns with expected gate action and cell, tools, card. Used by
press-play and by the evaluation seam. Ids: `lucioles-energie`, `velos-martel`, `brueckenwerk-personal`.

## Tools, scenario 1 (`lucioles-energie`)

OpenAI function definitions, held by the brain. Results are deterministic from the fixture.

| Tool | Arguments | Returns | Rule enforced in code |
|---|---|---|---|
| `lookup_account` | `phone` | `plan`, `amount_due_eur`, `return_code`, `cutoff` | Always `cutoff: "none"` during the winter break; the prompt cannot threaten a cut-off |
| `propose_payment_plan` | `months` (2–6) | `instalments[]` with amounts and dates, `first_due` | Equal instalments rounded to the cent, first one today, then the 5th of each month |
| `send_payment_link` | `amount_eur` | `url`, `qr_png_base64`, `stripe_test: true` | Only for an amount equal to one instalment of an accepted plan |

Scenario 2 and 3 tools are listed in `DEMO.md` and get their own rows when their fixtures land.

## Levels and registers

Levels: `beginner` · `intermediate` · `advanced` · `fluent`. Registers: `casual` · `formal`. Cell keys are
`level/register`. Start state for every call and every new language: `intermediate/formal`. Lower at once on a
comprehension failure; raise only on floor evidence in 2 of the last 3 turns; register by policy (formal unless asked
or persistent casual).
