/**
 * The jaguarundi — the one cat in the project with NOTHING on it.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * Seven cats are built or frozen and every one of them is a pattern or a tuft:
 * `animal-tiger` is striped, `animal-lion` has the mane, `animal-jaguar` has
 * rosettes, `animal-ocelot` twelve chained spots, `animal-cheetah` eight spots
 * and two tear lines, `animal-lynx` ear tufts, `animal-wildcat` a black-clubbed
 * tail. **A jaguarundi has none of those things — one flat colour from nose to
 * tail tip, no belly line, no marking card anywhere** — and the whole design is
 * that subtraction. `collections/jungle.ts` had to spend five flags on patterns
 * this project cannot paint; this animal is the one member of the family that
 * asks for nothing it cannot have.
 *
 * The shape says the rest. `box-31`, the lion's shallow shell at 1.125 deep, is
 * the only hull that is lower than it is wide, and a jaguarundi is famously long
 * and low — an otter of a cat. On it: the smallest round ears in the bank
 * (`box-02`, the beaver's and the polar bear's button, buried 0.7 so it barely
 * breaks the outline) and the LONGEST tail the pack owns, `wedge-15` at 1.0824,
 * painted the body colour entire.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-31`'s own numbers: centre (0, 0.80625, -0.0625), flat crown 1.43125,
 * front face 0.500 — the one hull whose front is not 0.625 — and the eye card
 * still at 0.6350, because this is the lion's shell and that is the lion's eye. */
const CROWN_Y = 1.43125
const HULL_MID_Y = 0.80625
const REAR_PLATE_Z = -0.625

export const JAGUARUNDI_ASSEMBLY = defineCreature('animal-jaguarundi', {
  palette: {
    coat: 0x6a6055,    // UNREVIEWED: the grey morph — a smoky brown-grey, edge to edge
    pale: 0xd9d2c6,    // UNREVIEWED: the sclera, and nothing else. There is no belly line
    mark: 0x33291f,    // UNREVIEWED: the nose
    limb: 0x5c5349,    // UNREVIEWED: the short legs, one shade under the coat
    eye: 0xb08a3f,     // UNREVIEWED: amber, to the rim
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE SHALLOW SHELL — 1.250 x 1.250 x 1.125, the only hull lower than it is
   * wide. `animal-hare.ts` and `animal-stoat.ts` take it for the same reason and
   * neither is a cat. NO BELLY LINE, which is the point of the animal. */
  hull: { part: 'box-31' },
  under: 'pale',

  /* Short and close: a jaguarundi's legs are the shortest of any American cat. */
  legs: { x: 0.26, z: 0.26 },

  /* The pack's almond, painted amber to the rim, against `animal-ocelot.ts`'s
   * and `animal-cheetah.ts`'s round `plate-08` disc. `plate-04`, the CAT's own
   * card, was reached for first and refused on a measurement: all 34 of its
   * triangles are band 15, so it is pupil edge to edge and has no sclera to
   * paint — `plate-01` splits 17 / 10, which is what an eye colour needs. */
  eyes: { part: 'plate-01', paint: 'eye' },

  /* THE BEAVER'S AND POLAR BEAR'S BUTTON, buried 0.7 of its own 0.315 so only
   * 0.095 breaks the outline. Every other cat here wears a pointed ear or a
   * tufted one; this animal's are small, round and set low, and that is the
   * second thing a field guide says about it after the colour. */
  ears: { part: 'box-02', paint: 'coat', sink: 0.7, at: [0.26, CROWN_Y, 0.0625] },

  /* `box-31`'s front face is 0.500 where every other hull's is 0.625, so a nose
   * placed straight on it would sit 0.042 BEHIND the eye plane, which is at the
   * lion's own absolute 0.6350 whatever the hull. The beaver's short muzzle
   * carries the face forward to 0.672 and the nose then hangs off it. */
  snout: { part: 'tube-01', paint: 'coat' },
  nose: { part: 'box-10', paint: 'mark' },

  /* THE LONGEST TAIL IN THE BANK, 1.0824 of reach, painted the coat entire. The
   * ocelot takes `wedge-18` at 1.0466 and the wildcat's is black-clubbed; this
   * one is longer than either and has no marking on it at all. */
  tail: { part: 'wedge-15', paint: 'coat', at: [0, HULL_MID_Y, REAR_PLATE_Z] },

  motion: [{ kind: 'wag', parts: ['tail'] }],
})
