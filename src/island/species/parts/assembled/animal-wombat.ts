/**
 * The wombat — the widest shell in the pack, wearing the pack's roundest ear.
 *
 * A wombat is a barrel on short legs with a bare nose and small round ears, and
 * every one of those four is sayable here without straining anything.
 *
 *   - **`box-12`, the cow's and the deer's shell** — 1.5395 across against the
 *     cube's 1.250, the only hull in the bank that is WIDER than it is tall. A
 *     wombat is the broadest animal in this collection and this is the one place
 *     that can be said, since a hull is never scaled.
 *   - **`box-02`, the beaver's and polar bear's ear**, radial, 0.315 across and
 *     buried its own 0.778 — the deepest-set ear in the bank. That burial is what
 *     makes a small round ear read as sunk into a fat head rather than stuck on.
 *   - **`box-40`, the polar bear's nose** — 0.400 x 0.321, the broadest solid
 *     nose in the bank. A wombat's nose really is a bare pad most of its face.
 *   - **NO TAIL.** A wombat's is a stub under the fur and nothing in the bank is
 *     shorter than `box-18`'s 0.425 of reach, so the honest answer is to leave
 *     it off rather than hang a stub on.
 *
 * The legs go WIDE (7/16) rather than long: `pets.ts:652` charges keep-out on
 * `max(width, depth) / 2` and this is already the widest shell, so the stance is
 * the one place the stockiness can be paid for cheaply.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const WOMBAT_ASSEMBLY = defineCreature('animal-wombat', {
  palette: {
    coat: 0x8d7358,    // UNREVIEWED: the dry sandy brown of a bare-nosed wombat
    belly: 0xb9a184,   // UNREVIEWED: a shade up, not a true pale belly — and the sclera
    nose: 0x4a3d33,    // UNREVIEWED: the big bare nose pad
    limb: 0x6f5943,    // UNREVIEWED: the short legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The widest shell in the pack, and the whole of why this animal is on it. */
  hull: { part: 'box-12', paint: 'coat' },

  /* 8/16 — the tiger's own mammal line made exact, and this hull's own equator.
   * A wombat is barely two-tone, so the pale slot is only a shade up. */
  belly: 0.5,

  /* 7/16. Wide rather than long: the shell is already 1.5395 across and length
   * is what keep-out charges for, so the stance carries the stockiness. */
  legs: { x: 0.4375 },

  /* The bank's deepest-set ear, at its own burial on a hull whose top face is
   * the cube's, so the donor transfer is a straight recovery. */
  ears: { part: 'box-02', paint: 'coat' },

  /* The blunt rodent face — the bunny's muzzle, which attaches `y +1` and so
   * sits high on the FRONT of the head rather than standing out in front of it.
   * `animal-porcupine.ts` is the standing derivation. */
  snout: { part: 'box-08', paint: 'coat' },

  /* The broadest solid nose in the bank, written out rather than anchored to
   * the snout: `box-08`'s outer face is its TOP, so `on` would put the nose on
   * the bridge. The porcupine's own reason, unchanged. */
  nose: { part: 'box-40', paint: 'nose', at: [0, 0.95, 0.625] },

  flag: 'NEW PALETTE, UNREVIEWED — the first wombat ever built and the first colours ever '
    + 'proposed for it. THERE IS NO TAIL, deliberately: a wombat\'s is a stub buried in fur, '
    + 'and the shortest tail in the bank is box-18 at 0.425211 of reach, which on this animal '
    + 'would read as a beaver\'s. Leaving it off is the honest answer and it is your call to '
    + 'overrule. THE SHELL IS THE ANIMAL: box-12 is the only hull in the bank wider than it is '
    + 'tall (1.5395 x 1.250 x 1.250) and a wombat is the broadest thing in this collection — '
    + 'and since HullDef carries no stretch, naming a real shell is the only way that is '
    + 'sayable at all. The legs go wide at 7/16 rather than long because pets.ts:652 charges '
    + 'keep-out on max(width, depth) / 2 and this shell has already spent the width.',
})
