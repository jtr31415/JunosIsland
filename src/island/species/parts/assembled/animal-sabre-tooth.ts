/**
 * The sabre-tooth — a cat built around two teeth, on the one hull that is wider
 * than it is tall.
 *
 * **THE HULL IS `box-12` AND IT ALREADY HAS THE EARS ON IT.** `animal-badger.ts`
 * measured that shell: it is not a wide body, it is the 1.250 cube with two ear
 * lugs fused on its SIDES, and band 5 is Kenney's own cut on them. So this
 * animal has no ear feature and must not be given one — a pair on top would be
 * four ears — and the lugs are painted a shade down for one line and no
 * geometry. It is also the right body for the animal: *Smilodon* is the
 * broad-chested short-limbed cat, not the long one, and 1.539 across against the
 * lion's 1.250 is where that gets said.
 *
 * **THE SABRES ARE `wedge-11`, THE ELEPHANT'S TUSK, HUNG DOWN OFF THE FACE.**
 * `animal-warthog.ts` stands the same shape UP out of the crown and records that
 * rule 3 fuses head and body so there is no jaw to hang anything from. This is
 * the same wall reached from the other side: the front plate IS the face, so the
 * sabres are joined into it at 0.78 and driven down and slightly forward at
 * (0, -0.940, 0.342). Their tips land at y 0.31, which is checked and not
 * assumed — `buildAssembly` grounds the model on its lowest point, so a longer
 * pair would lift the feet off the floor rather than reach further.
 *
 * **THERE IS NO SNOUT, DELIBERATELY**, and that is `animal-lynx.ts`'s reading: a
 * big cat's face is flat and wide, every muzzle in the bank stands 0.17 to 0.27
 * proud, and a muzzle in front of the sabres would hide them. The nose is
 * `blade-04`, the lion's own radial nose-tip, straight onto the front face.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s own rear plate centre — `animal-badger.ts`'s solve for a stub. */
const REAR_PLATE_Y = 0.80625

/** The face: `box-12`'s front plate, and where a sabre roots into it. */
const SABRE_Y = 0.78
const SABRE_Z = 0.6

export const SABRE_TOOTH_ASSEMBLY = defineCreature('animal-sabre-tooth', {
  palette: {
    coat: 0xbf9860,    // UNREVIEWED: sandy tawny — the first ever proposed for this species
    belly: 0xefe3cb,   // UNREVIEWED: the pale underside, and the sclera
    mark: 0x8a6a3e,    // UNREVIEWED: the ear lugs and the nose, a shade under the coat
    sabre: 0xf4eddc,   // UNREVIEWED: the two teeth — the only bright thing on the animal
    limb: 0xa88349,    // UNREVIEWED: the short heavy legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The widest shell, taken for its EAR LUGS as much as its width. Band 5 is
   * Kenney's own cut on them, so a darker ear costs one entry and no geometry —
   * and there is no `ears` line, because that would be four ears. */
  hull: { part: 'box-12', paint: { base: 'coat', byBand: { 5: 'mark' } } },
  belly: 0.5,

  /* Short and planted. A sabre-tooth is not a cursorial cat. */
  legs: { x: 0.4, z: 0.3 },

  /* The lion's own radial nose-tip, 0.400 square and 0.100 deep, straight onto
   * the front face — `animal-lynx.ts`'s move, and for its reason. */
  nose: { part: 'blade-04', paint: 'mark' },

  /* A bobbed tail. `box-18` is the bank's only stub at 0.425 of reach against
   * the next shortest at 0.555, and a sabre-tooth's tail is famously short. */
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  extras: [
    /* THE SABRES. Down and forward at (0, -0.940, 0.342), rooted into the front
     * plate rather than hung off a jaw that rule 3 does not allow to exist. */
    {
      name: 'sabre',
      part: 'wedge-11',
      paint: 'sabre',
      kind: 'pair',
      stretch: [1, 1, 1.8],
      spin: [{ axis: 'x', deg: 70 }],
      at: [0.11, SABRE_Y, SABRE_Z],
    },
  ],

  flag: 'THE SABRES COME OUT OF THE FRONT PLATE, NOT A JAW, and that is the compromise to '
    + 'look at. Rule 3 fuses head and body into one mass, so there is no upper jaw to hang a '
    + 'canine from — animal-warthog.ts hit the identical wall standing the same shape UP and '
    + 'recorded it. They are wedge-11, the ELEPHANT\'s tusk, stretched 1.8x along its own long '
    + 'axis and turned down and forward to (0, -0.940, 0.342); their tips land at y 0.31, which '
    + 'is a checked number and not a preference, because the model grounds on its lowest point '
    + 'and a longer pair lifts the feet off the floor instead of reaching further. Dragging '
    + 'them lower is therefore NOT free. THE HULL IS box-12 AND IT ALREADY HAS EARS ON IT: '
    + 'animal-badger.ts measured that shell as the 1.250 cube with two ear lugs fused on its '
    + 'sides, so there is no ear feature here and adding one would give this cat four. Band 5 '
    + 'is Kenney\'s own cut on those lugs and is painted a shade down. AGAINST THE FROZEN LION '
    + 'AND TIGER: neither wears this shell, neither has a bobbed tail, and neither has the '
    + 'teeth — and the SPOTS a real Smilodon may have had are absent for the project\'s oldest '
    + 'reason, that colour is a lookup with no positional information. NEW PALETTE, UNREVIEWED.',
})
