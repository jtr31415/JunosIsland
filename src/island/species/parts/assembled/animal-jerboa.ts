/**
 * PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. What is
 * missing is THE HIND LEG, and a jerboa is more hind leg than anything else: it
 * stands and hops on two of them, each far longer than its body. The bank holds
 * ONE leg shape, `box-01`, 0.30625 tall, at ONE absolute row height of 0.18125,
 * and `animal-kangaroo.ts` and `animal-ostrich.ts` each hit the same wall and
 * wrote the same sentence. What stands in is the BIPED STATION those two use —
 * two `box-01` at the pack's own row, on the midline — so the animal at least
 * stands the right way up. WHAT TO TRY FIRST: the long hind leg is one
 * commission and it finishes the kangaroo, the ostrich, the quokka, the emu and
 * Near Threatened's maned wolf in the same stroke.
 *
 * The other two thirds of a jerboa are here and are real. The EARS are the
 * elephant's side flap stood on end — `animal-llama.ts`'s remount, `axis: 'y'`
 * overriding its recorded `x +1` — which is the only shape in the bank much
 * taller than it is broad. The TAIL is the lion's, 1.0824 of reach, and BAND 5
 * is Kenney's own tuft: 40 of its 212 triangles, cut exactly where the tassel
 * begins, so a jerboa's white-tipped tail costs no second part.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'
import { LEG_ROW } from '../hulls'

/** The flat crown of the 1.250 cube, and `HEIGHT_FLOOR`. */
const CROWN_Y = 1.43125

export const JERBOA_ASSEMBLY = defineCreature('animal-jerboa', {
  palette: {
    coat: 0xd8b47e,    // UNREVIEWED: sand — the whole animal, and it paints the HULL only
    belly: 0xf7efdf,   // UNREVIEWED: the white underside, and the sclera
    /* The coat's own sand under a second name, for the parts that must NOT read
     * the belly split — `animal-stoat.ts`'s fault: a patch belongs to the SLOT. */
    fur: 0xd8b47e,     // UNREVIEWED: the same sand — the ears, the muzzle and the tail
    pale: 0xfbf6ec,    // UNREVIEWED: the tail tuft, whiter than the belly
    mark: 0x3a2e21,    // UNREVIEWED: the nose, and the dark band on the tuft
    limb: 0xc9a271,    // UNREVIEWED: the two legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The fish's cube — 78 triangles, and no rodent in the project is on it. The
   * plain `box-03` is spent six ways over among the small mammals. */
  hull: { part: 'box-20' },
  belly: 0.4375,

  /* HUGE AND ROUND. `plate-08` is the pack's 0.400 disc, its largest round eye,
   * and a jerboa's eye really is that fraction of its head — this is one of the
   * few species where the pack's absolute eye (rule 5) is too SMALL rather than
   * too big, and there is no dial, which is correct. */
  eyes: { part: 'plate-08' },

  /* THE EARS. The elephant's flap stood on end and left broad rather than turned
   * edge-on the way `animal-llama.ts` turns it — a jerboa's ears face forward and
   * are nearly the length of its head. */
  ears: {
    part: 'tube-04',
    paint: 'fur',
    axis: 'y',
    dir: 1,
    stretch: [0.85, 1.15, 0.85],
    sink: 0.2,
    at: [0.22, CROWN_Y, 0.125],
  },

  /* The beaver's short muzzle, the smallest snout in the bank. */
  snout: { part: 'tube-01', paint: 'fur' },
  nose: { part: 'box-09', paint: 'mark' },

  /* THE LION'S TAIL, and band 5 is its tuft — 40 triangles of 212, Kenney's own
   * cut. Painted white against a sand rope, which is a jerboa's flag. */
  tail: { part: 'wedge-15', paint: { base: 'fur', byBand: { 5: 'pale' } } },

  legs: false,
  extras: [
    /* TWO legs on the pack's own row at `box-01`'s own recorded x and the hull's
     * midline — `animal-chicken.ts`'s biped station, and the only one there is. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },
  ],

  motion: [{ kind: 'twitch', parts: ['ear'] }],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. WHAT IS MISSING '
    + 'IS THE HIND LEG. A jerboa hops on two hind legs each longer than its body; the bank '
    + 'holds ONE leg shape, box-01, 0.30625 tall, on ONE absolute row at y = 0.18125, and there '
    + 'is no dial that lengthens it — animal-kangaroo.ts and animal-ostrich.ts each measured '
    + 'the same wall, and animal-llama.ts measured that the row cannot be LOWERED either '
    + '(LEG_ROW.sink buries the leg exactly 0.125000, rule 3\'s nothing-floats floor with no '
    + 'slack). What is here is those files\' BIPED STATION: two box-01 on the pack\'s row at '
    + 'the midline, so the animal at least stands upright. THE ONE PART THAT WOULD FIX THIS is '
    + 'a long hind leg, and it finishes the kangaroo, the ostrich, the quokka, the emu and this '
    + 'collection\'s maned wolf in the same commission. EVERYTHING ELSE IS REAL: tube-04, the '
    + 'elephant\'s flap stood on end (animal-llama.ts\'s remount) and left BROAD rather than '
    + 'turned edge-on, which is the only shape in the bank much taller than it is wide; '
    + 'plate-08, the pack\'s biggest round eye, on the one animal where rule 5\'s absolute eye '
    + 'is too small rather than too big; and wedge-15, the lion\'s tail, whose BAND 5 is '
    + 'Kenney\'s own tuft — 40 triangles of 212 — painted white, so the flag on the end costs '
    + 'no second part. THE HULL IS box-20, the fish\'s cube, because box-03 is already spent on '
    + 'six small mammals. NEW PALETTE, UNREVIEWED.',
})
