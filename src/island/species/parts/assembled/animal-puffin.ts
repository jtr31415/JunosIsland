/**
 * The puffin — the bill IS the animal, and for once the bank has the right
 * shape rather than the right length.
 *
 * This bird was surveyed OUT of the collection at first, alongside the toucan
 * and the pelican, and the survey was wrong about it. The three are not the same
 * problem, and measuring them apart is what put this one back in:
 *
 *   - **A toucan's bill fails on LENGTH.** The longest thing any nose in the
 *     bank stands proud is 0.2314 (`tube-03`/`tube-06`), and `cone-06` reaches
 *     0.1833; a toucan's is about a third of the whole bird, which on a 1.250
 *     body is roughly 0.6. Three times short, and there is nothing to reach for.
 *   - **A pelican's fails on SHAPE** — it is a pouch, and there is no pouch.
 *   - **A puffin's bill is not long at all.** It is DEEP, triangular, laterally
 *     flattened, and cut into coloured bands across its depth. Measured,
 *     `cone-06` is 0.400 wide x 0.401 TALL x 0.287 deep, taper 0 — a true point
 *     — and it arrives already split into band 15, the upper mandible, and band
 *     13, the lower. Depth-to-length is the one proportion in the bank that
 *     matches, and the colour bands are Kenney's own.
 *
 * So the bill is `cone-06` with its two bands painted red and slate, and it is
 * the only thing on this bird a child needs.
 *
 * **THE ANIMAL IT MUST NOT BE IS `animal-penguin`, WHICH IS FROZEN.** A small
 * upright black-and-white seabird is a penguin unless something says otherwise,
 * and three things do: the penguin wears `box-39`, `tube-02` (a blunt bar) and
 * the pack's flipper wings; this wears `box-36`, the deep coloured `cone-06`,
 * and `wedge-19`, the chick's real wing. `box-36`'s band 3 is the front-and-rear
 * cut `animal-raccoon.ts` found and spends as a pale face; here it is the white
 * breast, and it keeps this bird off the penguin's own shell.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre — every one of the pack's ten hulls shares it. */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

/** 4/16, derived off `box-01`'s own bevel in `animal-chicken.ts` §5. */
const FOOT_AT = 0.25

export const PUFFIN_ASSEMBLY = defineCreature('animal-puffin', {
  palette: {
    coat: 0x1e1c20,
    belly: 0xf4f2ea,
    bill: 0xd4462c,
    plate: 0x8f9aa4,
    limb: 0xe0801c,
    foot: 0xba5f10,
    eye: 0x14100c,
    pupil: PACK_PUPIL,
  },

  /* The panda\'s cut of the shared cube, for its band 3 — Kenney\'s own
   * front-and-rear cut, which animal-raccoon.ts spends as a pale face and which
   * is a puffin\'s white breast. Deliberately NOT box-39, which is the frozen
   * penguin\'s own shell. */
  hull: { part: 'box-36', paint: { base: 'coat', byBand: { 3: 'belly' } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE BILL. cone-06 is 0.400 x 0.401 x 0.287 — as TALL as it is wide, which no
   * other nose in the bank is — and it arrives split at Kenney\'s own upper/lower
   * cut, band 15 over band 13. Red over slate is a puffin\'s summer bill and it
   * costs one entry. */
  snout: { part: 'cone-06', paint: { base: 'bill', byBand: { 13: 'plate' } } },

  /* The bank\'s only stub, at the rear plate\'s own centre. An auk\'s tail is a
   * short black wedge and nothing more. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, REAR_PLATE_Y, REAR_PLATE_Z],
  },

  legs: false,
  extras: [
    /* JT-044\'s two-tone leg spent on the thing a puffin actually has: bright
     * orange feet, a shade deeper on the webbing. */
    {
      name: 'leg-front',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: FOOT_AT } },
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'coat',
      kind: 'pair',
    },
  ],

  flag: 'THIS BIRD WAS SURVEYED OUT OF THE COLLECTION AND THE SURVEY WAS WRONG, which is worth '
    + 'more than the animal. It was grouped with the toucan and the pelican as "a bill the bank '
    + 'does not have", and measuring the three apart put it back: a TOUCAN fails on LENGTH (the '
    + 'longest any nose stands proud is 0.2314 for tube-03/tube-06 and cone-06 reaches 0.1833, '
    + 'against roughly 0.6 for a toucan on a 1.250 body — three times short), a PELICAN fails on '
    + 'SHAPE because there is no pouch, and a PUFFIN\'s bill is not long at all. It is DEEP, '
    + 'triangular and banded, and cone-06 is 0.400 wide x 0.401 TALL x 0.287 deep with taper 0 — '
    + 'the only nose in the bank as tall as it is wide — arriving already split into band 15 '
    + '(upper mandible) and band 13 (lower). Red over slate is one byBand entry and no geometry. '
    + 'THE THING TO CHECK IS THE FROZEN animal-penguin: a small upright black-and-white seabird '
    + 'is a penguin unless something says otherwise. Three things do — the penguin wears box-39, '
    + 'tube-02 (a blunt bar) and the pack\'s flipper wings; this wears box-36, the deep coloured '
    + 'cone-06 and wedge-19, the chick\'s real wing — and box-36 was chosen partly to keep it off '
    + 'the penguin\'s own shell. If it still reads as a penguin at album size, the bill is the '
    + 'dial and it is already the biggest the bank has. THE WHITE FACE UNDER A BLACK CAP is not '
    + 'here: box-36\'s band 3 is a front-and-rear cut and it is spent on the white breast, rule 3 '
    + 'is one mass so there is no head to paint, and Paint.patch takes a height with no z term. '
    + 'NEW PALETTE, UNREVIEWED.',
})
