/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually. if there is no entry at all, i
 * cant do that."* This is that entry, and it is a placeholder for exactly one
 * reason: **the pincers**.
 *
 * ## The claw is not baked, and that is a fact about the BAKE rather than the pack
 *
 * `docs/building-animals-from-parts.md` §7 censuses **claw — 10 instances, 10
 * distinct shapes, donors crab, lion, tiger, polar — BAKED: no**, and `claw`
 * occurs ZERO times in the 100 records of `PARTS_BANK`. The crab's own pincer is
 * sitting in a `.glb` in this repo and simply is not in the module. Ocean's
 * `animal-lobster.ts` is the other species standing on this gap and it says the
 * same thing; the two agree deliberately, because two entries for one missing
 * shape that disagreed would be worse than either. **Nothing here bakes it** —
 * baking a role RENUMBERS THE BANK silently and once turned the newt's crest into
 * bee wings — so it is priced, not fixed, and it is Joe's call (PB-096).
 *
 * ## What is standing in, measured
 *
 * The whole pedipalp is `wedge-11`, the elephant's tusk and the bank's bluntest
 * taper at 0.3087 x 0.306936 x 0.445163: one as the ARM reaching forward off the
 * shell's front face, and two more opposed above and below its tip with a
 * **0.0345 gap** between them, which is the entire read. That is the lobster's
 * arrangement done in one shape instead of two, and §3.1's "a part's identity is
 * its placement" pushed about as far as it goes.
 *
 * **The halves are placed by SOLVED ABSOLUTE COORDINATES and not by `on: 'palp'`,
 * and that is deliberate**: `creature.ts:691` takes `at` in preference to `on`, so
 * a feature carrying both silently ignores the anchor — and `on` yields one point,
 * where a pincer needs two, one either side of it. The arm's tip is solved in
 * `PALP` below.
 *
 * ## What is NOT a compromise
 *
 * **The tail is, and it is the reason this animal is still recognisable.** Three
 * `wedge-11` chained `on` one another's built tips at 55, 75 and 95 degrees, so
 * the metasoma arches up and forward over the back, ending in `cone-01` — the
 * bee's antenna, the bank's only true point, taper 0.000 — turned down as the
 * sting. That is `animal-terror-bird.ts`'s three-deep chain used for a curve
 * rather than for a beak, and it is why this file is a placeholder for its claws
 * alone and not for the whole animal.
 *
 * **Eight legs, and the count is the diagnosis.** Four on the pack's own row and
 * two more mirrored pairs between them, all `box-01` at `LEG_ROW.sink`, on the
 * 0.33 row `animal-woodlouse.ts` solved for this shell — `box-13` is the one hull
 * of the ten whose bottom is 0.320972 rather than 0.18125, so the standard row
 * leaves a leg 0.0147 short of the shell and floating.
 *
 * **IF YOU ARE DOING THIS BY HAND: the claws are the animal.** If two opposed
 * tusks do not read as a pincer, no rearrangement of these 100 records will, and
 * the answer is to bake the `claw` role as an APPEND.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-13`'s own recorded centre — the crab's, and the only one not at 0.80625. */
const HULL_MID_Y = 0.54625

/** `box-13`'s front and rear faces. The crab shell is 1.347378 deep. */
const HULL_FRONT_Z = 0.673689
const HULL_REAR_Z = -0.673689

/**
 * The one hull in the pack whose bottom is not 0.18125. Measured: 0.320972, so the
 * row is raised to 0.33 and every leg top lands inside the shell.
 * `animal-woodlouse.ts` derived this and it is reused rather than re-derived.
 */
const LEG_Y = 0.33

/** The eight leg stations along z, inside `box-13`'s flat bottom face (|z| < 0.6051). */
const LEG_X = 0.3
const LEG_MID_Z = [0.14, -0.14] as const

/**
 * THE PEDIPALP ARM, and the tip its two fingers are solved against.
 *
 * `wedge-11` stretched 1.2 on its own depth is 0.534196 of extent along `z +1`.
 * At its own recorded 0.375966 burial the shift is
 * `0.267098 - 0.375966 x 0.534196 = 0.066260`, so joined at this shell's front
 * face z = 0.673689 its centre lands on 0.739949 and **its tip is z = 1.007047**.
 * It is buried 0.200838, well clear of §3's 0.125 floor.
 */
const PALP_X = 0.26
const PALP_TIP_Z = 1.007047

/**
 * The two fingers join a QUARTER of the arm's own extent back from that tip —
 * 1.007047 - 0.25 x 0.534196 = 0.873498.
 *
 * Not the tip itself: at their own 0.375966 burial each finger's back end lands on
 * 0.706117, which is inside the arm's span of 0.472851 to 1.007047, so the claw is
 * seated on the limb rather than balanced off the end of it.
 */
const FINGER_Z = PALP_TIP_Z - 0.25 * 0.534196

/**
 * Half the gap between the two fingers.
 *
 * Each is `wedge-11` at [0.8, 0.8, 1.0], so 0.245549 tall. Centred 0.14 above and
 * below the body's own mid-height they span 0.56348-0.80903 and 0.28348-0.52903,
 * leaving **0.0345 of daylight between them** — which is the whole of what makes
 * two tapers read as a claw rather than as a pair of tusks.
 */
const FINGER_Y = 0.14

/** The three metasoma segments, arching up and then forward over the back. */
const TAIL_DEG = [55, 75, 95] as const

export const SCORPION_ASSEMBLY = defineCreature('animal-scorpion', {
  /* NEW AND UNREVIEWED — the first scorpion ever built here. Brief §19 is
   * "bright, never scary" and this is the species in the whole project that tests
   * it hardest: a warm sandy desert scorpion, deliberately not black, with the
   * sting the same amber as the claws rather than a warning colour. */
  palette: {
    coat: 0xc79a5c,    // UNREVIEWED: warm sand, and deliberately not black
    belly: 0xf0dcb8,   // UNREVIEWED: the pale underside, and the sclera
    claw: 0xa87b41,    // UNREVIEWED: the pedipalps and the tail segments
    limb: 0xdcb87e,    // UNREVIEWED: the eight legs
    sting: 0xe6c48d,   // UNREVIEWED: the point, a shade UP from the claws, never red
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE CRAB'S PLATE, 1.332958 x 0.450556 x 1.347378 — the one non-cubic shell in
   * the bank and the only flat one. A scorpion is a flat animal that lives under
   * a stone, and `animal-woodlouse.ts` (Critters) is the only other species on it.
   * The two share nothing else: that one has four legs, five hoops and no tail. */
  hull: 'box-13',

  /* 6/16 — the shell's underside only, below the 0.4808-0.5481 zone §7 measured
   * for the pack's mammals, which is the right reading for an armoured animal. */
  belly: 0.375,

  /* Four on the raised row, x and z inside the flat bottom face's 0.3086 x 0.6051.
   * The other four are the mirrored pairs below. */
  legs: { x: LEG_X, y: LEG_Y, z: 0.42, paint: 'limb' },

  /* The caterpillar's card, the smallest in the pack, at the shell's own height.
   * Rule 5 pins an eye card to the absolute z = 0.6350 and this hull's front face
   * is 0.673689, so the cards sit 0.0387 INSIDE the face — which is what
   * `animal-woodlouse.ts` and `animal-ray.ts` already ship on this shell and is
   * not a thing a species may correct. A scorpion's real eyes are median and sit
   * on top of the carapace, so there was never a face for them anyway. */
  eyes: { part: 'plate-06', x: 0.2, y: 0.63 },

  extras: [
    /* FOUR MORE LEGS, between the pack's own two stations. Eight is the count a
     * child separates an arachnid by, and it is the one thing about this animal
     * that costs nothing to say. */
    ...LEG_MID_Z.map((z, i) => ({
      name: `leg-mid-${i}`,
      part: 'box-01',
      paint: 'limb',
      kind: 'pair' as const,
      sink: LEG_ROW.sink,
      at: [LEG_X, LEG_Y, z] as [number, number, number],
    })),

    /* THE PEDIPALP ARMS. See `PALP_TIP_Z` for the solve. */
    {
      name: 'palp',
      part: 'wedge-11',
      paint: 'claw',
      kind: 'pair',
      stretch: [1, 1, 1.2],
      at: [PALP_X, HULL_MID_Y, HULL_FRONT_Z],
    },

    /* THE TWO FINGERS, opposed at the arm's tip with 0.0345 between them. Solved
     * coordinates rather than `on: 'palp'`, because `at` beats `on` and because
     * one anchor cannot place two halves — see the header. */
    {
      name: 'finger-upper', part: 'wedge-11', paint: 'claw', kind: 'pair',
      stretch: [0.8, 0.8, 1], at: [PALP_X, HULL_MID_Y + FINGER_Y, FINGER_Z],
    },
    {
      name: 'finger-lower', part: 'wedge-11', paint: 'claw', kind: 'pair',
      stretch: [0.8, 0.8, 1], at: [PALP_X, HULL_MID_Y - FINGER_Y, FINGER_Z],
    },

    /* THE METASOMA. Three copies of the same tusk, each joined to the built tip of
     * the one before it, turned 180 about y so they point BACK and then up by 55,
     * 75 and 95 degrees about x — so the last one is past vertical and the tail
     * carries forward over the animal, which is what a scorpion's does. Only the
     * first carries an `at`; the other two carry `on` and no coordinates at all. */
    {
      name: 'metasoma-0', part: 'wedge-11', paint: 'claw',
      stretch: [0.8, 0.8, 1.3], spin: [{ axis: 'y', deg: 180 }, { axis: 'x', deg: TAIL_DEG[0] }],
      at: [0, HULL_MID_Y, HULL_REAR_Z],
    },
    {
      name: 'metasoma-1', part: 'wedge-11', paint: 'claw',
      stretch: [0.8, 0.8, 1.3], spin: [{ axis: 'y', deg: 180 }, { axis: 'x', deg: TAIL_DEG[1] }],
      on: 'metasoma-0',
    },
    {
      name: 'metasoma-2', part: 'wedge-11', paint: 'claw',
      stretch: [0.8, 0.8, 1.3], spin: [{ axis: 'y', deg: 180 }, { axis: 'x', deg: TAIL_DEG[2] }],
      on: 'metasoma-1',
    },

    /* THE STING. `cone-01`, the bee's antenna and the bank's only taper of 0.000 —
     * a true point — turned 130 degrees about x so it hangs forward and down off
     * the last segment. It is an antenna in its donor, which makes it the one part
     * on this animal wearing a job close to its own. */
    {
      name: 'sting', part: 'cone-01', paint: 'sting',
      stretch: [1, 1.2, 1], spin: [{ axis: 'x', deg: 130 }],
      on: 'metasoma-2',
    },
  ],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand, and it is a '
    + 'placeholder for ONE reason: THE PINCERS. The claw role is declared in PartRole and '
    + 'occurs ZERO times in the 100 baked records; §7 censuses ten distinct claw shapes with '
    + 'the crab, lion, tiger and polar as donors, and the generator has simply never baked '
    + 'that role, so the crab\'s own pincer is sitting in a .glb in this repo and not in the '
    + 'module. Ocean\'s animal-lobster.ts stands on the same gap and says the same thing, '
    + 'deliberately. NOTHING HERE BAKES IT: baking a role RENUMBERS THE BANK silently — adding '
    + 'wing once turned the newt\'s crest into bee wings and nothing failed to compile — so it '
    + 'may only APPEND and it is your call, not a builder\'s (PB-096). WHAT IS STANDING IN: '
    + 'the whole pedipalp is wedge-11, the elephant\'s tusk, three times over — one as an arm '
    + 'off the front face and two opposed at its solved tip z = 1.007047 with 0.0345 of '
    + 'daylight between them, which is the entire read. WHAT IS NOT A COMPROMISE: the tail. '
    + 'Three more of the same tusk chained on one another\'s built tips at 55, 75 and 95 '
    + 'degrees arch the metasoma up and forward over the back, ending in cone-01, the bank\'s '
    + 'only true point, turned down as the sting — so this animal is recognisable without the '
    + 'claws being right, which is the only reason it ships at all. ALSO: EIGHT LEGS on the '
    + '0.33 row animal-woodlouse.ts solved for box-13, the one hull whose bottom is 0.320972 '
    + 'rather than 0.18125. ALSO: NEW PALETTE, UNREVIEWED, and warm sand rather than black on '
    + 'brief §19\'s "bright, never scary" — this is the species in the album that tests that '
    + 'line hardest, and if a scorpion should not be in a six-year-old\'s album at all, that '
    + 'is a ruling and this entry is where to make it.',
})
