/**
 * The crocodile — Africa's FOURTEENTH, and the first of that collection's three
 * absences to be filled.
 *
 * `africa.ts` has said since PB-036 phase 2 why it was not there: *"a sprawled,
 * long-jawed reptile. The quadruped kit stands its legs under the body and gives
 * it a cube skull; a crocodile expressed through it is a lizard-shaped dog.
 * Wants `bespoke`."* That ruling stands and this file does not overturn it — it
 * satisfies it. The route is the assembly kit, the same one Garden's slow worm
 * and Home Pets' corn snake took, and `bespoke` is exactly what the collection
 * record now says.
 *
 * **The other two absences are NOT filled and must not be improvised.** The
 * ostrich and the vulture both want wings, and the bank has no `wing` shape at
 * all — the role is declared in `bank.generated.ts` and occurs zero times in the
 * data, alongside `horn` and `claw`. The pack's own birds (parrot, chick,
 * penguin) have no wings either; they are a fused hull plus a beak, legs and eye
 * cards. How those two should read is a look decision and it belongs to Joe.
 * `species-africa.test.ts` still asserts both by name, with the reason.
 *
 * ## What "a crocodile" has to mean when the parts are fixed
 *
 * Three things carry it, and each is the pack's own geometry doing a job it
 * already does for something else:
 *
 *   - **A long low wide jaw.** The one part in the bank with real forward reach.
 *   - **A row of scutes down the spine.** The only silhouette a child draws.
 *   - **Legs set WIDE.** As near to a sprawl as a kit whose leg row is a
 *     constant can honestly go, and the same kind of concession the meerkat's
 *     "sentry pose as far as a four-legged kit can say it" already makes.
 *
 * **And one thing it deliberately does NOT have: teeth.** `wedge-04` and
 * `wedge-05` carry the pack's `tooth` role and would mount on the jaw's own
 * anchor without a chosen number anywhere. They are left off. Brief §19 is
 * "bright, never scary", and a crocodile is precisely the animal where that
 * bites; the same guardrail already bans predation framing in the species facts.
 * A child meeting this animal should want to keep it.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is the cube and the eyes are the eye plane**, neither mentioned
 *     below, because both are what `defineCreature` gives a definition that says
 *     nothing: `box-03` at the pack's own `[0, 0.80625, 0]`, two `plate-01` at
 *     the card's own recorded (0.2625, 0.933646) on the absolute z = 0.6350.
 *
 *   - **THE JAW IS `box-18`, WHICH THE BANK FILED AS A TAIL AND KENNEY DREW AS A
 *     TRUNK.** §3.1 is the whole point of that: a shape is named for what it IS,
 *     never for what it was, and `box-18` is a straight tapering box with the
 *     longest forward reach in the bank — 0.425211, at a recorded burial of
 *     exactly ZERO, which is the elephant's trunk sitting flush on the front
 *     face. `animal-tortoise.ts:170` already spends it as a stub tail. Here it is
 *     turned to its own donor facing, `z +1`, and left where a zero burial puts
 *     it: flush on the hull's front face, reaching 0.425 clear of it.
 *
 *   - **The jaw is stretched to 10/16 wide by 5/16 tall, and the RATIO is the
 *     animal.** At its own 0.345 x 0.623 `box-18` is a tall narrow stub — a
 *     muzzle. A crocodile's jaw is twice as wide as it is deep, and 0.625 x
 *     0.3125 is that ratio on the pack's own authoring grid. Rule 1 sanctions
 *     the stretch and §3 measured the pack's own snouts at 2.97x and 2.90x; these
 *     are 1.81x and 0.50x, well inside what has already been shown to hold. The
 *     depth is NOT stretched: 0.425211 is the reach the donor recorded and it is
 *     the number the keep-out is spent on.
 *
 *   - **The jaw hangs at y = 0.6875, which is a solved bound and not a taste.**
 *     `box-18`'s own recorded height is 0.482248 — the elephant's trunk root —
 *     and at 0.3125 tall that would put its lower edge at 0.326, off the bottom
 *     of the hull's FLAT front face and onto the chamfer, where it would float.
 *     The flat face runs 0.49375 to 1.11875 (the hull centre plus or minus
 *     `topFlatZ` 0.3125), so the lowest centre that keeps the whole jaw on flat
 *     geometry is 0.65. 0.6875 is the next notch up the pack's 1/16 grid: as low
 *     on the face as a crocodile's jaw should sit, with the eyes above it.
 *
 *   - **THE SCUTES ARE `wedge-06`, THE CAT'S EAR, AND THEY ARE HERE FOR THEIR
 *     PROUD HEIGHT.** Its attachment is `y +1` — which is the ONLY condition
 *     under which a donor's burial transfers to a radial mount, the fault that
 *     cost the corn snake a rebuild — and the pack wears it sunk 0.573575, the
 *     shallowest burial of any `y +1` wedge. So 0.154466 of it stands proud,
 *     against the corn snake's saddle at 0.119 and the slow worm's annulation at
 *     0.081. It is the tallest keeled plate this bank can put on a back, and a
 *     crocodile's scutes are the tallest thing on a crocodile.
 *
 *   - **ONE ROW, ON THE TOP ONLY**, which is unusual here and deliberate. The
 *     chamfer idiom's whole purpose is to make a cubic body read ROUND, and a
 *     crocodile is the one animal in this pack that should not: it is flat-backed
 *     and its scutes run in a single line down the spine. `rows: ['top']` is also
 *     what makes the count affordable — a top row is not mirrored, so five
 *     stations are five parts rather than fifteen.
 *
 *   - **Five scutes at span 0.5.** Well inside the 0.520271 that §3's
 *     nothing-floats bound allows `wedge-06` before its outer station leaves the
 *     hull, and on the pack's own grid.
 *
 *   - **THE TAIL IS THE BEAVER'S PADDLE**, `wedge-03`: 0.726 across, 0.862 tall,
 *     0.589 long, tapering to 0.577 of itself. It is the only tail in the bank
 *     that is flat and tapering rather than round and whippy, which is what a
 *     crocodile's laterally-flattened tail is, and nothing has spent it. Its own
 *     `z -1` facing, its own 0.2943 burial, no spin and no stretch — a pure donor
 *     transfer, with only the height moved.
 *
 *   - **The tail hangs at the body's own centre**, `[0, 0.80625, -0.625]`, not at
 *     the beaver's recorded 1.050919. A beaver's paddle roots high and drops; a
 *     crocodile's tail continues the line of the back.
 *
 *   - **THE LEGS ARE SET WIDE, AND 0.4375 IS THE WIDEST HONEST NUMBER.** The
 *     default is 0.27 from the midline; `box-01` is 0.375 across, so at 0.4375
 *     the outer face of each leg lands on 0.625 — flush with the hull's own side,
 *     and not one thousandth past it. The pack's own axiom, checked over 23 of
 *     23 animals, is that every leg sits inside the body's footprint; this is
 *     that axiom at its exact limit, which is as sprawled as this kit can be
 *     while still telling the truth. The wheelbase goes out to 0.375 for the same
 *     reason — a long low animal, expressed by moving the legs rather than by
 *     stretching the body, exactly as `africa.ts` already argues for the mongoose
 *     and the aardvark.
 *
 *   - **The belly line is 7/16.** §7 measured the pack's mammal boundary
 *     wandering across 0.4808-0.5481. A crocodile's pale part is its whole
 *     underside and it stops well below the flank, so 0.4375 — below that zone,
 *     and the nearest notch on the pack's 1/16 grid.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * Like the corn snake's and the goldfish's, and for the same reason: `africa.ts`
 * never carried a record for this species, so it never carried colours for it.
 * The four below are the first ever proposed and they are UNREVIEWED — a warm
 * olive rather than a swamp green, a cream underside, darker scutes. **Joe should
 * look at them.** The `flag` says so where he reads it.
 *
 * **Flagged**, and only for that: no rule was strained. Measured on the built
 * model — 772 triangles inside 422-951; height 1.5857 inside 1.43-2.02; feet on
 * y = 0 exactly; keep-out 1.045 against the fox's 1.15, which the jaw and the
 * tail spend together and which is why neither was stretched on z; every part at
 * its own measured burial or at a bound solved from the hull, and the one mass
 * is the mass.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-18`'s own extents, measured: the bank's x and y for the shape. */
const JAW_OWN_WIDE = 0.345
const JAW_OWN_TALL = 0.623004

/** 10/16 and 5/16 on the pack's authoring grid: twice as wide as it is deep. */
const JAW_WIDE = 0.625
const JAW_TALL = 0.3125

/**
 * As low on the face as the jaw can sit and still be on flat geometry.
 *
 * The hull's flat front face runs from 0.49375 to 1.11875 — the hull centre plus
 * or minus its own `topFlatZ` of 0.3125 — and below that the chamfer starts. A
 * jaw 0.3125 tall therefore cannot be centred below 0.65 without hanging off the
 * corner. 0.6875 is the next notch up the 1/16 grid.
 */
const JAW_Y = 0.6875

/** The hull's own centre — `box-03`'s recorded `offset[1]`. */
const HULL_MID_Y = 0.80625

export const CROCODILE_ASSEMBLY = defineCreature('animal-crocodile', {
  /* NEW AND UNREVIEWED — see the note above. The first palette this species has
   * ever had, proposed here rather than agreed in `africa.ts` like every other
   * Africa animal's, because the crocodile was never in that file. */
  palette: {
    coat: 0x6f8449,  // UNREVIEWED: a warm olive, not a swamp green
    belly: 0xe4d9ae, // UNREVIEWED: the cream underside, and the sclera
    scute: 0x4e5f31, // UNREVIEWED: the dorsal scutes, darker than the back
    limb: 0x5e7140,  // UNREVIEWED: legs and jaw, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* A crocodile's pale part is its whole underside and it stops below the flank,
   * so 7/16 — under the 0.4808-0.5481 zone §7 measured for the pack's mammals. */
  belly: 0.4375,

  /* THE SPRAWL, as far as a fixed leg row can say it. 0.4375 puts the outer face
   * of each leg exactly on the hull's own side at 0.625 — the pack's own
   * inside-the-footprint axiom at its exact limit — and the wheelbase goes long
   * for the same reason `africa.ts` gives the mongoose and the aardvark: length
   * is expressed by moving the legs, never by stretching the body, because
   * `pets.ts:796` charges keep-out on the bounding box. */
  legs: { x: 0.4375, z: 0.375 },

  /* THE JAW. The bank's longest forward reach, at a recorded burial of zero, so
   * it sits flush on the front face and every millimetre of it is outside the
   * body. Stretched to 2:1 in plan — the ratio is what makes it a crocodile and
   * not a muzzle — and NOT stretched on z, because that reach is what the
   * keep-out is spent on. Hung at the lowest height that keeps it on the hull's
   * flat face; see JAW_Y. */
  snout: {
    part: 'box-18',
    paint: 'limb',
    stretch: [JAW_WIDE / JAW_OWN_WIDE, JAW_TALL / JAW_OWN_TALL, 1],
    at: [0, JAW_Y, 0.625],
  },

  /* THE TAIL. The beaver's paddle — the only flat, strongly tapering tail in the
   * bank against six round whippy ones, and nothing else has spent it. Pure donor
   * transfer: its own facing, its own 0.2943 burial, no spin, no stretch. Only
   * the height is moved, from the beaver's high root down to the body's own
   * centre, so it continues the line of the back. */
  tail: { part: 'wedge-03', at: [0, HULL_MID_Y, -0.625] },

  /* THE SCUTES, and the one thing a child would name about this animal. The cat's
   * ear is the tallest keeled plate the bank can stand on a back: `y +1`, which
   * is the only reason its burial transfers to a radial mount at all, and the
   * shallowest of them at 0.573575, so 0.154466 stands proud — against the corn
   * snake's saddle at 0.119 and the slow worm's annulation at 0.081.
   *
   * ONE ROW, ON THE TOP ONLY, which no other assembled species does. The chamfer
   * idiom exists to make a cubic back read ROUND, and a crocodile is the one
   * animal here that must not: it is flat-backed, and its scutes run in a single
   * line down the spine. A top row is also not mirrored, so five stations cost
   * five parts rather than fifteen. */
  ridge: {
    part: 'wedge-06',
    paint: 'scute',
    name: 'scute',
    count: 5,
    rows: ['top'],
    span: 0.5,
  },

  flag: 'NEW PALETTE, UNREVIEWED — the first crocodile ever built, and the first '
    + 'colours ever proposed for it: nothing in africa.ts signed these off. NOTE '
    + 'ALSO that it has NO TEETH on purpose — the bank has two tooth shapes that '
    + 'would have mounted on the jaw for free, and brief 19\'s "bright, never '
    + 'scary" is why they are not there. That is a look, and it is Joe\'s.',
})
