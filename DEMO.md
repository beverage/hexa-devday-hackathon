# DEMO — three scenarios

Written 2026-10-24 (night) from the session that ran the STT spike; reframed Sat 24 Oct after the kickoff for the
**impact track** (D-011): same spine, essential-service settings, person-first pitch.

**Tagline:** customer service that meets you at your level. **Pitch:** millions of people in France deal with their
energy bill, their job search or their bank in a language that is not their first, and the call centre answers
everyone in the same French at the same speed. Our voice agent reads how you speak, adapts its level and register turn
by turn, and when you don't follow, says it again simpler and slower, instantly, without changing what it decided.
**OpenAI decides what to say; Levelang decides how to say it.**

Every scenario below is one agent, one caller, and the caller's level and register moving under it. Settings are
essential services; brands are fictional placeholders (rename freely, never use a real one).

| | Impact topic | Live, Mon 26 Oct (2 min) | Press-play, Sun 25 Oct night |
|---|---|---|---|
| **1. Le prélèvement a été rejeté** (electricity, payment plan) | Affordable essentials · assistive re-say | **Yes**: lowest risk, French only, Alex's natural Franglais | Yes |
| **2. Le vélo de la rue Martel** (negotiated purchase) | Fairness: the price does not depend on the caller's French | Alternative, if the negotiation logic is solid by Sunday 15:00 | **Yes, lead card** |
| **3. Der Termin am Dienstag** (job interview in Germany → French) | New opportunities (jobs) · level per language | No: the language switch is too risky live | Yes, once the switch works |

Alex performs all three himself: fumbling Franglais, fluent formal French, learner German. No clone, no second
speaker. If a genuine non-native French speaker joins (D-013), they record the beginner turns of scenarios 1 and 2
and Alex keeps the fluent turns and the German.

## Shared mechanics (D-006, D-007, D-009, D-010)

- **Start state** for every call and every new language: intermediate · formal (*vous* / *Sie*).
- **Reply path:** realtime commit (~2 s after the caller stops) → OpenAI draft in English → cell chosen when the
  draft is done → Levelang render (~1.4–1.7 s a cell, measured 10-23) → voice. About **4.5–5 s a turn**, so a filler
  phrase covers the gap and a 2-minute demo holds about 6 exchanges.
- **Instant moments** (no draft, no render): a comprehension failure re-says the previous reply from the neighbour
  below, already rendered; an explicit request ("parlez normalement", "on se tutoie", "en français") applies at once.
  The lines below put an explicit cue wherever a switch must land on that turn.
- **Raising is careful:** without an explicit cue, a higher level needs floor evidence in 2 of the last 3 turns.
  Show it as a feature ("raising: 1/2") rather than hide it.
- **The console** (one page): the tagline as its first line · live caption that heals into the batch text · the
  English draft · the cell grid with the chosen cell lit and its neighbours clickable · level and register meters, one
  pair per language · evidence chips quoting the caller's words for every change · the scenario's card (account, deal,
  or interview) · the payment QR · one curl line showing the endpoint any agent can call.

Agent lines below are the **English draft intent** (what the OpenAI brain writes). All quoted French and German for
the agent is **illustrative** until re-rendered through Levelang (the 10-23 real output was for the old streaming
setting and is retired); re-render before recording.

---

## 1. « Le prélèvement a été rejeté » — essentials: a payment plan instead of a cut-off

**Wow it owns:** the instant repair, then the level and register following the caller.
**Impact topics:** affordable essentials (the lights stay on); disability inclusion as comprehension accessibility
(the re-say). No climate claim.
**Setting:** *Lucioles Énergie* (a fictional electricity supplier). The October direct debit of 142 € was returned by
the bank on 20 Oct; the letter the caller received mentions a possible cut-off.
**Tools (OpenAI brain):** `lookup_account(phone)` → contract, amount due, return code, cut-off status ·
`propose_payment_plan(months)` → three instalments of 47,33 €, the first today · `send_payment_link(amount)` → Stripe
test-mode link + QR for the first instalment.

1. **The fumble.** Caller, Franglais, hesitant:
   > Allô ? Bonjour… euh… j'ai reçu une lettre, le… le prélèvement, il est… rejected ? Et ça parle de coupure… Je sais
   > pas comment on dit…

   Agent (start cell, intermediate · formal): *"I understand. Your October payment of 142 euros was returned by your
   bank. Nobody is cutting your electricity today. I can split the amount into three monthly payments and text you a
   secure link for the first one."*
   > Je comprends. Votre prélèvement d'octobre, de 142 euros, a été rejeté par votre banque. Personne ne coupera votre
   > électricité aujourd'hui. Je peux répartir le montant en trois mensualités et vous envoyer par SMS un lien
   > sécurisé pour la première.

   Console: the judge reads the batch text; chips "rejected", "coupure", "comment on dit", "euh" ×2. Account card:
   142 € due, cut-off: none.
2. **The instant repair.** Caller cuts in while the agent is still speaking:
   > Pardon… plus lentement, s'il vous plaît ?

   Agent stops and re-says the same reply from the beginner cell, slower, **with no pause**:
   > Je comprends. Votre paiement d'octobre n'est pas passé. C'est 142 euros. On ne coupe pas votre électricité. Vous
   > pouvez payer en trois fois. Je vous envoie un lien par SMS pour le premier paiement.

   Console: meter drops to beginner; chip "plus lentement".
3. **Dropping the act.** Caller, fluent formal, with the explicit cue:
   > Excusez-moi, je reprends. J'aurais souhaité comprendre pourquoi le prélèvement a été rejeté alors que le compte
   > était approvisionné. Vous pouvez me parler normalement.

   Agent jumps to fluent · formal: *"Of course. Your bank returned the debit on the 20th with a 'mandate not
   recognised' code, which usually follows a change of bank or account. The payment plan stands: the link takes the
   first instalment by card today, and we set up the new mandate afterwards."* Console: chips "j'aurais souhaité",
   "approvisionné", "vous pouvez me parler normalement".
4. **Tutoiement.**
   > Parfait. Et on peut se tutoyer, hein, ce sera plus simple.

   Agent, fluent · casual: *"Sure! Sending you the link now."* Register meter flips to *tu*. QR on screen.
5. **Payment.** The judge scans and pays 47,33 € with 4242 (Stripe test mode). Agent: *"Done, the first instalment is
   in; the next two go through on the 5th of November and December. Your electricity stays on."* in the *tu* cell.
   Stretch: the confirmation email lands in the same level and register.

**Cut order if short on time:** 4, then the email.

---

## 2. « Le vélo de la rue Martel » — negotiated purchase

**Wow it owns:** **the same deal in every cell.** The offer is decided in the English draft before calibration, so
no caller pays more for their French. Click any cell on the grid: same price, same extras.
**Impact topic:** fairness. A caller's level is not a reason to charge them more, and the grid proves it on screen.
**Setting:** *Vélos Martel*, a fictional refurbished e-bike shop (a nod to Hexa's street). The agent is the seller.
**Mandate:** list price 1 290 €; floor 1 150 €, **enforced in the tool, not the prompt**; sweeteners: antivol (60 €),
delivery (40 €), 2-year battery warranty (90 €); 150 € deposit to reserve.
**Tools:** `get_listing(id)` · `make_offer(price, extras)` (refuses below the floor) · `send_deposit_link(amount)` ·
`send_receipt()`. **Deal card** on the console: model, price, extras, status, updated by each tool call.

1. **Opener, beginner with English gaps.**
   > Bonjour, euh… le vélo électrique sur le site, le… refurbished… il est encore available ?

   Agent (intermediate · formal): *"Yes, it's still available: a 2023 model, fully serviced, 1,290 euros."* Deal
   card: 1 290 €.
2. **Haggling, beginner.**
   > C'est cher… Moins cher, c'est possible ?

   Agent at beginner (the judge lowered it from turn 1's evidence): `make_offer(1250)`, *"I can do 1,250 euros."*
   Deal card: 1 250 €.
3. **Switching to fluent formal, no cue.**
   > Écoutez, je vais être franc : j'aurais été prêt à conclure aujourd'hui si vous aviez pu faire un geste plus
   > significatif, d'autant que la batterie a déjà deux ans.

   Agent still at beginner (careful raise): `make_offer(1190, [antivol])`, *"OK. 1,190 euros, and the lock is
   free."* Console: **raising: 1/2**, chips "j'aurais été prêt", "d'autant que".
4. **Second fluent turn: the raise lands.**
   > C'est un effort, je le reconnais. Seriez-vous disposé à descendre à 1 150 si je réglais l'acompte immédiatement ?

   Agent at fluent · formal: `make_offer(1150, [antivol])`, *"Agreed: 1,150 euros with the lock included, provided
   the 150-euro deposit is paid today. I'm sending you the payment link."* **The fairness moment:** click through the
   grid; every cell says 1 150 €, antivol inclus.
5. **Close, casual.**
   > Top. On se tutoie, du coup ?

   Agent, fluent · casual: *"Absolutely! Here's the link."* Deposit QR → 4242 → receipt with the deal terms.

**Check before relying on it:** how Levelang renders prices at beginner ("1 150 €" vs written out); untested.

---

## 3. « Der Termin am Dienstag » — a job interview in Germany, switching to French

**Wow it owns:** **level is per language.** The same caller is a beginner in German and fluent in French, and the
console shows two meters.
**Impact topic:** new opportunities (jobs). A caller who moved for work gets the practical details in a language they
can act on.
**Setting:** *Brückenwerk Personal*, a fictional staffing agency in Hamburg; candidate line. The caller has an
interview invitation for a warehouse logistics position and cannot make sense of the address and the documents list.
The agent starts in German.
**Tools:** `lookup_candidate(ref)` → position, interview slot, address, documents · `reschedule(slot_id)` ·
`send_confirmation(channel, language)`. **Interview card** on the console: position, slot, address, documents.

1. **Opener, learner German.**
   > Hallo, ähm… ich habe eine Einladung… für ein Gespräch… am Dienstag? Aber die Adresse… und die Dokumente… ich
   > verstehe nicht gut. Meine Nummer ist… ähm… BW-2093.

   Agent (German, intermediate · *Sie*): *"Your interview for the warehouse logistics position is on Tuesday the 27th
   at 10 am at our Hamburg office, Speicherstraße 12, second floor. Please bring your ID and your work permit."*
2. **Dates and documents are hard: the instant repair.**
   > Entschuldigung… Dienstag? Und… welche Dokumente? Langsamer, bitte…

   Agent re-says from the beginner German cell, slower, no pause (illustrative):
   > Dienstag, 27. Oktober. 10 Uhr. Speicherstraße 12, Hamburg. Zweiter Stock. Bitte mitbringen: Ausweis.
   > Arbeitserlaubnis.

   Console: German meter → beginner; chips "ähm", "ich verstehe nicht gut", "Langsamer, bitte".
3. **The switch, with the explicit cue.**
   > Pardon, est-ce qu'on peut continuer en français ? Je suis bien plus à l'aise, vous pouvez parler normalement.

   Agent continues **in French at fluent · formal**: *"Of course. Tuesday the 27th at 10, Speicherstraße 12 in Hamburg,
   second floor. Bring your ID and your work permit; if the permit is still being processed, the receipt from the
   immigration office is enough."* Console: a French meter appears at fluent next to the German one at beginner.
4. **Confirmation.**
   > Parfait. Vous pouvez m'envoyer tout ça par SMS, en français ?

   Agent: `send_confirmation(sms, fra)`: the text appears on the console in French, formal, with the slot, the address
   and the documents list.

**Needs before it can be recorded:** the realtime language switch (below), German phrases in the gate ("wie bitte",
"Entschuldigung", "langsamer", "ich verstehe nicht", "noch einmal"), one estimate per language, a German voice.

---

## Press-play (Sunday night)

- The landing page opens on the tagline, then three cards, each with its impact topic; a judge presses play on any of
  them, no microphone, no sign-in.
- The caller audio is Alex's own recording of the lines above, split per turn (the beginner turns by a genuine
  non-native speaker if D-013 lands). Its transcripts are **cached** (D-008): no live STT, no network risk on the
  judge's play. The agent's draft and render run live; if a live call fails, the card falls back to a recorded run of
  the same scenario.
- Record a full fallback video of scenario 1 and 2 on Sunday afternoon (CHECKLIST).

## Open risks, in order

1. **Realtime language switch (scenario 3).** D-007 pins `language_code`; pinned to German, the French cue is
   mangled. Options: run realtime unpinned (noisy on one-word turns), or detect the switch from batch (German came
   back at p = 0.999) and reconnect realtime pinned to the new language. Untested; spike it with a synthetic clip.
2. **Latency.** The draft is unmeasured; the render is ~1.4–1.7 s a cell. If a turn runs past ~5 s, the filler
   phrase and streamed voice carry it.
3. **One voice across languages (scenario 3).** Gradium changes voice per language (it would sound like a transfer);
   Eleven v4 keeps one voice for French and German. Undecided.
4. **Negotiation logic (scenario 2).** The floor and the concessions must live in the tool, so a prompt can't talk
   the agent below 1 150 €.
5. **Numbers, dates and addresses in renders (all three).** 142 €, 47,33 €, 1 150 €, "Dienstag, 27. Oktober, 10 Uhr",
   "Speicherstraße 12" at beginner level in both languages: untested, and a wrong amount or date breaks the
   essentials story.
6. **Impact framing read as a veneer.** Mitigation: the setting itself is essential, the pitch opens with the person,
   and the honesty lines (`IDEA.md` § 0) are on the evaluation slide, not hidden.
