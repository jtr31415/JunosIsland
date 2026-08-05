/**
 * The platypus — the flat hull, a real paddle tail, and a bill that is the
 * lion's muzzle plate cut down.
 *
 * This animal came out far better than the collection survey expected, and the
 * reason is `box-13`. **The crab's shell is the only flat hull in the bank** —
 * 1.333 x 0.4506 x 1.347 — and a platypus is a flat animal, so the one shape
 * that was unusable until Joe made the height band a norm that REPORTS (3
 * August) is the right shell for this species rather than a compromise.
 * `animal-ray.ts` and `animal-starfish.ts` are the two that went first.
 *
 *   - **THE TAIL IS `wedge-03`, THE BEAVER'S OWN PADDLE**, and that is the
 *     comparison every guide to this animal makes. It is the only tail in the
 *     bank with a flattened section (0.726 across against 0.589 through) — but
 *     it is flattened the WRONG WAY for a swimmer, standing 0.862 tall, so it is
 *     spun a quarter turn about x and its facing overridden back to `z -1`.
 *     That is `animal-ray.ts`'s own idiom: **the spin moves the part, the
 *     override moves where it joins**, and doing it with a spin alone stands the
 *     paddle up as a fin. It is also cut to half its thickness, and that is
 *     FORCED rather than preferred — see `TAIL_THIN`, where the engine's own
 *     one-mass invariant does the deciding.
 *   - **THE BILL IS `blade-05`, THE LION'S MUZZLE PLATE** — 1.000 x 1.000 x
 *     0.125, the only broad flat sheet in the bank that is a solid rather than a
 *     zero-thickness card, cut to 0.35 of its height. A stretch, and flagged as
 *     one: §3 measures snouts varying 2.90x naturally across the pack, so it is
 *     inside what Kenney himself drew, but the RATIO is what makes it a bill and
 *     you should look at it.
 *   - **THE LEGS ARE RAISED to 4/16.** `box-13` bottoms at 0.32095 where every
 *     other hull bottoms at 0.18125, so the standard row leaves the leg floating
 *     0.0147 clear of the shell. 0.25 buries it 0.054 and `buildAssembly`
 *     re-grounds the animal on whatever is lowest, which is Joe's own described
 *     behaviour: *"when i move the legs up... everything else moves down."*
 *   - **The eye is `plate-06` at the ray's own y = 0.68**, the smallest card in
 *     the bank, which is what a platypus has.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-13`'s own recorded centre, and where its front and rear faces are. */
const HULL_MID_Y = 0.54625
const HULL_FRONT_Z = 0.673689
const HULL_REAR_Z = -0.673689

/**
 * 4/16, where every other species in the project uses `LEG_ROW.y` = 0.18125.
 *
 * `box-13` is the one hull that does not bottom at 0.18125 — it bottoms at
 * 0.32095 — so a leg on the pack's own row hangs 0.0147 clear of the shell and
 * §3's "nothing floats" is broken by arithmetic rather than by choice. At 0.25
 * the leg's top reaches 0.375 and is buried 0.054 into the plate.
 */
const LEG_Y = 0.25

/**
 * `blade-05` cut to 0.35 of its own height: 1.000 x 0.350 x 0.125.
 *
 * The lion wears this plate as a muzzle at 1.000 square, which on this animal
 * would be a shield covering the whole front of it. A duck bill is broad, flat
 * and SHALLOW, and the third number is the one that makes it one.
 */
const BILL_FLATTEN = 0.35

/**
 * The paddle cut to half its thickness — and this one is forced, not preferred.
 *
 * `wedge-03` is 0.726 across, 0.862 long and **0.589 THROUGH**, which is a
 * beaver's tail: flat, but a great deal thicker than a platypus's. On any of the
 * usual hulls that would pass unremarked; on `box-13` it does not, because that
 * shell is the flattest in the bank at 0.4506 tall and the assembly engine's
 * ONE-MASS invariant requires the hull to be more than 3x the volume of anything
 * else on the animal. At the shape's own thickness the ratio is **2.20 and the
 * suite goes red** — the tail is genuinely competing with the body for mass.
 * At half it is 4.39, and the animal is also more like the thing it is: a
 * platypus's tail is a thin horizontal blade, not a beaver's rudder.
 *
 * It is applied on `z` BECAUSE the spin comes after it: `builtPoints` stretches
 * a copy and then turns it, so this shape's `z` is what ends up vertical.
 */
const TAIL_THIN = 0.5

export const PLATYPUS_ASSEMBLY = defineCreature('animal-platypus', {
  palette: {
    coat: 0x5a4632,    // UNREVIEWED: the dense dark brown of the back
    belly: 0xc9b591,   // UNREVIEWED: the silver-buff underside, and the sclera
    bill: 0x484036,    // UNREVIEWED: the soft grey-brown bill and the webbed feet
    limb: 0x4e4238,    // UNREVIEWED: the short sprawled legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The only flat hull in the bank, and this animal is the reason it exists in
   * this collection at all. */
  hull: { part: 'box-13', paint: 'coat' },

  /* 8/16 — the plate's own equator, which on a flat animal is the whole of the
   * boundary between a dark back and a pale front. */
  belly: 0.5,

  /* SPRAWLED and RAISED. x 0.5 puts each leg's outer face at 0.6875, just inside
   * the shell's own 0.6665, which is the crocodile's sprawl on this plate; y is
   * the whole point and is derived at LEG_Y. */
  legs: { x: 0.5, y: LEG_Y, z: 0.375 },

  /* The smallest card in the bank at the ray's own height on this shell. A
   * platypus's eyes are two beads in a groove and nothing bigger reads right. */
  eyes: { part: 'plate-06', x: 0.2625, y: 0.68, paint: 'belly' },

  /* THE BILL. The lion's muzzle plate, cut to 0.35 of its height and joined flat
   * on the front of the plate. Its own recorded burial is zero, so every
   * millimetre of it stands clear. */
  snout: {
    part: 'blade-05',
    name: 'bill',
    paint: 'bill',
    stretch: [1, BILL_FLATTEN, 1],
    at: [0, 0.5, HULL_FRONT_Z],
  },

  /* THE PADDLE, laid FLAT. The spin turns the geometry a quarter turn about x so
   * the paddle's 0.862 of length runs BACKWARDS instead of standing up.
   *
   * The facing override is `y +1`, not `z -1`, and that is the whole trap:
   * `creature.ts` builds the base facing from `axis`/`dir` FIRST and then spins
   * it, so the declared axis is the one the part faces BEFORE the turn. Rotating
   * `y +1` by -90 degrees about x gives exactly `z -1` (`spinVec`: a spin of -90
   * sends (0,1,0) to (0,0,-1)), so the tail joins the rear face after all — and
   * declaring `z -1` here would spin THAT and leave the tail pointing at the
   * sky. `animal-ray.ts` reached the same placement; its comment describes the
   * override as happening after the spin, which is the wrong way round. */
  tail: {
    part: 'wedge-03',
    paint: 'coat',
    stretch: [1, 1, TAIL_THIN],
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.3,
    at: [0, HULL_MID_Y, HULL_REAR_Z],
  },

  flag: 'THE BILL IS A STRETCH AND IT IS THE ONE THING HERE TO JUDGE. blade-05 is the LION\'S '
    + 'muzzle plate — 1.000 x 1.000 x 0.125, the only broad flat SOLID sheet in the bank as '
    + 'against the zero-thickness marking cards — and it is cut to 0.35 of its height to make '
    + 'a bill of it. §3 measures snouts varying 2.90x naturally across the pack so the amount '
    + 'is inside what Kenney drew, but you flagged three animals for stretching on 2 August and '
    + 'this is a stretch, said out loud. THE TAIL IS THE BEAVER\'S OWN PADDLE, which is the '
    + 'comparison every book makes, and it is spun a quarter turn about x with its facing '
    + 'overridden back to z -1 — animal-ray.ts\'s idiom — because the paddle is flattened the '
    + 'wrong way for a swimmer and unspun it stands up 0.862 tall as a fin. IT IS ALSO CUT TO '
    + 'HALF ITS THICKNESS AND THAT IS FORCED, NOT PREFERRED: wedge-03 is 0.589 through, which '
    + 'is a beaver\'s rudder, and against box-13 — the flattest shell in the bank at 0.4506 — '
    + 'the engine\'s ONE-MASS invariant (the hull must be 3x the volume of anything else) '
    + 'measures 2.20 and the suite goes RED. At half it is 4.39, and a platypus\'s tail is a '
    + 'thin horizontal blade anyway. THE LEGS ARE AT '
    + '4/16, NOT THE PACK\'S 0.18125: box-13 is the one hull that does not bottom on that '
    + 'plane (it bottoms at 0.32095), so the standard row leaves every leg floating 0.0147 '
    + 'clear of the shell. The animal then re-grounds on whatever is lowest, which is exactly '
    + 'the behaviour you described. IT IS UNDER THE HEIGHT BAND and that is deliberate: the '
    + 'floor is 1.43 and this animal is a flat swimmer on the pack\'s one flat shell, the same '
    + 'call the ray and the starfish made after you turned the band into a report — it measures '
    + '0.7718 against the ray\'s 0.8670 and the starfish\'s 0.4506. It is light too, 298 '
    + 'vertices against a 405 floor, for the same reason: eight meshes on the flattest shell in '
    + 'the bank. NEW PALETTE, UNREVIEWED.',
})
