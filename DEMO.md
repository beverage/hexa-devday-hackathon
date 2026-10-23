# DEMO — three scenarios

Written 2026-10-24 (night) from the session that ran the STT spike. The pitch: **"OpenAI decides what to say and
reads how you speak; Levelang decides how to say it."** Every scenario below is one agent, one caller, and the
caller's level and register moving under it. Brands are fictional placeholders; rename freely, never use a real one.

| | Live, Mon 26 Oct (2 min) | Press-play, Sun 25 Oct night |
|---|---|---|
| **1. Le prélèvement a échoué** (support) | **Yes**: lowest risk, French only, Alex's natural Franglais | Yes |
| **2. Le vélo de la rue Martel** (negotiated purchase) | Alternative, if the negotiation logic is solid by Sunday 15:00 | **Yes, lead card** |
| **3. Wo ist mein Paket ?** (German shop → French) | No: the language switch is too risky live | Yes, once the switch works |

Alex performs all three himself: fumbling Franglais, fluent formal French, learner German. No clone, no second
speaker.

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
- **The console** (one page): live caption that heals into the batch text · the English draft · the cell grid with
  the chosen cell lit and its neighbours clickable · level and register meters, one pair per language · evidence chips
  quoting the caller's words for every change · the scenario's card (account, deal, or delivery) · the payment QR.

Agent lines below are the **English draft intent** (what the OpenAI brain writes). French quoted for the agent in
scenario 1 is real Levelang output from 10-23 (EN→FR, formal, spoken); elsewhere it is illustrative only.

---

## 1. « Le prélèvement a échoué » — support, failed renewal

**Wow it owns:** the instant repair, then the level and register following the caller.
**Setting:** *Kiosque+* (a fictional streaming and press subscription). The renewal on 22 Oct failed: the card on
file expired.
**Tools (OpenAI brain):** `lookup_account(phone)` → plan, status, failure reason · `send_payment_link(amount)` →
Stripe test-mode link + QR on the console · `retry_renewal()`.

1. **The fumble.** Caller, Franglais, hesitant:
   > Allô ? Bonjour… euh… mon subscription, le… le payment, il est… failed ? Je sais pas comment on dit…

   Agent (start cell, intermediate · formal): *"I understand, your renewal failed because the card on file has
   expired. I can text you a secure payment link to update your card; the renewal will then be retried
   automatically."*
   > Je comprends, votre renouvellement a échoué parce que la carte enregistrée a expiré. Je peux vous envoyer par
   > SMS un lien de paiement sécurisé pour mettre à jour votre carte ; le renouvellement sera ensuite relancé
   > automatiquement.

   Console: the judge reads the batch text; chips "payment", "subscription", "comment on dit", "euh" ×2.
2. **The instant repair.** Caller cuts in while the agent is still speaking:
   > Pardon… plus lentement, s'il vous plaît ?

   Agent stops and re-says the same reply from the beginner cell, slower, **with no pause**:
   > Je comprends. Votre renouvellement a échoué. Votre carte a expiré. Je peux vous envoyer un lien de paiement
   > sécurisé. Vous allez mettre à jour votre carte. Le renouvellement va se faire automatiquement.

   Console: meter drops to beginner; chip "plus lentement".
3. **Dropping the act.** Caller, fluent formal, with the explicit cue:
   > Excusez-moi, je reprends. J'aurais souhaité comprendre pourquoi le prélèvement n'a pas abouti, alors que ma
   > carte était valable jusqu'à fin octobre. Vous pouvez me parler normalement.

   Agent jumps to fluent · formal: *"Of course. Your bank declined the charge on the 22nd; banks often issue a
   replacement card before the printed expiry date. Updating the card through the link will retry the renewal
   immediately."* Console: chips "j'aurais souhaité", "n'a pas abouti", "vous pouvez me parler normalement".
4. **Tutoiement.**
   > Parfait. Et on peut se tutoyer, hein, ce sera plus simple.

   Agent, fluent · casual: *"Sure! I'm texting you the link now."* Register meter flips to *tu*. QR on screen.
5. **Payment.** The judge scans and pays with 4242 (Stripe test mode). Agent: *"Done, your renewal went through.
   Have a good day!"* in the *tu* cell. Stretch: the follow-up email lands in the same level and register.

**Cut order if short on time:** 4, then the email.

---

## 2. « Le vélo de la rue Martel » — negotiated purchase

**Wow it owns:** **the same deal in every cell.** The offer is decided in the English draft before calibration, so
no caller pays more for their French. Click any cell on the grid: same price, same extras.
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

## 3. « Wo ist mein Paket ? » — a German shop, switching to French

**Wow it owns:** **level is per language.** The same caller is a beginner in German and fluent in French, and the
console shows two meters.
**Setting:** *Hausgut*, a fictional German online home-goods shop; delivery line. The agent starts in German.
**Tools:** `lookup_order(order_no)` · `list_slots()` · `book_slot(slot_id)` · `send_confirmation(channel, language)`.

1. **Opener, learner German.**
   > Hallo, ähm… mein Paket… gestern… es war nicht da? Die Nummer ist… ähm… HG-4471.

   Agent (German, intermediate · *Sie*): *"The courier came yesterday at 11 but nobody was home. I can rebook the
   delivery: Tuesday the 27th between 2 and 4 pm, or Wednesday the 28th between 8 and 10 am."*
2. **Dates are hard: the instant repair.**
   > Entschuldigung… Dienstag oder Mittwoch? Langsamer, bitte…

   Agent re-says from the beginner German cell, slower, no pause (illustrative):
   > Dienstag: 14 bis 16 Uhr. Oder Mittwoch: 8 bis 10 Uhr.

   Console: German meter → beginner; chips "ähm", "Langsamer, bitte".
3. **The switch, with the explicit cue.**
   > Pardon, est-ce qu'on peut continuer en français ? Je suis bien plus à l'aise, vous pouvez parler normalement.

   Agent continues **in French at fluent · formal**: *"Of course. So: Tuesday the 27th between 2 and 4 pm, or
   Wednesday the 28th between 8 and 10 am."* Console: a French meter appears at fluent next to the German one at
   beginner.
4. **Booking.**
   > Mercredi matin, c'est parfait. Vous pouvez m'envoyer la confirmation par SMS ?

   Agent: `book_slot`, `send_confirmation(sms, fra)`: the confirmation text appears on the console in French, formal.

**Needs before it can be recorded:** the realtime language switch (below), German phrases in the gate ("wie bitte",
"Entschuldigung", "langsamer", "ich verstehe nicht", "noch einmal"), one estimate per language, a German voice.

---

## Press-play (Sunday night)

- The landing page shows three cards; a judge presses play on any of them, no microphone, no sign-in.
- The caller audio is Alex's own recording of the lines above, split per turn. Its transcripts are **cached**
  (D-008): no live STT, no network risk on the judge's play. The agent's draft and render run live; if a live call
  fails, the card falls back to a recorded run of the same scenario.
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
5. **Numbers in renders (scenario 2).** Prices and dates at beginner level, untested.
