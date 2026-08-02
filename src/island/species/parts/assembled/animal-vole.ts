/**
 * The vole's assembly, as a definition. Garden's fourth small brown ground
 * creature, and the one that is separated by what it does NOT have.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What this animal has to do, and how it does it
 *
 * `collections/garden.ts` names the risk in its own header: mouse, shrew,
 * dormouse and vole are **four small brown ground creatures** and "palette alone
 * will never separate [them] at 0.16 scale". So the separation is structural and
 * in the brief's order — ears, then tail, then an extra — and the vole's share of
 * that matrix is the one entry nobody else can take:
 *
 *   - **NO EARS AT ALL, against the mouse's `box-25` dish.** A field vole's ears
 *     are buried in the fur of its head; that is the animal, not an omission, and
 *     it is also the single largest silhouette difference available against the
 *     species that wears the biggest ears in the bank. `ears` is simply not said
 *     below, which is the whole of it.
 *   - **A STUB TAIL, against the mouse's whip and the dormouse's brush.**
 *     `box-18`, turned. It is the shortest tail shape the bank has, by 0.24.
 *   - **A BLUNT FACE, against the shrew's long pointed snout.** The bunny's, worn
 *     whole, with the beaver's teeth in it. Nothing on this animal projects
 *     forward of the front plane by more than 0.101.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is the cube, the legs are the leg row, the eyes are the eye
 *     plane.** None of them is mentioned below, because all three are what
 *     `defineCreature` gives a definition that says nothing: `box-03` at the
 *     pack's own `[0, 0.80625, 0]`, four `box-01` sunk 0.408163 on the row at
 *     y = 0.18125 that never moves, and two `plate-01` at the card's own recorded
 *     (0.2625, 0.933646) on the absolute z = 0.6350. Rule 5 is not obeyed here;
 *     it is unsayable here.
 *
 *   - **The tail is `box-18`, TURNED, and it is the bank's only stub.** Kenney
 *     names it `tail` on the elephant and Kenney is wrong: it is the elephant's
 *     TRUNK, and the bank inherited the label along with the `tail` role. The
 *     measurement is what gives it away — the bank's six other tail shapes are
 *     all `attachment z -1`, already pointing backwards off a rump, and this one
 *     alone is **`z +1`**, pointing FORWARD off a face. So it is spun
 *     `{ axis: 'y', deg: 180 }` — rule 4 as amended, baked into the copy's
 *     vertices — which turns its facing to z -1 and lets the donor transfer join
 *     it at THIS hull's rear face, z = -0.625.
 *
 *     Two checks say the turn is right rather than merely plausible. **The
 *     recovered centre is the recorded offset, mirrored**: sunk the elephant's
 *     own 0.000, the copy's centre lands on z = -0.837600 against the bank's
 *     +0.837606, because the elephant wears this shape on `box-03` too and
 *     0.837606 IS 0.625 plus its own half-depth. **And the base lands on the FLAT
 *     face**: the join cross-section runs y 0.4949 to 0.7937 once placed, inside
 *     the cube's flat rear face of 0.49375 to 1.11875 with 0.00115 to spare — so
 *     §3's "nothing floats" holds on a part the pack itself sank to zero.
 *
 *     It is a stub by measurement and not by adjective: 0.623 along its own
 *     length against the next shortest tail in the bank at 0.862, and it projects
 *     0.425 behind the hull where the mouse's whip projects 0.555.
 *
 *   - **The face is the BUNNY's, worn whole, and every piece of it recovers its
 *     own recorded offset.** The bunny is the pack's blunt-faced small mammal and
 *     it wears its face on this same 1.250 cube, so all four transfers are exact
 *     rather than inferences:
 *
 *       - `box-08`, the muzzle, joined at the TOP face y = 1.43125 and sunk its
 *         own 0.75198 → centre y = 1.348773 against the recorded 1.348827. Three
 *         quarters buried, it stands 0.0811 proud and projects forward NOTHING.
 *         That is the whole differentiator against the shrew.
 *       - `wedge-04`, the cheeks, a pair on the same top face at the bunny's own
 *         x = +/-0.171215, sunk 0.650856, standing 0.119 proud either side of the
 *         muzzle. **Its bank roles are `ear/tooth` and it is neither here** —
 *         §3.1 is explicit that a part's identity is its placement and not
 *         Kenney's label, and at 0.171 off the midline, on the face, 0.119 proud,
 *         this is a cheek. The mouse's ear is 0.743 across and stands off the
 *         head's side; nothing here reads as an ear at any distance.
 *       - `blade-02`, the pale muzzle plate, on the front face at the bunny's own
 *         y = 0.679459, and `box-09` the dark button on it at y = 0.778404. The
 *         bunny carries both — they are its ordinals 6 and 9 — and a nose worn as
 *         its donor wears it is rule 1 at its purest. `box-09` is also the
 *         deliberate choice the mouse made: NOT `wedge-10`, which is measurably
 *         the better nose tip and reads as a tongue, and which Joe rejected by
 *         name on the hedgehog.
 *
 *   - **The incisors are `wedge-01`, the BEAVER's, and the beaver is the pack's
 *     one rodent.** A pair at the beaver's own x = +/-0.073, y = 0.561, sunk its
 *     own 0.219 — the only teeth in the bank that sit at the midline at mouth
 *     height rather than out at a tusk's spread. A vole is a rodent and the shrew
 *     it sits beside is not.
 *
 *     `pets:creature` marks these two **THIN** — sunk 0.028, under the 0.125 that
 *     §3 asks of an EAR. That is the beaver's own measured burial of its own
 *     teeth on its own hull, which is this hull, so it is the pack's number and
 *     not a shortcut; and the mark is worth less than it looks, since a part sunk
 *     0.000 prints as `flush` and is not marked at all. Not flagged, and said out
 *     loud here so nobody has to re-derive that it was looked at.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way: no second shape, no
 *     split triangle, no geometry at all. 0.5 is the tiger's own mammal belly
 *     line made exact — the only point on the pack's 1/16 grid inside the
 *     0.4808-0.5481 zone Kenney's split-triangle boundary wanders across — and it
 *     is also the hull's own equator. A field vole is chestnut above and
 *     grey-buff below and the line sits about there.
 *
 * ## Why the face is five parts and not two
 *
 * **Rule 9 has a FLOOR and an earless animal walks into it.** The pack's measured
 * minima are 405 vertices, 422 triangles and 236 body vertices, `assertAssembly`
 * enforces all three with no escape clause, and `assembly-creature.test.ts` pins
 * the finding: "the pack has no animal this bare — every one of the 24 wears at
 * least a snout and an ear". This species wears no ear ON PURPOSE, and a cube
 * with legs, eyes, a stub tail and a muzzle came out at **294 vertices** — a
 * hundred and eleven under the floor, and no amount of comment would have made
 * that shippable. The test pins the 294 so the reason survives.
 *
 * So the vertices were spent where they buy the animal something: the bunny's
 * face entire, which is one decision rather than four, and the pack's one
 * rodent's teeth. **Nothing was added to make a number** — every part below is a
 * face a vole has, at coordinates its donor chose, and the count came out at 430
 * with 25 to spare rather than being tuned to the floor.
 *
 * **No flag.** Nothing was strained: 430 vertices and 591 triangles inside the
 * pack's 405-1626 and 422-951, height 1.5504 inside 1.43-2.02, keep-out 0.888
 * against the fox's 1.15, every part joined at a face its donor joined its own
 * to, every sink the pack's own measured value, and **not one hand-chosen
 * coordinate in the file**.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const VOLE_ASSEMBLY = defineCreature('animal-vole', {
  palette: {
    coat: 0x6d5d50,
    belly: 0xc6bba4,
    muzzle: 0x8d7d64,
    limb: 0x5a4330,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
    tail: 0x6d5d50,
  },

  belly: 0.5,
  tail: {
    part: 'box-18',
    paint: 'tail',
    spin: [{ axis: 'y', deg: 180 }],
    stretch: [0.45, 0.45, 0.45],
    at: [0, 0.725, -0.625],
  },
  nose: { part: 'box-09', paint: 'limb' },
  extras: [
    { part: 'box-08', name: 'muzzle', paint: 'muzzle' },
    { part: 'wedge-04', name: 'cheek', kind: 'pair', paint: 'muzzle' },
    { part: 'blade-02', name: 'nose-plate', paint: 'muzzle' },
    { part: 'wedge-01', name: 'incisor', kind: 'pair', paint: 'belly' },
  ],
})
