/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually. if there is no entry at all,
 * i cant do that."* This is that entry, and what is missing is the whole animal.
 *
 * ## What is missing, measured
 *
 * **A CURL. There is no curve anywhere in the bank.** All 100 baked shapes are
 * straight or tapered along a single axis, and rule 4 as amended bakes a
 * ROTATION into a copy's vertices — it turns a part and it cannot bend one. A
 * Dall ram's horns are a full spiral coming out of the skull, sweeping down
 * behind the ear, forward under the jaw and back up past the eye; that is what
 * the animal IS, and a straight spike is not a small approximation of it.
 * `collections/ocean.ts` priced the same gap for the seahorse and
 * `collections/birds.ts` for the flamingo's bill; Ice names it three times over
 * and this is the one species held up by it. Without the curl, this animal is a
 * white goat.
 *
 * **The ewe is buildable and the ram is not**, which is worth knowing before
 * anybody spends anything: a Dall ewe has short straight horns and the pair
 * below is very nearly right for one. It is the ram that needs the shape.
 *
 * ## What is standing in, and it answers a question `animal-buffalo.ts` asked
 *
 * That file's flag ends: *"WHAT TO TRY FIRST BY HAND: a second shorter pair of
 * wedge-13 spun up at the outer end of the first, hung off the horn with `on`."*
 * **That is exactly what is here, and it is the first time it has been tried.**
 *
 *   - `horn` is `wedge-11`, the elephant's tusk, stretched 1.6x along its own
 *     length and turned out and DOWN: `{ y, 90 }` takes its `z +1` to `x +1`
 *     (`animal-ox.ts`'s own first spin) and `{ z, -30 }` drops it to
 *     (0.866, -0.500, 0).
 *   - `horn-tip` is `wedge-13`, the hog's, hung `on: 'horn'` — which anchors it
 *     to the first segment's own BUILT outer face, measured off the vertices
 *     rather than guessed — and turned out and UP at `{ z, 40 }`, which is
 *     (0.766, 0.643, 0).
 *
 * Two straight segments meeting at 70 degrees is a bent line, not a spiral. It
 * is a better bent line than one segment, and whether it reads at all is the
 * thing to look at.
 *
 * **If you are doing this by hand:** the two angles and the `on` anchor are the
 * whole of it. A third segment is available the same way (`on: 'horn-tip'`) and
 * costs 38 triangles; three chords through 140 degrees is most of a half turn
 * and may be the cheapest thing that makes a ram out of this. Watch the
 * keep-out — every degree of outward splay is charged to `max(width, depth) / 2`
 * at `pets.ts:652`, and Woodland's header holds that ceiling at 1.6.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre — `animal-badger.ts`'s solve for every stub. */
const REAR_PLATE_Y = 0.80625
/** `box-03`'s flat crown and its flat flank. */
const CROWN_Y = 1.43125
const FLANK_X = 0.625

export const DALL_SHEEP_ASSEMBLY = defineCreature('animal-dall-sheep', {
  palette: {
    coat: 0xf6f8f8,    // UNREVIEWED: a Dall sheep is genuinely white, not cream
    fleece: 0xe6eaea,  // UNREVIEWED: the legs, a shade under the coat
    horn: 0xb99a63,    // UNREVIEWED: amber horn, which is the only colour on the animal
    hoof: 0x3a332c,    // UNREVIEWED: JT-044's second tone on the leg
    mark: 0x2a251f,    // UNREVIEWED: the nose
    pale: 0xffffff,    // UNREVIEWED: the sclera
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  under: 'pale',

  /* JT-044 at the HOOF end, 4/16 — the pony's line, which `animal-sheep.ts` §4
   * derives in full and predicts by name for every lean caprid: "a goat belongs
   * at 4/16 with the horse." A wild sheep belongs there too. */
  legs: { paint: { base: 'fleece', patch: { below: 'hoof', at: 0.25 } } },

  /* The tiger's ear, upright and small. `animal-goat.ts` wears `cone-04` on its
   * SIDE and `animal-sheep.ts` wears `cone-02` on its side; a wild sheep carries
   * its ears up and forward, and this is the one pricked ear neither took. */
  ears: { part: 'wedge-16', paint: 'coat', at: [0.24, CROWN_Y, 0.16] },

  /* The giraffe's muzzle, which nothing in this collection wears and which is
   * the pack's other long ungulate face — the goat has the fox's `tube-06` and
   * the sheep has none at all. */
  snout: { part: 'tube-07', paint: 'coat' },
  nose: { part: 'box-14', paint: 'mark' },

  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  extras: [
    /* SEGMENT ONE: out and DOWN. */
    {
      name: 'horn',
      part: 'wedge-11',
      paint: 'horn',
      kind: 'pair',
      stretch: [1, 1, 1.3],
      spin: [{ axis: 'y', deg: 70 }, { axis: 'z', deg: -30 }],
      at: [FLANK_X, 1.22, 0.10],
    },

    /* SEGMENT TWO: out and UP, hung off segment one's own built outer face.
     * This is `animal-buffalo.ts`'s own suggested experiment, run. */
    {
      name: 'horn-tip',
      part: 'wedge-13',
      paint: 'horn',
      kind: 'pair',
      stretch: [1, 1, 1.3],
      spin: [{ axis: 'y', deg: 90 }, { axis: 'z', deg: 40 }],
      on: 'horn',
    },
  ],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. THE BANK HAS NO '
    + 'CURVE: all 100 shapes are straight or tapered along one axis, and rule 4 bakes a '
    + 'ROTATION into a copy, which turns a part and cannot bend one. A Dall ram\'s horns are a '
    + 'full spiral out of the skull, down behind the ear, forward under the jaw and back up '
    + 'past the eye, and that IS the animal — without it this is a white goat. '
    + 'collections/ocean.ts priced the same gap for the seahorse and collections/birds.ts for '
    + 'the flamingo\'s bill, and Ice asks for it three times over. WORTH KNOWING: '
    + 'the EWE is buildable and the RAM is not — a Dall ewe has short straight horns and the '
    + 'pair here is nearly right for one. WHAT IS HERE ANSWERS A QUESTION animal-buffalo.ts '
    + 'ASKED: its flag says to try "a second shorter pair of wedge-13 spun up at the outer end '
    + 'of the first, hung off the horn with `on`", and that is exactly this — wedge-11 out and '
    + 'down at (0.866, -0.500, 0), then wedge-13 hung `on: \'horn\'` and turned out and up at '
    + '(0.766, 0.643, 0). Two chords meeting at 70 degrees is a bent line, not a spiral, and '
    + 'whether it reads at all is the thing to judge. A THIRD segment is available the same way '
    + '(`on: \'horn-tip\'`) for 38 triangles and may be the cheapest thing that finishes it — '
    + 'but watch the keep-out, because every degree of splay is charged to max(width, depth)/2 '
    + 'and Woodland holds that ceiling at 1.6. NEW PALETTE, UNREVIEWED.',
})
