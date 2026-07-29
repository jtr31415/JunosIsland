/**
 * Species built by the assembly kit, as data. No three.js here — a collection
 * file imports this, and importing a species record must not drag a renderer in.
 *
 * ONE SPECIES AT A TIME (§6, Joe's delivery rule): "make the available one at a
 * time, so we can step in if its going wrong early on." The hedgehog is here
 * alone on purpose, and the squirrel is the next one, not a batch of thirteen.
 */
import type { AssemblyBuild } from './assembly'

/**
 * The hedgehog. Garden's first, because it is the only member that exercises
 * repeat-and-sink — the newest and least-proven mechanism in the whole method,
 * and Joe's own idea (§3.1).
 *
 * ## Every number below, and where it came from
 *
 * The pack is the source of all of them. Nothing is eyeballed.
 *
 *   - **The hull is `box-03`**, the 1.250 cube that 14 of the 24 share. Stretched
 *     to 1.350 x 1.150 x 1.250: wider than the cube and lower, which is the
 *     "ball that walks". 1.350 is not a taste — it is the tiger's hull width,
 *     the widest the pack goes. **z is left at 1.250 exactly**, and that is load
 *     bearing: it puts the front face at z = 0.625, which is what makes the eye
 *     card's measured z = 0.6350 sit 0.010 PROUD of the face rather than inside
 *     it. Deepen the hull and rule 5's absolute eye is a lie.
 *
 *   - **The hull centre is y = 0.7563**, solved rather than chosen. The pack's
 *     leg sits at y = 0.1531 with its foot at 0.000 and its top 0.125 inside a
 *     hull whose bottom is at 0.1813 — a burial of 0.408 of the leg's own
 *     height, which is exactly `box-01`'s measured `sunkFractionMax`. Take the
 *     pack's own burial, ask where a 1.150-tall hull has to sit for the feet to
 *     land on zero, and 0.7563 falls out. The legs then arrive at y = 0.1531, to
 *     four decimal places the pack's own number, without that having been aimed
 *     at.
 *
 *   - **Twelve spikes, six a side.** Joe's number. `cone-01`, sunk 0.312 — the
 *     part's own measured burial, the only value the pack ever gave it — which
 *     buries exactly 0.125 of it and leaves 0.275 standing. 0.125 is also §3's
 *     floor: "every eared species embeds its ear into the hull by at least
 *     0.125". The row runs z = +0.30 to -0.46 at x = +/-0.36, so the six overlap
 *     each other by about half and read as one serrated ridge per side rather
 *     than as twelve separate objects.
 *
 *   - **WHY `cone-01` AND NOT THE HOG'S EAR.** The brief asked for the hog's ear
 *     or the hog's tusk, found by query. The query (`SPIKE_QUERY`) returns all
 *     three and more, which is the §3.2 acceptance test passing. Then the
 *     measurements chose between them, and they chose against both hog parts:
 *
 *       * `wedge-13`, the hog's tusk — taper 0.586, and its LONGEST axis is z.
 *         It attaches z +1 because it is a tusk. Twelve of those lie flat and
 *         point forwards. There is no rotation to fix that with; rule 4.
 *       * `cone-04`, the hog's ear — right shape, right axis, 112 verts. Twelve
 *         is 1,344 verts before the hull, the legs or the face, against rule 9's
 *         measured body ceiling of 1,114. Over by 40% on its own.
 *       * `cone-01` — taper 0.000, a true point, where the hog's ear is 0.249.
 *         0.400 tall against the ear's 0.296. Attaches y +1. 68 verts. Thin in x
 *         (0.160) and deep in z (0.329), so it reads as a quill from the side
 *         and disappears from the front, which is what a quill does.
 *
 *     It is better on every measured axis and it is a third of the cost. It is
 *     also the purest §3.1 result in the exercise: it is the BEE's antenna, and
 *     the caterpillar's. Filed as an ear, used as a spine. That is the whole
 *     argument for naming records by shape, arriving unprompted. The `flag`
 *     below says so where Joe will see it, because it is his call to overturn.
 *
 *   - **Eyes are `plate-01`, placed as a `pair`.** One mesh, mirrored (rule 6) —
 *     and the mirror IS `plate-02`, so the bank's two eye records collapse to
 *     one authored shape. z = 0.6350 and sink 0, the measured constants across
 *     all 48 eye cards in the pack. No `stretch`, ever: rule 5.
 *
 *   - **The snout is `cone-06`**, the parrot's beak, sunk 0.361 — again its own
 *     measured value. A cone that comes to a point and attaches z +1 is a
 *     hedgehog's face, and it is what stops this reading as a spiky mouse. Its
 *     own bands split it in two, upper and lower, so the upper half takes the
 *     spine colour and the animal gets a dark nose bridge for nothing.
 *
 *   - **The palette is the four colours already on the hedgehog's record** in
 *     `collections/garden.ts` — "Buff face, dark spines" — plus black, which is
 *     the top of colormap.png's column 496, the column every one of the 24
 *     species uses for its eyes. Nothing here is a new colour.
 *
 * Result: 1.607 tall, feet on zero, inside the pack's measured 1.43-2.02.
 */
export const HEDGEHOG_ASSEMBLY: AssemblyBuild = {
  kit: 'assembly',

  palette: {
    coat: 0xb2946c,  // buff face
    spine: 0x53412c, // dark spines
    limb: 0x6b533a,  // legs and snout
    eye: 0xf4e6cc,   // the eye card's light region
    pupil: 0x000000, // colormap.png column 496, top: the pack's own eye black
  },

  hull: {
    part: 'box-03',
    stretch: [1.08, 0.92, 1.0],
    at: [0, 0.7563, 0],
    paint: { base: 'coat' },
  },

  features: [
    /* Four legs, from one shape and one line: two along z, mirrored in x. */
    {
      name: 'leg',
      part: 'box-01',
      paint: { base: 'limb' },
      sink: 0.408,
      placement: {
        kind: 'row',
        from: [0.27, 0.1813, 0.25],
        to: [0.27, 0.1813, -0.25],
        count: 2,
        mirror: true,
      },
    },

    /* Repeat-and-sink. The mechanism this whole species exists to prove. */
    {
      name: 'spike',
      part: 'cone-01',
      paint: { base: 'spine' },
      sink: 0.312,
      placement: {
        kind: 'row',
        from: [0.36, 1.3313, 0.30],
        to: [0.36, 1.3313, -0.46],
        count: 6,
        mirror: true,
      },
    },

    /* The face. Absolute, unstretched, sitting ON the front plane. */
    {
      name: 'eye',
      part: 'plate-01',
      paint: { base: 'eye', byBand: { 15: 'pupil' } },
      sink: 0,
      placement: { kind: 'pair', at: [0.2625, 0.95, 0.635] },
    },

    {
      name: 'snout',
      part: 'cone-06',
      paint: { base: 'limb', byBand: { 15: 'spine' } },
      sink: 0.361,
      placement: { kind: 'single', at: [0, 0.58, 0.625] },
    },
  ],

  flag: 'Spines are cone-01 — the bee and caterpillar antenna — not the hog ear. '
    + 'The query returns the hog ear and the hog tusk too; the measurements chose '
    + 'against both. Twelve hog ears cost 1,344 verts against rule 9\'s 1,114-vert '
    + 'body ceiling, and the hog tusk\'s long axis is z, so twelve of them lie flat. '
    + 'cone-01 tapers to a true point, stands 0.400 tall and costs 68. Joe\'s call to overturn.',
}

/** Every species the assembly kit can build, by species id. */
export const ASSEMBLED_BUILDS: Readonly<Record<string, AssemblyBuild>> = {
  'animal-hedgehog': HEDGEHOG_ASSEMBLY,
}
