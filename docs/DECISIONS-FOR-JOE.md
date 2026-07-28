# Decisions taken without Joe

*Every entry here is a call the manager made because Joe had not ruled on it and
work would otherwise have stopped. Each one says what was decided, why, and
**which commit would have to change to reverse it**. Joe may reverse any of it.*

Entries marked **NEEDS JOE** are the opposite: nothing was built on them, because
they would change what a child experiences beyond what Joe has already ruled.

---

## Run 1 — 28 July 2026 — PB-042, the governors' hard stop becomes a price

Joe's ruling (JT-012) settled the *mechanism*: invitation first, she may override
it, and past a buffer the thing she is over-buying gets progressively dearer
rather than refused, announced so it is never a silent tax. It left three numbers
open, and the card itself said so. All three were put to Fable with the real code
and the real trade-off. Fable's answers, and what was built on them:

### D1. Is the target 2.0 tiles per pet, or is the shipped 1.5 still the target?

**Decided: 2.0 tiles per pet is the target. 1.5 survives, but as the crowded
wall, not as the target.**

The tension was real: Joe said *"target ratio i think should be 1 animal per 2
tiles"* (2.0) on the same day he had already ruled *"3 tiles for 2 animals"*
(1.5), and PB-039 shipped against 1.5.

Fable's reason for calling this a real reconciliation rather than a convenient
one: **Joe's new sentence re-files the old number himself.** "with a buffer to
2:3" — and 2:3 animals-to-tiles *is* 1.5 tiles per pet. He did not repudiate the
morning's number; he moved it from the centre to the edge in the same breath that
set the new centre.

What is genuinely superseded, stated plainly rather than glossed: 1.5's role as
the target of `fieldsWanted`. And the old hard floor (`petsPerTile: 1.5`, i.e.
0.667 tiles per pet) does not survive at all — under a price scheme it is simply
deep past the crowded wall, priced rather than refused.

### D2. What is "a buffer to 2:3 either way" as two numbers?

**Decided: crowded wall at 1.5 tiles per pet ("two animals for every three
tiles", 2:3); empty wall at 3.0 tiles per pet ("one animal for every three
tiles", 1:3).**

In integers, with P pets and T habitable fields: the empty side is breached when
`T > 3P`, the crowded side when `T < 1.5P`.

Two rival readings were rejected. Symmetric-in-tiles-per-pet gives walls at 1.5
and 2.5, but 2.5 is "two animals per five tiles" — a ratio nobody says out loud,
and it throws away the 2:3 Joe actually wrote. Multiplicative (×2/3, ×3/2) gives
1.333 and 3.0 and abandons 2:3 entirely.

The chosen reading is symmetric in **animals per tile** — 2/3, 1/2, 1/3 are
evenly spaced, so 1:2 is the exact midpoint of the two walls. That is the unit
Joe stated his target in, and both walls are ratios a reader can say aloud, which
is the house style `governors.ts` already sets for itself.

The consequence to be aware of: the empty wall at 3.0 is **wide**. At ten pets
she may build thirty fields before land starts getting dear, where today it is
refused at nineteen. That is deliberate — "let the user run with whatever they
want to do" — but it is the single biggest behavioural change in the card.

### D3. The escalation curve

**Decided: linear, `mult(d) = 1 + d/4`, capped at ×3, applied before rounding.**

`d` is how many whole steps past the wall the purchase lands; the first item past
the wall is `d = 1`. The multiplier is applied to the exact curve value *before*
the round-to-a-multiple-of-`pay.item`, so `pay * Math.round(exact * mult / pay)`
— one code path, every price still a whole number of items and still a multiple
of two, and the steps stay monotone. Rounding first would produce non-multiples
(26 × 1.25 = 32.5) and jittery steps where some increments are +0.

What she actually faces, tiles, near the curve's cap:

| past the wall | multiplier | sums |
|---|---|---|
| 1 | ×1.25 | ~38 |
| 3 | ×1.75 | ~54 |
| 10 | ×3 (capped) | ~92 |

Absolute ceiling ×3: 96 sums, or 84 pages on the egg side. The cap is the point
where this stops being the bug it is fixing — uncapped, a determined builder
reaches 200+ sums, and a price she cannot pay is a stop wearing a different hat.
Fifty-four sums at three past is under twice what she already pays willingly, and
§19 means partial progress persists across sittings, so it reads as a savings
goal rather than a wall.

**Fable's own flag, worth repeating:** the magnitude is the most likely of the
three to be wrong, because "really really tough" may mean tougher to Joe than
+25% a step. It is cheap to change — slope and cap are two constants in
`balance.json` (`escalation: { slope, capMultiple }`); nothing in the curve code
moves if he wants 0.5 and ×4.

### D4. The invitation fires where the price fires

**Decided: `activeGovernor`'s thresholds move onto the new walls, so Fred asks at
exactly the point the price starts.**

Not put to Fable — it follows from Joe's own "with an announcement". If the price
began somewhere the invitation did not, the first dearer purchase would be silent,
which is the one thing he ruled out. This retires `maxEmptySurplus` and
`petsPerTile` as thresholds.

### D5. The override is a second tap, and Fred asks again every time

**Decided: the first tap on a paused egg or socket spends itself on Fred's line;
the very next tap on the same thing opens the round regardless. The memory clears
on the override, so the next override is preceded by the ask again.**

This is option (a) as the card wrote it — *"Fred asks, and if she taps again the
round opens anyway"* — which is what Joe endorsed. The clearing is the load-bearing
half: a memory that persisted would mean she is asked once in a session and
silently waved through forever after, which is the silent tax again. Cost is one
extra tap per override; the gain is that no override is ever silent.

Fred says nothing on the override itself, because the round is about to speak its
own prompt and speech cancels speech (HANDOFF §5).

**To reverse D1–D5:** commit `58425b6` is D5 (`src/island/interactions.ts`,
`src/island/main.ts`, `src/island/governors.ts`, and the four new tests in
`tests/island/interactions.test.ts`). D1–D4 are the follow-up price commit; the
numbers all live in the `governor` block of
`src/island/balance/balance.json`, so retuning is a data change, not a code one.

---

## NEEDS JOE

### N1. Past the crowded wall, eggs are dearer far earlier than they were ever paused

Not a bug and not built around — a consequence of D2 that Joe should see before
Juno does. The new corridor `[1.5, 3.0]` tiles per pet sits **entirely above**
today's effective free zone of roughly `[0.667, 1.5 + 4/P]`. A girl playing at
today's comfortable one-tile-per-animal is, under the new numbers, permanently
past the crowded wall and paying surcharged eggs.

That is arguably the intended pedagogy — it pushes her to do maths and build land
until the island reaches his 1:2 target. But it means the felt change is not
"the stop became a price", it is "reading got dearer unless she builds more".
If that is not what he meant, the fix is not the escalation constants but the
crowded wall itself.

### N2. Can a price rise strand progress she has already banked?

Being checked as part of the price build; flagged here because the answer is
child-facing either way. The risk: she banks part of the sums for a tile, places
a tile she had already earned, crosses the empty wall, and the price of the tile
she is part-way through paying for goes **up** — her progress bar visibly moves
backwards. Nothing she owns is lost, so it is not a §19 breach on the letter, but
a bar that goes backwards is a bad thing to show a six-year-old. If it turns out
to be reachable, the options are to quote the price when the round opens and hold
it, or to measure the tile side against `tilesEarned` (which cannot move
mid-payment) instead of placed fields.
