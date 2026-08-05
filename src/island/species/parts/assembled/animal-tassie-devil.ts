/**
 * The Tasmanian devil — a black animal with a white chest, and the chest costs
 * nothing at all.
 *
 * **`box-39`, the penguin's cube, has TWO bands and band 3 is its forward one.**
 * `animal-robin.ts` paints it red, `animal-kingfisher.ts` chestnut and
 * `animal-duck.ts` a drake's breast; here it is the white chest blaze, which is
 * the one marking a child is told about this animal — and it is Kenney's own cut
 * rather than a card, a stretch or a painted line, so it costs one `byBand`
 * entry and no geometry.
 *
 * That is the whole trick of this file. Everything else is a heavy blunt
 * carnivore, said in three parts:
 *
 *   - **`box-08`, the bunny's muzzle**, which attaches `y +1` and so sits high
 *     on the FRONT of the head rather than standing out in front of it. A
 *     devil's head is enormous and its face is flat; `animal-porcupine.ts` is
 *     the standing derivation and it is right here for the opposite animal.
 *   - **`box-30`, the lion's ear** — 0.315 x 0.331, mounted `z +1` at a burial
 *     of 0.510, which is a rounded ear set low and forward on a big skull.
 *     Painted from its own slot, because a devil's ears are pink bare skin and
 *     go red, and `belly` splits the coat's CELL rather than the hull alone —
 *     `animal-stoat.ts` shipped cream ears exactly that way.
 *   - **`box-18`, the elephant's trunk worn backwards** — the bank's only STUB
 *     (taper 0.994, the least tapering of the seven tails) and the shortest at
 *     0.425 of reach. A devil's tail is a short thick cone and this is the only
 *     tail here that is a block.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-39`'s own recorded centre and rear face. */
const HULL_MID_Y = 0.80625
const HULL_REAR_Z = -0.625

export const TASSIE_DEVIL_ASSEMBLY = defineCreature('animal-tassie-devil', {
  palette: {
    coat: 0x241f1e,    // UNREVIEWED: near-black, and nearly all of it
    blaze: 0xf0ece4,   // UNREVIEWED: THE WHITE CHEST — box-39's own forward band
    ear: 0xd9807a,     // UNREVIEWED: the pink bare ears, in a slot of their own
    limb: 0x35302d,    // UNREVIEWED: the short heavy legs and the blunt muzzle
    eye: 0xe8e2d6,     // UNREVIEWED: the sclera, since there is no pale slot
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* Kenney's own forward band as the chest blaze. No card, no stretch, no
   * painted line — one entry, and the boundary is the model's own. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'blaze' } } },

  /* The sclera has to come from somewhere and this animal has no pale underside
   * worth painting: it is black to the ground and the blaze is a band. */
  under: 'eye',

  /* Wide and short. A devil is a low heavy animal that waddles. */
  legs: { x: 0.4375, z: 0.3125 },

  /* THE EARS, in a slot of their own. See the header: a `patch` is a property of
   * the SLOT, not of the part that declared it, and a devil's ears must not be
   * able to inherit a boundary nobody wrote for them.
   *
   * MOUNTED ON THE CROWN rather than on the face, which is an axis override —
   * `PartDef.axis`'s own "tortoise-hoop trick". `box-30` is the lion's ear and
   * attaches `z +1`, and the bare transfer therefore joins it at this cube's
   * FRONT face at the lion's own y = 1.337 — which is 0.218 past where box-39's
   * flat front plate ends at 1.11875, so the chamfer has fallen further than the
   * 0.129 the ear is buried and it floats. Declaring `y +1` and a station wholly
   * inside the flat top plate (|x| and |z| under 0.3125) fixes it by putting the
   * ears where a devil's are anyway: high on a very large head. */
  ears: { part: 'box-30', paint: 'ear', axis: 'y', dir: 1, at: [0.28125, 1.43125, 0.1875] },

  /* The bunny's blunt muzzle, high on the front of the head. */
  snout: { part: 'box-08', paint: 'coat' },

  /* The panda's nose-tip, written out rather than anchored: `box-08`'s outer
   * face is its TOP, so an anchored nose would sit on the bridge. The
   * porcupine's own reason, unchanged. */
  nose: { part: 'box-37', paint: 'limb', at: [0, 0.95, 0.625] },

  /* The bank's only STUB, worn backwards — animal-badger.ts's line. Its own
   * recorded burial is exactly zero, alone in the bank, so its whole join
   * cross-section has to land on flat geometry: half-height 0.311502 against
   * this cube's flat rear reach of 0.312500, which fits by 0.000998 and pins the
   * height. animal-chicken.ts §4 is the derivation. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, HULL_MID_Y, HULL_REAR_Z],
  },

  flag: 'THE WHITE CHEST IS KENNEY\'S OWN BAND AND IT COSTS NOTHING. box-39, the penguin\'s '
    + 'cube, carries two bands and band 3 is its forward one — animal-robin.ts paints it red '
    + 'and animal-kingfisher.ts chestnut — so the one marking a child is told about this animal '
    + 'is one byBand entry with the model\'s own boundary, rather than a card, a stretch or a '
    + 'painted line. THE EARS HAVE A SLOT OF THEIR OWN and that is not tidiness: animal-stoat.ts '
    + 'shipped with cream ears because `belly` splits the CELL of whatever slot the hull is '
    + 'painted from and every part sharing that slot reads the split. A devil\'s ears are pink '
    + 'bare skin, so they are painted from `ear` and nothing can reach them. There is no belly '
    + 'line at all here, deliberately — the animal is black to the ground and the blaze is the '
    + 'band. THE TAIL\'S HEIGHT IS NOT A CHOICE: box-18 records a burial of exactly zero, alone '
    + 'in the bank, so its whole 0.311502 half-height has to land on the cube\'s flat rear reach '
    + 'of 0.312500 and it fits by one thousandth; moving it up carries the top corner onto the '
    + 'chamfer with nothing buried to cover the fall. NEW PALETTE, UNREVIEWED. NOTE ALSO that '
    + 'it has NO TEETH on purpose, animal-crocodile.ts\'s own call: the bank has tooth shapes '
    + 'that would have mounted free and brief §19 is "bright, never scary".',
})
