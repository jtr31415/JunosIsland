/**
 * The snowy owl — a white owl with no tufts, which is the opposite of
 * `animal-owlet` in every way that file's own argument turns on.
 *
 * That bird's flag says the tufts are what stop it being *"a round brown bird
 * with big eyes and nothing else"*, and it takes `plate-14`, the panda's card
 * and the biggest eye in the bank, because rule 5 makes eye size a part choice.
 * **A snowy owl has NO ear tufts and its eyes are small and yellow**, so this
 * animal is built by taking the opposite of both and paying for the difference
 * elsewhere:
 *
 *   - **`plate-08`, the round card**, painted a hard chrome yellow to the rim.
 *     Round rather than almond, 0.400 x 0.400 against the panda card's 0.435 x
 *     0.443, and the colour is doing what the size does on the owlet.
 *   - **No tufts at all**, which leaves the crown bare and is correct.
 *   - **The BARRING is the animal instead.** Four flat cards — `plate-11` and
 *     `plate-10`, both by pure donor transfer at their own recorded stations on
 *     the flank — painted charcoal on white. A female snowy owl is barred and a
 *     male is nearly plain; this is the female, because a plain white bird on a
 *     white ground has no silhouette at all.
 *
 * `box-33`, the monkey's cube: one band across all 114 triangles, so the belly
 * line is the only boundary anywhere on the shell and nothing competes with it.
 *
 * The bill is `cone-06`, the parrot's point, small and dark — most of an owl's
 * bill is buried in the feathers of its face, so a big one would be wrong as
 * well as absent. That is `animal-owlet.ts`'s finding, taken unchanged.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre — `animal-badger.ts`'s solve, every stub takes it. */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

export const SNOWY_OWL_ASSEMBLY = defineCreature('animal-snowy-owl', {
  palette: {
    coat: 0xf2f5f8,    // UNREVIEWED: white with the faintest cool cast
    belly: 0xffffff,   // UNREVIEWED: a true white underside
    bar: 0x4b5058,     // UNREVIEWED: the charcoal barring cards
    bill: 0x22262b,    // UNREVIEWED: near-black, small
    limb: 0xe8ecf0,    // UNREVIEWED: feathered feet, which this bird has
    eye: 0xe0b21c,     // UNREVIEWED: chrome yellow to the rim — the whole face
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-33' },
  belly: 0.5,

  /* ROUND AND YELLOW, against the owlet's biggest-in-the-bank almond. Rule 5
   * forbids scaling a card, so an eye is a part choice and a paint. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* The parrot's point, small and dark — `animal-owlet.ts`'s finding. */
  snout: { part: 'cone-06', paint: 'bill' },

  /* The bank's only stub, at the rear plate's own centre. An owl's tail is
   * short and square and does nothing a child would name it by. */
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, REAR_PLATE_Z] },

  legs: false,
  extras: [
    /* Two legs, on the pack's own row. Feathered to the toe, which is what a
     * snowy owl has and is one palette entry rather than a part. */
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* The chick's and parrot's wing. It carries the `wing` role, so the
     * wingbeat attaches with nothing declared (`creature.ts`'s default flap). */
    { name: 'wing', part: 'wedge-19', paint: 'coat', kind: 'pair' },

    /* THE BARRING. Both flank cards by PURE DONOR TRANSFER — no `at`, no spin,
     * no stretch — so each lands on the station the cow, dog and giraffe put it
     * at, edge-on to this cube's own flat side face. Four cards, 20 triangles
     * each pair, and they are the only thing giving a white bird an outline. */
    { name: 'bar-fore', part: 'plate-11', paint: 'bar', kind: 'pair' },
    { name: 'bar-aft', part: 'plate-10', paint: 'bar', kind: 'pair' },
  ],

  flag: 'THIS BIRD IS animal-owlet TURNED INSIDE OUT AND THAT IS THE THING TO JUDGE. That '
    + 'file\'s whole argument is that its tufts are what stop it being "a round brown bird with '
    + 'big eyes", and that rule 5 makes eye SIZE a part choice, so it takes plate-14, the '
    + 'biggest card in the bank. A snowy owl has NO ear tufts and SMALL yellow eyes, so this '
    + 'one takes plate-08, the 0.400 round card, and spends the difference on colour: chrome '
    + 'yellow to the rim. THE BARRING IS DOING THE SILHOUETTE. A white bird on white has no '
    + 'outline, so four flat cards — plate-11 and plate-10, both by pure donor transfer at '
    + 'their own recorded flank stations — are painted charcoal. That makes this the FEMALE, '
    + 'because a male snowy owl is nearly plain white; if you want the male, delete those two '
    + 'entries and the bird is unmarked. NEW PALETTE, UNREVIEWED.',
})
