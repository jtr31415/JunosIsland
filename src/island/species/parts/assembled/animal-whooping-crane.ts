/**
 * The whooping crane — the first long-necked bird in this project that is NOT
 * held up by its bill, and that is the finding worth more than the animal.
 *
 * `animal-heron.ts` and `animal-stork.ts` are both PLACEHOLDERS, and neither is
 * one because of the neck: `animal-goose.ts`'s idiom builds a neck out of the
 * elephant's trunk stood on end, and it works. Both are placeholders because of
 * the BILL. That file measures it: *"the furthest any nose in the bank stands
 * proud is 0.2314 and the longest actual bill is `cone-06` at 0.1833, against
 * roughly 0.5 for a heron"*, so both birds wear `wedge-18` — the tiger's tail
 * stood on end — and both overshoot at about 0.90 proud.
 *
 * **A crane's bill is not a spear.** It is straight, blunt and about a tenth of
 * the bird's own height, which on this build is roughly 0.19. `tube-03` stands
 * **0.2314 proud** at a recorded burial of zero. That is inside a tenth of the
 * animal, so this bird takes a real nose from the bank and needs no tail on its
 * face — which is the whole reason it ships as a built animal where the heron
 * and the stork do not.
 *
 * **The red crown is Kenney's own cut.** `tube-06` is the one muzzle in the
 * family the pack split — band 3 the lower 20 triangles, band 7 the upper 14 —
 * and `animal-wolf.ts` uses that cut for a dark bridge. Worn here as the HEAD on
 * the neck's tip, band 7 painted crimson is the bare red crown a whooping crane
 * is named for, for one entry and no geometry.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** Every hull's own flat crown, flat side and flank centre. */
const HULL_CROWN_Y = 1.43125
const HULL_SIDE_X = 0.625
const FLANK_CENTRE_Y = 0.80625

/** 3/16 forward — the goose's own station, the lowest whose root face is flat. */
const NECK_Z = 0.1875

/** The heron's numbers, one notch longer and one degree steeper. The ceiling is 2.02. */
const NECK_STRETCH = 1.5
const NECK_SINK = 0.375
const NECK_LEAN = 50

/** The nine-bird solid-flank wing burial. */
const WING_SINK = 0.5

export const WHOOPING_CRANE_ASSEMBLY = defineCreature('animal-whooping-crane', {
  palette: {
    coat: 0xf6f4ec,    // UNREVIEWED: white, which is the whole of the bird
    crown: 0xc0392b,   // UNREVIEWED: the bare red crown — Kenney's band 7
    bill: 0xb6a06a,    // UNREVIEWED: the horn-coloured bill
    limb: 0x2c2a28,    // UNREVIEWED: the long dark legs
    eye: 0xc9922f,     // UNREVIEWED: amber to the rim — a look, not a measurement
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03', paint: 'coat' },
  under: 'coat',

  /* The round card the pack gives its birds, amber to the rim. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE NECK — animal-goose.ts's idiom by way of animal-heron.ts: the elephant's
   * trunk stood on end by overriding its own `z +1` to `axis: 'y', dir: 1`,
   * stretched, leaned and buried. NECK_LEAN is the dial and 2.02 is the ceiling. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'coat',
    axis: 'y',
    dir: 1,
    stretch: [1, NECK_STRETCH, 1],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, HULL_CROWN_Y, NECK_Z],
  },

  /* THE HEAD, on the neck's own built tip, with Kenney's own upper band painted
   * crimson — the bare red crown, for one entry and no geometry. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: { base: 'coat', byBand: { 7: 'crown' } } },

  /* A short white wedge off the rear plate — a crane's tail is a bustle of
   * plumes and this is the bank's one stub. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, FLANK_CENTRE_Y, -0.625],
  },

  legs: false,
  extras: [
    /* Two legs on the pack's own row at animal-chicken.ts's biped station, which
     * is the only one there is. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair' as const,
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0] as [number, number, number],
    },

    /* The folded flank wing the heron and the stork already wear: the bunny's
     * ear turned twice and buried half its own depth in the side of the body. */
    {
      name: 'wing',
      part: 'box-06',
      paint: 'coat',
      kind: 'pair' as const,
      axis: 'z' as const,
      dir: -1 as const,
      spin: [{ axis: 'z' as const, deg: -90 }, { axis: 'y' as const, deg: -90 }],
      sink: WING_SINK,
      at: [HULL_SIDE_X, FLANK_CENTRE_Y, 0] as [number, number, number],
    },

    /* THE BILL, and the reason this bird is not a placeholder. The deer's uncut
     * muzzle stands 0.2314 proud at a recorded burial of zero — the furthest any
     * real nose in the bank reaches — and a crane's bill is about a tenth of the
     * bird, which on this build is roughly 0.19. It is inside reach, so no tail
     * is stood on end here and nothing is stretched. */
    {
      name: 'bill',
      part: 'tube-03',
      paint: 'bill',
      on: 'head',
    },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'THE BLACK WING TIPS ARE NOT THERE and they are the only marking on the bird. A '
    + 'whooping crane is white with black primaries that show in flight; box-06 — the folded '
    + 'flank wing the heron and the stork already wear — is a SINGLE band, so byBand has '
    + 'nothing to cut and Paint.patch takes a height with no way to say "the far end of this". '
    + 'animal-arctic-hare.ts hit the same wall on the same shape and solved it by hanging a '
    + 'second part off the first with `on`; that is the thing to try here and it is one extra. '
    + 'WHAT IS WORTH KNOWING BEYOND THIS ANIMAL: this is the FIRST LONG-NECKED BIRD IN THE '
    + 'PROJECT THAT IS NOT A PLACEHOLDER, and the reason is the bill. animal-heron.ts and '
    + 'animal-stork.ts are both held up by it — that file measures the furthest any nose in '
    + 'the bank stands proud at 0.2314 against roughly 0.5 for a heron, so both wear wedge-18, '
    + 'the tiger\'s tail stood on end, and both overshoot at about 0.90. A crane\'s bill is '
    + 'straight, blunt and about a tenth of the bird, which is roughly 0.19 here, so tube-03 '
    + 'at its own 0.2314 reaches it with nothing stretched and no tail on the face. The NECK '
    + 'is animal-goose.ts\'s idiom unchanged and NECK_LEAN (50) is the dial against the pack\'s '
    + '2.02 ceiling. THE RED CROWN is Kenney\'s own band 7 on tube-06 — the cut animal-wolf.ts '
    + 'uses for a dark bridge — worn as the head. NEW PALETTE, UNREVIEWED.',
})
