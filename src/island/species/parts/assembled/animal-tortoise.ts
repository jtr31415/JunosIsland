/**
 * The tortoise's assembly, as a definition — and the hardest species in the
 * collection, because the one part it needs is the one part the pack does not
 * have.
 *
 * ## THE KNOWN PROBLEM, stated first
 *
 * **There is no shell and no carapace in the bank.** That is measured, not
 * feared: §5's own list of what lifted parts do not reach names "shell or
 * carapace" out loud, and a search of the bank returns no dome, no half-sphere
 * and no domed plate at body scale. A tortoise IS a shell. So this species goes
 * through §2's escape clause — best attempt, flagged, with the strain named —
 * and the `flag` below is the real output of this file.
 *
 * **Nothing here is authored.** Rule 1 says adapt before authoring and a dome is
 * Joe's call to commission, not a builder's to write; the hedgehog's nose sphere
 * is the one time that call has been made, and it was made by him after seeing
 * the lifted alternative. So the lifted alternative is what is here.
 *
 * ## The best attempt: a shell RIM, not a shell
 *
 *   - **`box-19` is the fish's `body-shell-overlay`, a whole-body shell RING** —
 *     1.404 x 1.404 x 0.520, role `band`, a square annulus whose hole is only
 *     0.65 across. Stood up as its donor wears it it is a ring around a fish.
 *     Turned FLAT — `{ axis: 'x', deg: 90 }` — it is a horizontal band that runs
 *     right round the body at 0.702 against the cube's own 0.625, so it stands
 *     **0.077 proud all four sides** and the cube fills its hole completely. That
 *     is a tortoise's marginal rim: the line where the carapace overhangs.
 *
 *   - **It is HALVED in thickness, and that is rule 3 rather than taste.** At the
 *     fish's own 0.520 the ring's bounding box is 1.025 against the hull's 1.953
 *     — a ratio of **1.9**, which is not a detail on a body, it is a SECOND
 *     LARGE MASS beside one, and that is the exact fault that scrapped 72
 *     animals. `stretch: [1, 1, 0.5]` takes it to 0.260 thick, bounding box
 *     0.513, ratio **3.81**, and a 0.26 band on a 1.25 body reads as a rim where
 *     a 0.52 one reads as a drum. Rule 1 sanctions the stretch in its first
 *     clause — *stretch, rotate or otherwise manipulate an existing shape* — and
 *     it is on a feature, not on the hull, so it needs no `stretchWhy`.
 *     The builder does not stop `box-19`: its role is `band`, not `hull`, so the
 *     one-mass throw never fires and the ratio is the only thing holding the
 *     line. It is held on purpose, not by luck.
 *
 *   - **`axis: 'z', dir: -1` is the tortoise-hoop trick, and it is why the depth
 *     reads true.** The ring's measured attachment is `y +1`; after the flat turn
 *     that facing points FORWARD, and a sink measured along it would be measured
 *     along the ring's 1.404 diameter instead of its 0.260 thickness. Overriding
 *     the axis to the ring's own short direction puts the facing back on +y, so
 *     `sink: 0.5` means what it says: the band straddles the plane it is joined
 *     at, half above and half below, 0.130 either way.
 *
 *   - **The join, `at: [0, 0.65, 0]`, is the ONE chosen number in this file, and
 *     it is chosen to be the same line as the paint.** The donor transfer cannot
 *     reach here: it joins at a FACE, and a band that runs round a body is joined
 *     at neither the top nor the side. 0.65 is `HULL_BOTTOM_Y + 6/16 x 1.250`,
 *     which is exactly where `belly: 0.375` puts the painted carapace line — so
 *     the rim and the colour change are one line and not two, and
 *     `assembly-tortoise.test.ts` pins that they agree. Above it the animal is
 *     olive carapace; below it is the pale horn plastron the legs come out of.
 *
 *   - **The carapace colour is PAINTED, §4's second way** — no second shape, no
 *     split triangle, no geometry at all for the shell/skin boundary.
 *
 *   - **The SCUTES are §8's chamfer idiom, and they are the closest the bank
 *     gets to a dome.** The idiom exists for exactly this problem, in Joe's own
 *     words: *a row of parts on each flat face and another on the chamfer
 *     between them, so a cubic body reads as ROUND.* `wedge-08` is the
 *     caterpillar's flat plate — 0.174 x 0.167 x 0.050, and the pack lays it ON
 *     a body rather than into one (sink 0.000) — which is what a scute is. Four
 *     to a row, turned `{ axis: 'x', deg: -90 }` from its measured `z +1` onto
 *     the vertical, on the top face and on both upper chamfers: three rows whose
 *     facings step -45, 0, +45 degrees, and a crown that curves instead of being
 *     one flat plane. `ridgeSpan` puts the stations on the pack's own 1/16 grid
 *     at +/-0.28125 and +/-0.09375, inside the 0.3125 the flat top face reaches,
 *     so §3's "nothing floats" is arithmetic and not an opinion.
 *
 *     **The two SIDE rows the hedgehog uses are deliberately left off.** They
 *     would sit at y = 0.80625 on the side faces and run straight through the
 *     rim at 0.520-0.780; a carapace has plates on its crown and a rim at its
 *     edge, and nothing between. So the curve this animal buys is a quarter
 *     turn, not the hedgehog's half — which is honest, and it is still not a
 *     dome.
 *
 * ## The rest, all of it the pack's own
 *
 *   - **The hull is `box-03`, the 1.250 cube**, at the pack's own `[0, 0.80625,
 *     0]`, unstretched. **A tortoise is LOW in life and cannot be low here**:
 *     `HEIGHT_FLOOR` is 1.43125 for a bare cube on standard legs against a pack
 *     minimum of 1.43, so there is no headroom underneath at all and the
 *     shortness has to go unexpressed — the scutes then stand 0.050 proud of the
 *     top face and the animal measures 1.48125. The crab's `box-13` was the obvious flat
 *     shell and is **rejected by measurement, not by taste**: 0.450556 tall on
 *     `HULL_BOTTOM_Y` puts the whole animal at 0.632, under the floor by 0.80.
 *     Do not re-run that search; it comes back with the same shape (§2).
 *
 *   - **No ears.** Tortoises have none, and the bank cannot be asked for one it
 *     would then have to justify.
 *
 *   - **The tail is `box-18` spun 180 degrees.** The bank calls it `tail` because
 *     Kenney's node was called `tail`; it is really the elephant's TRUNK, and the
 *     inherited name is recorded here so nobody re-derives it. Turned back to
 *     front it is the only stub in the bank — 0.425 long against the whip tails'
 *     reach — and it joins the rear face at the donor's own y = 0.482248 and its
 *     own measured sink of 0.000. Every number of it is the pack's.
 *
 *   - **The legs and the eyes are what `defineCreature` gives a definition that
 *     says nothing**: four `box-01` sunk 0.408163 on the row at y = 0.18125 that
 *     never moves, and two `plate-01` at the card's own (0.2625, 0.933646) on the
 *     absolute z = 0.6350. Rule 5 is unsayable here, not merely obeyed.
 *
 *   - **The palette is four plausible garden-tortoise colours plus the measured
 *     pupil**: an olive carapace, a horn-brown that is the rim AND the scutes so
 *     the shell reads as one system, a pale horn plastron that is also the
 *     sclera, and a duller grey-olive skin for the legs and the tail.
 *
 * **Flagged, and this is what the flag is for.** Everything measurable passes —
 * height 1.48125 inside 1.43-2.02, one mass at 3.81, every mesh a bank shape,
 * budgets inside the pack's own ranges — and the animal still is not a tortoise,
 * because a tortoise is a dome and the bank has no dome. That gap is the thing
 * Joe is being asked to rule on.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const TORTOISE_ASSEMBLY = defineCreature('animal-tortoise', {
  palette: {
    coat: 0x6f7a45,    // olive carapace
    belly: 0xd7c79c,   // pale horn plastron, and the sclera
    horn: 0x8a6a3c,    // horn-brown, for the shell rim alone
    limb: 0x6b6455,    // duller skin: legs and tail
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The carapace line, PAINTED (§4 way 2): 6/16 of the hull's own height, which
   * is world y = 0.65 — the same line the rim is joined at, by construction. */
  belly: 0.375,

  /* THE BEST ATTEMPT AT A SHELL. The fish's whole-body shell-ring laid FLAT: a
   * rim 0.077 proud of the cube on all four sides. Halved in thickness because
   * at the fish's own 0.520 its bounding box is 1.9x under the hull's, which is
   * a second mass and rule 3; halved it is 3.81x and a rim. `axis: 'z'` puts the
   * facing back on +y after the turn, so `sink: 0.5` straddles the join plane. */
  extras: [{
    name: 'rim',
    part: 'box-19',
    paint: 'horn',
    spin: [{ axis: 'x', deg: 90 }],
    axis: 'z',
    dir: -1,
    stretch: [1, 1, 0.5],
    sink: 0.5,
    at: [0, 0.65, 0],
  }],

  /* THE CARAPACE, as near as the bank goes: the caterpillar's flat plate, four
   * to a row, on the top face and both upper chamfers. §8's idiom — the pack's
   * own way of making a cubic back read ROUND without authoring a curved shape.
   * No side rows: they would run through the rim. */
  ridge: {
    part: 'wedge-08',
    paint: 'horn',
    name: 'scute',
    count: 4,
    rows: ['top', 'chamfer'],
    spin: [{ axis: 'x', deg: -90 }],
  },

  /* The elephant's TRUNK — the bank inherited Kenney's wrong name — turned back
   * to front, which is the bank's only stub tail. Rear face, donor's own height,
   * donor's own sink. */
  tail: { part: 'box-18', paint: 'limb', spin: [{ axis: 'y', deg: 180 }] },

  flag: 'THE PACK HAS NO SHELL AND NO CARAPACE — measured, not guessed (§5 names '
    + 'it) — so this tortoise is the 1.250 cube wearing the fish\'s whole-body '
    + 'shell-ring box-19 turned FLAT and halved in thickness as a shell RIM (at '
    + 'its own 0.520 it is 1.9x the hull and becomes a second mass, which is rule '
    + '3 and the fault that scrapped 72), a carapace line PAINTED at 6/16 rather '
    + 'than modelled, and twelve caterpillar plates laid on the top face and both '
    + 'upper chamfers by §8\'s idiom to buy a quarter turn of curve where a dome '
    + 'is wanted — the crab\'s flat box-13 having been rejected by measurement at '
    + '0.632 tall against a 1.43 floor: it reads as a shelled animal and not yet '
    + 'as a tortoise, and a domed carapace is the one bespoke part this collection '
    + 'would pay to author.',
})
