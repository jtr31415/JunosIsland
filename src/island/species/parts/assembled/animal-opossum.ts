/**
 * The opossum's assembly, as a definition. Night Time's first of the long-tailed
 * climbers, and North America's only marsupial.
 *
 * ONE SPECIES, ONE FILE. `index.ts` says why one appended line is the whole of
 * the wiring, and it says why the line never precedes the file.
 *
 * ## What this animal has to do
 *
 * An opossum is four things at once and a child names it by the last of them: a
 * long pale pointed face, big naked round ears, a shaggy grizzled coat, and **a
 * long naked prehensile tail**. Three of those four are shape and the bank has
 * all three; the fourth is a colour, and it is the only reason this file paints a
 * tail off the coat.
 *
 * The whole build is therefore a NAKED-SKIN slot spent in four places — the tail,
 * the nose, the feet and the inside of each ear — against a grizzled grey shell.
 * Nothing here is stretched, nothing is spun, and every join point below is
 * either the pack's own recorded number recovered or a bound solved off the
 * hull's own flat faces.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull and the eye plane are the pack's own**, neither mentioned below
 *     because both are what `defineCreature` gives a definition that says
 *     nothing: `box-03` at its own recorded `[0, 0.80625, 0]`, and two `plate-01`
 *     at the card's own recorded (0.2625, 0.933646) on the absolute z = 0.6350.
 *     **The big eye cards were considered and refused.** `plate-14`/`plate-15`
 *     are the pack's biggest at 0.435 x 0.443 and they are unspent; an opossum's
 *     eye is a small black bead in a white face, so the pack's own default card
 *     is the correct one and the biggest pair in the bank is worth more to the
 *     animal in this batch whose eyes ARE its character.
 *
 *   - **THE EARS ARE `box-25`, THE KOALA'S DISH, AND THEY ARE THE BANK'S ONLY
 *     SIDE-MOUNTED EAR.** Measured `x +1`, where every other ear in the bank
 *     stands on the top face (`y +1`) or points forward (`z +1`), and 0.742676
 *     across — nothing else in the bank is half that size. The koala wears it on
 *     `box-03`, this hull, so the donor transfer is EXACT rather than an
 *     inference: joined at this cube's side face x = 0.625 and sunk the koala's
 *     own 0.533662, its y and z are untouched by the join and are therefore the
 *     bank's recorded 1.056956 and 0.126002, recovered rather than chosen.
 *
 *     Two consequences worth stating. **It costs no height at all**: the dish
 *     tops out at 1.056956 + 0.371338 = 1.428294, which is 0.003 UNDER the bare
 *     cube's own 1.43125, so a pair of ears half the width of the body adds
 *     nothing to the silhouette's height — the measured 1.5858 is the TAIL, not
 *     the ears. And **it is buried 0.396**, three times §3's 0.125 floor, so
 *     nothing floats. What the ears DO cost is width: 1.943 across, and the
 *     keep-out below is half of it.
 *
 *     **`animal-mouse` (Garden) wears this same shape and the overlap is
 *     deliberate** — reuse is house style, and Kenney used one leg 86 times. What
 *     makes this one not a mouse's: the mouse paints the dish from its coat with
 *     the koala's own band 1 as a pale inner disc, and this paints the SHELL near
 *     black and the inner disc PINK, off the same naked-skin slot as the tail and
 *     the nose. An opossum's ear is bare skin, not fur, and that is the read.
 *
 *   - **The snout is `tube-03`, the deer's, and it is placed entirely by the
 *     donor transfer.** 0.532 long against the bank's next-longest muzzle at the
 *     same 0.532 — it is the long end of the family — attaching `z +1` at a
 *     measured burial of exactly ZERO. Joined at this cube's front face z = 0.625
 *     its centre lands on **z = 0.740700 against the deer's own recorded
 *     0.740710** — 1.0e-5, which is as close as a solve running through
 *     `bank.generated.ts`'s four-decimal positions can get to a six-decimal
 *     `size` — and its height is the deer's own 0.757432 for the same reason:
 *     the join moves it along one axis and leaves the other two alone. That
 *     agreement is the evidence the transfer is legitimate (§8), because the
 *     recovered number was never used to get there.
 *
 *     **`tube-06` was considered and refused.** It is the fox's muzzle, the same
 *     bounding box to six decimals, and a different mesh — 34 triangles against
 *     22, split into an upper and a lower band. `animal-badger.ts` spends it for
 *     exactly that split (Kenney's own cut, painted dark along the top of a white
 *     muzzle). This animal wants ONE flat cream cone with no cut in it, so the
 *     fox's mesh would be twelve triangles bought for a boundary we would then
 *     paint out. The deer's single band 5 is the shape at the price of the shape.
 *
 *   - **The nose is `box-22`, the fox's nose-tip, on the muzzle's own front
 *     plane** — `on: 'snout'`, so the builder anchors it to the placed outer face
 *     measured off the built vertices rather than to an arithmetic this file
 *     would carry a stale copy of. It is 0.228845 x 0.150508 x **0.155703**, and
 *     the depth is why it is here: twice the reach of the bunny's `box-09`
 *     (0.0798) on a nose only 0.046 wider. An opossum's nose is a prominent pink
 *     knob on the end of the cone, not a dot on it.
 *
 *     It sits on real geometry, which is not automatic: at 0.229 wide against the
 *     muzzle's 0.532 front face it is backed everywhere. `animal-mole.ts` refuses
 *     a nose button for the opposite measurement — its snout is `cone-06`, whose
 *     anchor is an APEX with no width at all — and the difference is the whole
 *     reason this species does not wear the parrot's beak.
 *
 *   - **`cone-06` was considered and refused as the snout**, and it is the
 *     obvious candidate: taper 0.000, a true point, the only genuinely pointed
 *     muzzle in the bank, worn by `animal-mole.ts` and `animal-hedgehog.ts`. It
 *     is refused for its tip. An opossum's face ends in a big pink nose and a
 *     cone's apex cannot hold one (see above), so taking `cone-06` means giving
 *     up the nose — and the nose is the pink that makes the pale face read as an
 *     opossum's rather than as a shrew's.
 *
 *   - **THE TAIL IS `wedge-07` AT y = 1.0625, AND THAT HEIGHT IS SOLVED, NOT
 *     CHOSEN.** The rope's join end is not its bounding box: within 0.10 of its
 *     own join face its material runs local y **-0.5233 to -0.1113** — the thick
 *     root leaves low and the shape sweeps up and back behind it. `box-03` cuts
 *     every edge and every corner, so its flat rear face is only 0.625 square and
 *     runs y **0.49375 to 1.11875** (the hull centre plus or minus its own
 *     `topFlatZ` of 0.3125). The lowest centre at which the WHOLE root is backed
 *     by flat face is therefore 0.49375 + 0.5233 = 1.01705, and **1.0625 = 17/16
 *     is the next notch up the pack's own authoring grid**.
 *
 *     That is 0.124 BELOW the cat's own recorded 1.186701, which is what makes
 *     the tail trail instead of being carried — a cat's tail is held up and an
 *     opossum's drags — and it is 0.16 above `animal-mouse.ts`'s hand-picked
 *     0.900, which is the height at which the root drops off the flat face and
 *     onto the chamfer. Everything else about it is the pack's: its own measured
 *     mean burial of 0.159043 over its two donors, no spin, no stretch.
 *
 *     **It is painted `naked`, and that is the point of the animal.** It is the
 *     only tail in this collection painted off something other than the coat,
 *     because a bare pink rope hanging off a grey animal is the single thing a
 *     child names an opossum by.
 *
 *     **The overlap, said out loud.** The bank has exactly two thin ropes,
 *     `wedge-07` and `wedge-18`, identical to six decimals in every dimension and
 *     different only in mesh. `animal-mouse.ts` and `animal-newt.ts` wear this
 *     one; `animal-salamander.ts` and `animal-civet.ts` wear its twin. What makes
 *     ours not any of those: it is PALE where every other one is coat-coloured,
 *     and it hangs at 1.0625 where the mouse's is at 0.900 and the salamander's
 *     and the civet's are at the donor's own 1.186701.
 *
 *     **The tail is also this animal's height and most of its keep-out.** The
 *     rope leaves the rump low and sweeps up and back, so its top at
 *     1.0625 + 0.5233 = **1.5858 is the tallest point on the model** — above the
 *     ears, which reach 1.428. `pets:creature` marks the join `sunk 0.088 THIN`
 *     and it is right to print it and wrong to read it as a fault: 0.125 is §3's
 *     floor for an EAR, and 0.088303 is the mean of what the cat and the monkey
 *     themselves buried this shape by. The root genuinely sits inside the hull
 *     (it reaches z = -0.537 against a rear face at -0.625, on the part of that
 *     face that is flat, by the whole derivation above), so nothing floats.
 *     Deepening it to clear a printed threshold would mean discarding a
 *     measurement to satisfy a warning.
 *
 *   - **The legs are the pack's leg row and they are painted `naked` too**, which
 *     is the whole of what `limb: 'naked'` below does: four `box-01` sunk 0.408163
 *     on the row at y = 0.18125 that never moves, at the 0.27 and 0.25 stations
 *     the builder solves for this hull. An opossum's feet are bare pink and its
 *     hind foot has an opposable thumb; the bank has no toe, so the colour is
 *     where that lives.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way — no second shape and no
 *     split triangle. The tiger's own mammal line made exact: §7 measured the
 *     pack's boundary wandering across 0.4808-0.5481 and 8/16 is the only point
 *     on the pack's 1/16 grid inside that zone, as well as this hull's own
 *     equator.
 *
 *   - **NO TEETH.** `wedge-01`/`wedge-02` are the beaver's incisors, they carry
 *     the pack's `tooth` role, and they would mount on this muzzle at the pack's
 *     own burial for nothing. An opossum famously has fifty of them and brief §19
 *     is "bright, never scary", so they are left off deliberately. That is a look
 *     decision and it is Joe's; it is recorded here so the next builder does not
 *     helpfully add them.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `collections/night-time.ts` was written in the same run as this file and
 * carries no colours at all — every member of this collection is one line of
 * `defineSpecies(id, 'bespoke')` — so this species has never had a record to
 * carry colours and the five below are the first ever proposed for it.
 * Every one is marked UNREVIEWED. **Joe should look at them**, and particularly
 * at `naked`: it is doing four jobs at once and it is the animal.
 *
 * **No flag.** Nothing was strained. Nothing is stretched, nothing is spun, no
 * part is authored, the hull is the shell at its own size, and every number above
 * is either a recovered donor offset or a bound solved off the hull's own
 * measured faces. Measured on the built model: **height 1.5858** inside the
 * pack's 1.43-2.02, feet on y = 0; **734 triangles** inside 422-951; **493
 * vertices** inside 405-1626 and 365 in the body inside 236-1114; **keep-out
 * 1.052** against the fox's own 1.15, which is the pack's worst and the number
 * the island already copes with. The keep-out is the widest thing about this
 * animal and it is worth Joe's eye: 1.943 across the ears and 2.104 front to
 * back, which is the dish ears and the trailing rope spending it in two
 * directions at once.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * The lowest notch on the pack's 1/16 grid at which the rope's whole root is
 * backed by the cube's FLAT rear face.
 *
 * `wedge-07`'s material within 0.10 of its own join face runs local y -0.5233 to
 * -0.1113; `box-03`'s flat rear face runs 0.49375 to 1.11875. So the bound is
 * 0.49375 + 0.5233 = 1.01705 and this is the next grid point above it. It trails
 * 0.124 lower than the cat carries the same shape.
 */
const TAIL_Y = 1.0625

export const OPOSSUM_ASSEMBLY = defineCreature('animal-opossum', {
  /* NEW AND UNREVIEWED. Night Time has no collection file, so no colour here was
   * ever agreed — these are the first five ever proposed for this species. */
  palette: {
    coat: 0x8f8d88,    // UNREVIEWED: grizzled grey, the shaggy coat
    belly: 0xe8e2d4,   // UNREVIEWED: the pale face, the underside, the sclera
    naked: 0xdcb6ad,   // UNREVIEWED: BARE SKIN — the tail, the nose, the feet, the inner ear
    ear: 0x3a373c,     // UNREVIEWED: the near-black ear shells
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* Legs, muzzle and nose default off this slot. An opossum's feet are bare. */
  limb: 'naked',

  /* The tiger's mammal line made exact — the only 1/16 point inside the pack's
   * own measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  /* THE EARS. The koala's dish, the bank's only SIDE-mounted ear and its biggest
   * at 0.743 across, on the koala's own hull — so the transfer is exact and its
   * y and z are the bank's recorded numbers recovered. Black bare skin with the
   * koala's own band-1 inner disc pink. `animal-mouse.ts` wears the same shape
   * from its coat; this one is skin. */
  ears: { part: 'box-25', paint: { base: 'ear', byBand: { 1: 'naked' } } },

  /* THE FACE. The deer's muzzle, 0.532 long, sunk its own zero, so joining it at
   * z = 0.625 recovers the deer's own recorded 0.740710 — the evidence, not the
   * input. Cream, in one flat band. Not the fox's `tube-06`: same box, 12 more
   * triangles, and the only thing they buy is a cut this animal paints out. */
  snout: { part: 'tube-03', paint: 'belly' },

  /* The fox's nose-tip on the muzzle's own placed front plane. 0.1557 of reach,
   * twice the bunny's `box-09`, and backed everywhere by a 0.532-wide face —
   * which is why the snout is a muzzle and not `cone-06`'s apex. */
  nose: { part: 'box-22', on: 'snout' },

  /* THE ANIMAL. The cat's rope, PALE, trailing at the lowest 1/16 notch that
   * keeps its whole root on the cube's flat rear face. Its own measured burial,
   * no spin, no stretch. See TAIL_Y. */
  tail: { part: 'wedge-07', paint: 'naked', at: [0, TAIL_Y, -0.625] },
})
