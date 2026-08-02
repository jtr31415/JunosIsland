/**
 * The horse — Farm's big equid, and the EXEMPLAR the collection's other four
 * hooved quadrupeds (donkey, mule, ox, water buffalo) are cut from.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * ## READ `animal-pony.ts` FIRST. This file does not restate it.
 *
 * JT-044 — *"just use a two tone leg for hooves"* — is derived in full at
 * `animal-pony.ts:8-60` and pinned as facts by `assembly-pony.test.ts:87-283`:
 * that there is no `hoof` in the bank, that `at` must be k/16, that the patch
 * applies to the BASE slot only and is never combined with `byBand`, that a spun
 * part's boundary rakes and legs are therefore safe by construction, and that
 * `box-01`'s bevel runs 0.0625 up from its sole so 4/16 is the LOWEST grid point
 * that clears it. **None of that is re-argued here. The line below is the pony's
 * line, character for character, and a sibling deriving from this file should
 * copy it without touching the number.**
 *
 * What IS this file's own, and what the four siblings should take from it:
 *
 *   1. **`box-41` is available to a hooved animal, and the pony was wrong to
 *      refuse it.** The refusal at `animal-pony.ts:69-82` is off the BOUNDING
 *      BOX. Off the vertices it does not hold — see §1 below. Four Farm species
 *      want a bigger shell and this is the finding that lets them have one.
 *   2. **The hull's own BAND 3 is a better belly than a `belly` line**, and on a
 *      long-faced animal it is also the muzzle. §3.
 *   3. **A hull with a muzzle boss wants the GIRAFFE's muzzle and not the fox's**,
 *      and the reason is arithmetic rather than separation. §4.
 *   4. **A second two-tone line is REFUSED here, with the arithmetic.** §6.
 *
 * ## 1. THE HULL IS `box-41`, AND THE PONY'S REFUSAL OF IT DOES NOT HOLD
 *
 * `animal-pony.ts` refuses `box-41` because *"its front face stands at z = 0.725
 * ... Both eye cards would sit 0.090 behind that surface"*. That is `offset[2] +
 * size[2] / 2` — the bounding box — and on this shell the bounding box lies on
 * three of its six faces. Measured off the 454 baked vertices instead:
 *
 *     what reaches z = 0.725      8 points, |x| <= 0.200, y 0.49375 to 0.89375
 *     the flat front PLATE        34 points at z = 0.625, |x| <= 0.3125,
 *                                 y 0.49375 to 1.11875
 *     the eye card                (+-0.2625, 0.933646, 0.635)
 *
 * So the thing at 0.725 is a 0.400 x 0.400 **muzzle boss** standing 0.100 proud,
 * and it stops **0.039896 below the eye card's own centre**. The plate the cards
 * actually land on is at 0.625 — `HULL_FRONT_Z_USUAL`, `box-03`'s own front face
 * — so `EYE_CARD_Z`'s 0.635 gives them the pack's own `CARD_STANDOFF` of 0.010
 * here exactly as it does on the cube. `animal-rat.ts:81-89` already wears this
 * shell with eyes and records the same thing, and `animal-lovebird.ts:72-98`
 * measured all six faces: **`box-41` IS `box-03` with its edges filled out.**
 * Re-measured here, world coordinates, and the four that this build then spends:
 *
 *     face        box-41                          box-03
 *     front       0.625, |x| <= 0.3125, y 0.49375-1.11875   identical
 *     rear       -0.625, |x| <= 0.3125, y 0.49375-1.11875   identical
 *     flank      +-0.625, y 0.49375-1.11875                 identical
 *     top         1.43125, |x| and |z| <= 0.3125            identical
 *
 * plus three extra bosses the cube has not got: the muzzle at z = 0.725, two
 * flank pads at x = +-0.675, and **two raised TRANSVERSE CROWN PADS at
 * y = 1.48125**. The crown is the one worth writing down, because the vertex
 * list reads as two side ridges and it is not — ray-cast straight down over a
 * grid, the shell answers 1.48125 across the **whole** width |x| <= 0.3276 over
 * **z 0.1383 to 0.2575** and again over **z -0.2575 to -0.1383**, and dips back
 * to 1.43125 in the saddle between them at z = 0. Two bars across the poll, 0.050
 * proud, with a hollow between. They are the tiger's, because `box-41` is the
 * tiger's shell.
 *
 * **That is why a horse takes it and a Shetland does not.** It is 1.213x the
 * cube's volume with the leg row scaled out with it (`creature.ts:740-741`:
 * 0.27 x 1.08 = 0.2916 across, 0.27 fore-and-aft), which is a heavy horse
 * standing wide; and it arrives with a muzzle boss already cut and a raised poll
 * to stand the ears on, which are the two things a horse's head is. The pony is
 * on `box-03` and this animal is 1.35 x 1.30 x 1.35 against its 1.250 cube, so
 * they do not read as the same animal at two sizes — they read as two shells.
 *
 * ## 2. WHAT A CHILD NAMES A HEAVY HORSE BY, AND THE PALETTE ARGUMENT
 *
 * **The brief proposed a BAY — red-brown with black points — and it is refused,
 * because `animal-pony` is already exactly that.** Its own file: coat `0x9a5f33`,
 * *"a saturated red-bay"*, with `mane: 0x33281f` painting the mane, the forelock,
 * the tail and the nose. A bay horse beside a bay pony is one animal at two
 * sizes, which is the single failure this species was told to avoid, and no hull
 * choice rescues a coat a child reads first.
 *
 * So this is the OTHER heavy-horse colour, and it is the one the actual draught
 * breeds wear: **golden chestnut with a flaxen mane and tail** — the Belgian and
 * the Haflinger. It is the exact inverse of the pony at the two places a child
 * looks: the body is lighter and goldener, and the mane and tail go from
 * near-black to cream. It is not the zebra's chalk-white (Africa), not the
 * donkey's grey, and it leaves black free for the water buffalo.
 *
 * It also buys the JT-044 line its best possible reading. A pale gold leg with a
 * dark horn foot is the highest contrast any hoof in this collection will have,
 * which is what an exemplar four species copy from should be showing.
 *
 * FIVE SLOTS, one fewer than the pony, because `pale` does four jobs off one
 * fact — this horse's flaxen mane, its flaxen tail, its mealy muzzle-and-
 * underline and its sclera are the same cream — and `hoof` does two, because a
 * horse's horn and the skin of its muzzle are the same dark grey-brown.
 *
 * ## 3. THE BELLY IS BAND 3 AND NOT A `belly` LINE — the sibling's tool
 *
 * `box-41` arrives cut into three bands and Kenney's own boundaries are better
 * than any horizontal this species could draw. Measured, world:
 *
 *     band 3    37 tris   |x| <= 0.500, y 0.1813-0.8938, z -0.3125 to 0.7250
 *     band 7    57 tris   |x| <= 0.625, y 0.1813-1.4312, z -0.625 to 0.625
 *     band 15  168 tris   |x| <= 0.675, y 0.8063-1.4813, z -0.3125 to 0.3125
 *
 * **Band 3 is the underline AND the whole muzzle boss, in one entry.** That is
 * the pangare / mealy pattern — pale muzzle, pale underline — which is what a
 * Haflinger has, and it costs no geometry and no straight line. A `belly: 0.5`
 * could not have reached the muzzle: it paints a plane at a fraction of the
 * hull's HEIGHT, and this animal's pale is in front of it as well as under it.
 *
 * There is also a hard reason the two cannot both be used. `creature.ts:585-587`
 * turns `belly` into a `patch` on the hull's paint, and JT-044's second
 * constraint is that `patch` and `byBand` are never combined on one part — a
 * triangle a `byBand` has already redirected keeps its flat colour
 * (`assembly.ts:358-366`), so half the hull would silently ignore the line. **A
 * species on this hull chooses one or the other.** This one chooses the band.
 *
 * **Donkey and mule: this is your pale muzzle and your pale belly, in one line.**
 *
 * ## 4. THE MUZZLE IS THE GIRAFFE'S, AND THAT IS FIT AND NOT SEPARATION
 *
 * The bank holds three 0.532-wide barrels: `tube-03` (deer), `tube-06` (fox, the
 * pony's) and `tube-07` (giraffe). `animal-rat.ts:45-54` is right that swapping
 * between shapes that are the same box is *"a naming trick and not a
 * separation"*, so this one is not taken to be different from the pony's. It is
 * taken because it is the only one that FITS this hull, and three numbers land
 * on top of each other to say so:
 *
 *   - The boss's flat front is only **0.400 across** (|x| <= 0.200) where the
 *     cube's front face is 0.625 square. `tube-06` is sunk **0.000** by its own
 *     record, so laid on that plane it overhangs the boss by 0.066 a side across
 *     a 0.100 step and shows daylight at both corners — `animal-rat.ts:155-166`
 *     measured exactly this and reached the same shape.
 *   - `tube-07` is the only one of the three the pack ever SANK: 0.37594 of its
 *     own 0.266, which is **0.100000** — and the boss stands **0.100** proud.
 *     So the muzzle's rear face lands flush on the 0.625 plate, whose |x| <=
 *     0.3125 covers its own 0.266 half-width with 0.046 to spare. Nothing is
 *     chosen; the burial the giraffe used is the depth this shell has.
 *   - Its recorded centre is y = 0.74375 and it is 0.300 tall, so its top edge
 *     lands on **y = 0.89375, which is the boss's own top edge, to the digit.**
 *     Both are Kenney's ungulate face height and they were never compared.
 *
 * Every field is therefore solved: no `at`, no `sink`, no `stretch`. It is
 * painted `pale` because the surface it grows out of is band 3 and is pale, so
 * a coat-coloured muzzle would put a hard seam across one continuous face.
 *
 * ## 5. THE EARS, THE MANE AND THE TAIL
 *
 *   - **EARS: `cone-01`, stretched 2x in x only — the pony's recipe, taken
 *     deliberately, and re-sited on this shell's own ear ridges.** The ear
 *     argument at `animal-pony.ts:83-122` is a measurement over all ten upright
 *     ears in the bank and it does not change because the animal got bigger: it
 *     is the tallest upright ear that is not the rabbit's, it is the only one of
 *     its size that comes to a POINT (taper 0.000), and its own burial of 0.125
 *     is §3's nothing-floats floor exactly. The rabbit's `box-06` stays refused
 *     and goes to the donkey, which is what its silhouette is for.
 *
 *     **Only the z is chosen; the x and the y are both recoveries**, which is the
 *     pony's own situation on a different shell. `x = 0.2276` is `cone-01`'s
 *     recorded offset — the bee's placement, and the pony's. `y = 1.48125` is
 *     `frame.top` for this hull, which is the SOLVE's own y: the ears stand on
 *     the front crown pad, at the height the shell already offers. `z = 0.2500`
 *     is 4/16, on the pack's grid, and it is inside the front pad's own z span
 *     of 0.1383 to 0.2575 with 0.0075 to spare. The solved z is refused for the
 *     pony's reason made worse: `cone-01`'s recorded 0.469709 is the bee's, on a
 *     cube, and ray-cast at (0.2276, 0.4697) `box-41`'s crown has fallen to
 *     **1.326444** while a 0.125 burial puts the ear's underside at **1.35625** —
 *     it would stand **0.029806 clear of the hull**, where the pony's own copy of
 *     this refusal measured 0.032 on the cube. §3 says nothing floats.
 *
 *     **The seating is measured rather than asserted, and it is better than the
 *     shipped pony's.** Twenty of `cone-01`'s 68 vertices sit below the join
 *     plane and are the ones that must be inside the mass. Ray-cast against the
 *     hull under each:
 *
 *         pony, box-03,  join 1.43125    16 of 20 inside, 0.03814 of daylight
 *         this, box-41,  join 1.48125    16 of 20 inside, 0.02805 of daylight
 *         this, box-41,  join 1.43125    20 of 20 inside, NONE
 *
 *     The third row is real and is deliberately not taken: dropping to the flat
 *     top plate buries the ear's outer base corner completely — the front crown
 *     pad rises 0.050 exactly where the cube shows its gap — but it costs the
 *     animal 0.050 of height, which is the whole of what the bigger shell bought,
 *     and lands it on **1.7066, the pony's own height to four decimals.** So the
 *     join is the crown, the daylight is 0.028 at one base corner of a 0.400 ear
 *     and is smaller than what already ships, and the horse stands 1.7566.
 *     **A sibling that would rather have the perfect seating than the 0.050 knows
 *     the number: join at `TOP_PLATE_Y`.**
 *
 *   - **MANE: one `bespoke-square-01`, run over the two crown pads and the
 *     saddle between them.** JT-041 sanctions the three base shapes with no
 *     flag; there is no mane in the bank, and `ridge` cannot wear a primitive
 *     because `creature.ts:761` resolves a ridge part with `partById` alone
 *     (PB-077, proved to throw by `assembly-pony.test.ts:450-467`). So it is a
 *     wall, re-cut — a primitive is re-cut at its stretched size rather than
 *     multiplied (`authored.ts:284`), so it keeps a chamfer at 0.25 of its own
 *     smallest dimension and still belongs to this pack.
 *
 *     **0.1875 thick — 3/16, and 1.5x the pony's 0.125.** A Shetland's crest is
 *     thin and a draught horse's is not; this is the one dimension where "heavy"
 *     is sayable at all, since the hull cannot be scaled. It runs the full 0.625
 *     of the top plate, z -0.3125 to +0.3125, so both ends stop exactly where the
 *     plate does and each is buried its whole 0.250 rather than riding a chamfer
 *     that has begun to fall. Half-buried at the primitive's own declared 0.5
 *     sink leaves 0.250 proud, which is 4/16.
 *
 *     Joined at `TOP_PLATE_Y` and not at the crown, so the two pads it crosses
 *     take 0.050 back out of it: the crest stands **0.250 proud over the saddle
 *     and at both ends, and 0.200 where it rides each pad.** That is the shell
 *     modulating the mane rather than the mane being a flat fin, and it is
 *     something the pony's cube had no way to do.
 *
 *   - **FORELOCK: the same shape on the brow chamfer, and a correction to the
 *     pony while we are here.** `box-41` runs its front-top chamfer between the
 *     same two flat plates as `box-03`, so the chord midpoint is the same
 *     **(1.275, 0.46875)** and its normal is the same 45 degrees — §8's idiom
 *     transfers whole.
 *
 *     **But neither shell's real surface passes through that chord.** Both are cut
 *     in two steps, not one: from (1.43125, 0.3125) to (1.30625, 0.500) at slope
 *     2/3, and then to (1.11875, 0.625) at slope 3/2. Ray-cast at z = 0.46875 the
 *     surface is at **1.327083 on BOTH shells — 0.052083 above the chord**, which
 *     is 0.036828 along the 45-degree normal. That is good news twice: a part
 *     joined at the chord midpoint is embedded by construction rather than by
 *     luck, and it is why this forelock is cut **0.625 along its own normal
 *     against the pony's 0.500**. 0.3125 proud less 0.036828 leaves **0.2757** in
 *     the silhouette; the pony's 0.250 less the same 0.036828 leaves 0.2132, so
 *     `animal-pony.ts:147-154`'s forelock is 15% less proud than its own note
 *     reads. Recorded rather than corrected — it is not this species' file.
 *
 *   - **TAIL: `box-38` turned upside down, at the pony's own y, and the number is
 *     UNCHANGED — which is the finding, not laziness.** The shape argument is
 *     `animal-pony.ts:161-188`: it is the parrot's fan, its narrow stalk is the
 *     only part of it inboard of the join plane, and `{ axis: 'z', deg: 180 }`
 *     negates x and y while leaving the `z -1` facing alone, so the stalk goes to
 *     the top and the broad fall hangs below it. A dock with hair off it.
 *
 *     `y = 0.662654` is solved, not copied: it is the flat rear face's top less
 *     the fan's own half height, `1.11875 - 0.912191 / 2`. It comes out at the
 *     pony's number **because `box-41`'s rear plate is `box-03`'s rear plate to
 *     the last decimal** (§1), which is the cleanest demonstration in this file
 *     that the two shells share their flat faces. Painted `pale` with the mane,
 *     where the pony's is painted near-black — the single most visible difference
 *     between the two animals.
 *
 * ## 6. WHAT IS REFUSED, WITH THE ARITHMETIC
 *
 *   - **A SECOND TWO-TONE LINE — refused, on the ferret's grounds.** A bay's
 *     black point would be a natural second use and this horse is not a bay (§2).
 *     A flaxen chestnut carries **no boundary on its leg above the coronet**: no
 *     black cannon, no sock, no feather line a colour changes at. The tool draws
 *     a ring at k/16 of the part's height and every k except the hoof's 4/16
 *     would put a marking on this animal that this animal does not have. The
 *     ferret declined for the same reason and the digest is explicit that
 *     declining is a right answer: *"Do not add a marking to use a feature."*
 *     The mechanism is used ONCE here, at full strength, and that is the whole
 *     of it.
 *
 *   - **`box-29`, the lion's mane ring — refused on where it lands.** It is
 *     1.650 x 1.650 x 0.500 and it is a RING, joined on z, sunk 0.5. At its own
 *     recorded centre of y = 0.90625 it spans **y 0.08125 to 1.73125**: it passes
 *     0.100 BELOW this animal's underline at 0.18125 and within 0.081 of the
 *     floor the feet stand on, and it stands 0.150 proud of the widest flank pad
 *     on both sides at once. That is a collar hanging through the belly. A
 *     horse's mane is on the top line only and nowhere else, so no ring can be
 *     one — and this ring is the LION's, which Africa is rostered to build.
 *
 *   - **`belly`, the painted line — refused for band 3**, §3, and it could not
 *     have been combined with it anyway.
 *
 *   - **`tube-06`, the pony's muzzle — refused on 0.066 of overhang a side**, §4.
 *     Recorded so a sibling on `box-03` knows to put it back: on the cube's 0.625
 *     square front face it fits, and there the fox's own 2-band cut is worth
 *     having.
 *
 *   - **`box-12`, the cow's, as the hull** — left for the ox and the water
 *     buffalo, whose own files should take it. `animal-badger.ts` and
 *     `assembly-pony.test.ts:590-595` both measured why an equid cannot: its
 *     extra 0.289 of width is two fused EAR LUGS on a 1.250 cube, so wearing it
 *     is four ears or no upright ears, and upright ears are half of what makes
 *     this a horse rather than a big dog.
 *
 *   - **A MOUTH CARD** — `assembly-pony.test.ts:556-575` solved this and the
 *     answer is worse here, not better: a card joins the hull's front and
 *     finishes at 0.635, and this animal's muzzle reaches 0.891.
 *
 * ## Silhouette, budget, and the four siblings
 *
 * Height **1.7566**, inside 1.43-2.02, feet on y = 0 — 0.050 over the pony, which
 * is exactly this shell's extra crown. Keep-out **1.0556** off
 * `max(width, depth) / 2`, inside `animal-fox`'s own 1.15 and only 0.018 over the
 * pony's 1.038 — the extra shell is 0.100 of width and the island charges for
 * depth. **782 triangles** against `MODEL_TRIS_MAX`'s 951 and **559 vertices**
 * against 1626, and 262 of those triangles are the hull itself, which is the
 * price of the bigger shell and is paid once. The hull is 6.46x the volume of the
 * next biggest thing on the animal. Nothing is over budget, the hull is
 * unstretched, and the only authored geometry is one of JT-041's three base
 * shapes used twice, which needs no flag and gets none.
 *
 * The signature against every other equid: **the biggest shell, a FLAXEN mane and
 * tail, and a mealy muzzle carried by the hull's own band.** The pony is a
 * red-bay Shetland on the cube with black points; the zebra is chalk-white and
 * striped; the donkey takes the rabbit's long ear and grey; the mule takes the
 * donkey's ear on this build.
 *
 * **NOT FLAGGED, and the palette is UNREVIEWED** — `farm.ts` gives this species a
 * one-line record and no colours, so all five below are the first ever proposed
 * for it. These animals ship unsigned; there is no `signoff` field anywhere.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/* ===================================================================== *
 * `box-41`, MEASURED — every number this file spends, named once.
 *
 * World coordinates, off the shell's own 454 baked vertices, at its recorded
 * offset of (0, 0.83125, 0.05). A sibling moving to this hull should point at
 * these rather than re-measure; a sibling staying on `box-03` gets the same
 * value for the four marked IDENTICAL and different values for the rest.
 * ===================================================================== */

/** The crown, and `frame.top` for this shell: the two transverse poll pads. */
const CROWN_Y = 1.48125
/** The flat top plate, 0.050 below the pads. IDENTICAL to `box-03`'s top. */
const TOP_PLATE_Y = 1.43125
/** `cone-01`'s own recorded x — the bee's placement, and the pony's. Recovered. */
const EAR_X = 0.2276
/** Where the flat REAR plate stops. IDENTICAL to `box-03`'s rear face. */
const REAR_PLATE_TOP_Y = 1.11875
/** `box-38`'s own 0.912191 / 2 — half the parrot fan, which the z-180 keeps. */
const TAIL_HALF_HEIGHT = 0.4560955
/** SOLVED, not chosen: the highest join whose whole root is on the flat plate. */
const TAIL_JOIN_Y = REAR_PLATE_TOP_Y - TAIL_HALF_HEIGHT
/** The rear plate itself. IDENTICAL to `box-03`'s -0.625. */
const REAR_PLATE_Z = -0.625
/** The brow chamfer's chord midpoint. The surface bulges 0.052 proud of it. */
const BROW_CHAMFER_Y = 1.275
const BROW_CHAMFER_Z = 0.46875

export const HORSE_ASSEMBLY = defineCreature('animal-horse', {
  /* Insertion order IS the texture layout, so this list is data. Five slots,
   * one fewer than the pony: `pale` is the mane, the tail, the mealy muzzle and
   * underline, and the sclera, because on this horse they are one cream; `hoof`
   * is the horn and the muzzle skin, because on any horse they are one dark. */
  palette: {
    coat: 0xc4863a,   // UNREVIEWED: golden chestnut — the Belgian/Haflinger draught
    pale: 0xf0e4c2,   // UNREVIEWED: flaxen — mane, tail, band-3 muzzle and underline, sclera
    limb: 0xa96e2e,   // UNREVIEWED: the leg above the hoof, a shade under the coat
    hoof: 0x413830,   // UNREVIEWED: dark horn. JT-044's two-tone leg, and the nose
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* There is no `belly` slot, so name the pale one: it paints the eye cards'
   * sclera and anything else that asks for the under colour. */
  under: 'pale',

  /* THE BIGGER SHELL, and the pony's refusal of it does not hold — its 0.725 is
   * a 0.400 x 0.400 muzzle boss that stops 0.0398 below the eye card, and the
   * plate the cards land on is 0.625, `box-03`'s own. See the header §1.
   *
   * BAND 3 is the underline and the whole muzzle boss in one entry: Kenney's own
   * cut, the pangare pattern, no geometry and no straight line. NOT `belly` —
   * which `creature.ts:585` would turn into a `patch` on this same paint, and
   * JT-044 forbids `patch` and `byBand` on one part. */
  hull: { part: 'box-41', paint: { base: 'coat', byBand: { 3: 'pale' } } },

  /* ===================================================================== *
   * JT-044, VERBATIM. THE LINE THE OTHER FOUR HOOVED SPECIES COPY.
   *
   * Derived once at `animal-pony.ts:289-321` and pinned by
   * `assembly-pony.test.ts:112-165`: `box-01` is 0.375 x 0.30625 x 0.375, its 80
   * points sit on three y rows, its foot's bevel runs 0.0625 up from the sole,
   * so the leg reaches full width at 0.0625 / 0.30625 = 0.204082 of its own
   * height and 4/16 is the LOWEST k/16 that clears it onto the straight shank.
   *
   * DO NOT RETUNE THIS NUMBER. It is a measurement off the leg, not a taste
   * about this animal, and it is the same leg on every species in the pack.
   *
   * What IS this animal's is the contrast across it: a pale gold shank over a
   * dark horn foot, which is the highest-contrast hoof this collection will have
   * and the reason the palette went golden. It is the ONLY patch on this
   * species — the hull bands rather than patches (§3) — so "one cell, one
   * picture" (`assembly.ts:487-501`) cannot fire, and the legs are never spun,
   * so the boundary cannot rake.
   * ===================================================================== */
  legs: { paint: { base: 'limb', patch: { below: 'hoof', at: 0.25 } } },

  /* The pony's ear, deliberately: the tallest upright ear that is not the
   * rabbit's, the only one of its size that comes to a point, and buried its own
   * 0.125, which is §3's floor exactly. Widened 2x in x only, from the bee
   * antenna's 0.1600 blade to 0.3200 against its own 0.3286 depth.
   *
   * Only the z is chosen: x is the shape's own recorded offset and y is the
   * solve's own `frame.top`, which on this shell is the raised poll the ears then
   * stand on. z is 4/16, inside the front pad's own 0.1383-0.2575 span. The
   * solved z is refused — the bee's recorded 0.469709 is measured on a cube, and
   * there this crown has fallen to 1.326444 against an underside at 1.35625, so
   * the ear would float 0.0298. Seating measured: 16 of the 20 sub-plane vertices are inside the
   * mass with 0.028 of daylight at one base corner, against the shipped pony's
   * 0.038 on the cube. Joining at TOP_PLATE_Y instead makes it 20 of 20 and
   * costs the 0.050 of height; see the header. */
  ears: {
    part: 'cone-01',
    stretch: [2, 1, 1],
    at: [EAR_X, CROWN_Y, 0.25],
    paint: 'coat',
  },

  /* The GIRAFFE's muzzle, and every field is solved. It is the only one of the
   * bank's three identical 0.532 barrels the pack ever sank, at 0.37594 of its
   * own 0.266 = 0.100000, which is exactly how far this hull's muzzle boss
   * stands proud — so it beds flush onto the 0.625 plate instead of overhanging
   * the boss's 0.400 face by 0.066 a side as the fox's `tube-06` would. Its top
   * edge lands on 0.89375, the boss's own top, to the digit. Painted `pale`
   * because band 3 has already made the face it grows out of pale. */
  snout: { part: 'tube-07', paint: 'pale' },

  /* The deer's nose — the pack's ungulate one, and small, which is what a horse
   * has. `on: 'snout'` is automatic when a snout exists (`creature.ts:873-879`),
   * so it hangs off the muzzle's own placed front plane rather than off an
   * arithmetic this file would keep a stale copy of. Painted `hoof`: horn and
   * muzzle skin are the same dark on a horse, which is why there are five slots
   * and not six. Not `wedge-10`, which reads as a tongue — Joe rejected that one
   * by name on the hedgehog. */
  nose: { part: 'box-14', paint: 'hoof' },

  /* The parrot's fan turned upside down, so the stalk is at the top and the
   * broad fall hangs off it. The y is SOLVED — the flat rear face's top less the
   * fan's own half height — and it comes out at the pony's own number because
   * this shell's rear plate is the cube's rear plate to the last decimal. Flaxen,
   * where the pony's is near-black. */
  tail: {
    part: 'box-38',
    spin: [{ axis: 'z', deg: 180 }],
    at: [0, TAIL_JOIN_Y, REAR_PLATE_Z],
    paint: 'pale',
  },

  extras: [
    /* THE MANE. 0.1875 thick — 3/16, 1.5x the pony's 0.125, and the one
     * dimension in which "draught" is sayable at all, since a hull cannot be
     * scaled. It runs the full 0.625 of the top plate, so both ends stop where
     * the plate stops and each is buried its whole 0.250 rather than riding a
     * fallen chamfer. Half-buried at the primitive's own declared 0.5 sink, so
     * 0.250 proud over the saddle and at the ends, and 0.200 where it rides each
     * of the two crown pads — the shell modulating the crest. */
    {
      name: 'mane',
      part: 'bespoke-square-01',
      stretch: [0.15, 0.4, 0.5],
      at: [0, TOP_PLATE_Y, 0],
      paint: 'pale',
    },
    /* THE FORELOCK, on the brow chamfer. The chord midpoint is the cube's own
     * (1.275, 0.46875) because both shells run this chamfer between the same two
     * flat plates, and its normal is the same 45 degrees. Neither shell's real
     * surface passes through that chord though — it is cut in two steps and
     * ray-casts at 1.327083, which is 0.052083 above it and 0.036828 along the
     * normal — so this is cut 0.625 along its own normal rather than the pony's
     * 0.500 and shows 0.2757 where the pony's shows 0.2132. */
    {
      name: 'forelock',
      part: 'bespoke-square-01',
      stretch: [0.3, 0.5, 0.12],
      spin: [{ axis: 'x', deg: 45 }],
      at: [0, BROW_CHAMFER_Y, BROW_CHAMFER_Z],
      paint: 'pale',
    },
  ],

  /* A heavy horse standing still swishes and flicks. Both name features this
   * species actually has, which `resolveMotion` checks at definition time. */
  motion: [
    { kind: 'wag', parts: ['tail'] },
    { kind: 'twitch', parts: ['ear'] },
  ],
})
