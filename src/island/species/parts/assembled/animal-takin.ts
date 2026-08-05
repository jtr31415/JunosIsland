/**
 * The takin — a goat-antelope built around a nose, and the only muzzle in this
 * project stretched UPWARDS.
 *
 * Nine bovids are already in the tree — Africa's buffalo, wildebeest and
 * antelope, Farm's ox, sheep and goat and water buffalo, Ice's musk ox and Dall
 * sheep — and every one of them separates on its HORNS. That ground is used up:
 * the ox and the wildebeest share one horn line verbatim, the water buffalo
 * chains three segments into a crescent, the buffalo and the musk ox each spend
 * theirs on the same missing curve. A tenth animal arguing about horn angles
 * would be a tenth animal nobody can tell apart.
 *
 * **A takin's face is the thing, and it is a convex arch — a Roman nose so
 * pronounced the animal looks like it is wearing a mask.** `tube-07` is the
 * giraffe's muzzle, the deepest nose in the bank at 0.266 through, and it is
 * worn by the bear, the wildebeest and the hippo. All three stretch it ACROSS or
 * ALONG. **This one stretches it 1.7x UP**, to 0.510 tall against its own 0.300,
 * so the muzzle rises off the face as an arch rather than reaching off it as a
 * snout. §3 measured the pack's own snouts varying 2.90x naturally, so 1.7 is
 * well inside what Kenney drew, and nothing else on the animal is stretched
 * except the horns' 1.25 of length.
 *
 * The rest is the honest supporting cast:
 *
 *   - **`box-12`, the widest shell at 1.539484.** A takin is a heavy, stocky,
 *     short-legged thing built like a small bison, and the widest shell is the
 *     only way that can be said since a hull is never scaled.
 *   - **The horns sweep BACK**, which no other horned animal here does.
 *     `{ y, 90 }` takes `wedge-13`'s `z +1` to `x +1`, `{ z, 20 }` lifts it, and
 *     `{ x, -40 }` then carries it backwards over the shoulder — facing
 *     (0.940, 0.262, -0.220). The ox and the wildebeest go out and up at 45; the
 *     buffalo goes out and up at 15; the musk ox goes out and DOWN at 35. This is
 *     the only one that goes out and BACK, which is a takin's, and it is a third
 *     spin rather than a different shape.
 *   - **The shaggy golden coat is PALETTE and nothing else**, which is
 *     `animal-sheep.ts`'s own ruling on fleece: the bank has none, and pretending
 *     otherwise costs geometry for a texture nobody would read at tablet
 *     distance.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s crown — the cube's own 1.43125, which nine of the ten hulls share. */
const CROWN_Y = 1.43125

/**
 * THE ROMAN NOSE. `tube-07` is 0.532 x 0.300 x 0.266; 1.7 on its own HEIGHT
 * takes it to 0.510 and the 0.9 on its reach keeps it from becoming a snout, so
 * the built muzzle is an arch standing off the face rather than a nose reaching
 * out of it. No other muzzle in the project is stretched on this axis.
 */
const MUZZLE_STRETCH: [number, number, number] = [1.1, 1.7, 0.9]

export const TAKIN_ASSEMBLY = defineCreature('animal-takin', {
  palette: {
    coat: 0xc99a4a,    // UNREVIEWED: the golden shaggy coat, which is this animal's whole read
    pale: 0xefe3c6,    // UNREVIEWED: the sclera, and the pale muzzle arch
    dark: 0x4a3b2a,    // UNREVIEWED: the dark face and legs a takin carries under the gold
    horn: 0x2e2823,    // UNREVIEWED: the short black horns
    mark: 0x1c1714,    // UNREVIEWED: the nose pad
    limb: 0x6b5330,    // UNREVIEWED: the short legs, well under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE WIDEST SHELL IN THE BANK. A takin is built like a small bison and the
   * hull is never scaled, so this is the whole of "stocky". */
  hull: { part: 'box-12' },
  /* No belly line: a takin is one colour underneath and the two-tone it does
   * carry runs front-to-back, which Paint.patch has no term for. */
  under: 'pale',

  /* Short and planted. A takin's legs are famously stumpy for its bulk. */
  legs: { x: 0.36, z: 0.28 },

  eyes: { part: 'plate-01', y: 1.02 },

  /* The dog's and pig's ear, small and lost in the coat — hand-placed on the
   * crown, because cone-02's own recorded z of 0.475851 is off the front of a
   * 1.250 crown's flat plate (animal-buffalo.ts made the same move). */
  ears: { part: 'cone-02', paint: 'coat', at: [0.30, CROWN_Y, 0.18] },

  /* THE ROMAN NOSE. See MUZZLE_STRETCH — the only muzzle in the project
   * stretched on its own HEIGHT. Donor transfer for the join. */
  snout: { part: 'tube-07', paint: 'pale', stretch: MUZZLE_STRETCH },

  /* The deer's nose-tip on the arch's own placed front plane. */
  nose: { part: 'box-14', paint: 'mark' },

  /* The bank's only stub, turned to hang off the rear plate. A takin's tail is
   * short and buried in the coat. */
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, 0.80625, -0.625] },

  extras: [
    /* THE BACKSWEPT HORNS. Three spins, and the third is the one no other horned
     * animal in the project uses — see the header for the four angles this is
     * measured against. */
    {
      name: 'horn',
      part: 'wedge-13',
      paint: 'horn',
      kind: 'pair',
      stretch: [1, 1, 1.25],
      spin: [{ axis: 'y', deg: 90 }, { axis: 'z', deg: 20 }, { axis: 'x', deg: -40 }],
      at: [0.42, 1.40, 0.18],
    },
  ],

  flag: 'THE MUZZLE IS STRETCHED 1.7x UPWARDS AND THAT IS THE ANIMAL. Nine bovids are already '
    + 'built and every one of them separates on its HORNS — the ox and the wildebeest share a '
    + 'horn line verbatim, the water buffalo chains three segments, the buffalo and the musk ox '
    + 'both spend theirs on the same missing curve. A tenth arguing about horn angles would be a '
    + 'tenth nobody can tell apart, so this one is built around its FACE: a takin has a Roman '
    + 'nose so convex the animal looks masked. tube-07 is the deepest nose in the bank and the '
    + 'bear, the wildebeest and the hippo all stretch it ACROSS or ALONG; this is the only '
    + 'muzzle in the project stretched on its own HEIGHT, 0.300 to 0.510, so it rises off the '
    + 'face as an arch instead of reaching off it as a snout. §3 measured the pack\'s snouts '
    + 'varying 2.90x naturally so 1.7 is inside what Kenney drew. IF IT READS AS A SWOLLEN NOSE '
    + 'RATHER THAN AS AN ARCH, the number is the one to move and everything else on the animal '
    + 'survives it. THE HORNS SWEEP BACK, which nothing else here does: { y, 90 } then { z, 20 } '
    + 'then { x, -40 } gives a facing of (0.940, 0.262, -0.220) — out, up a little, and over the '
    + 'shoulder — against the ox and wildebeest at out-and-up-45, the buffalo at 15 and the musk '
    + 'ox at out-and-DOWN-35. A third spin rather than a different shape, which is what the '
    + 'bank leaves available. THE SHAGGY GOLDEN COAT IS PALETTE AND NOTHING ELSE, which is '
    + 'animal-sheep.ts\'s ruling on fleece and holds here. NEW PALETTE, UNREVIEWED.',
})
