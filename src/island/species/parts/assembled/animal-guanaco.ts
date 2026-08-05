/**
 * The guanaco — the wild camelid, and the separation from the two farm ones is a
 * LINE the pack can draw exactly.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * `animal-llama.ts` built the neck this animal stands on and its arithmetic is
 * not re-derived: `box-18`, the elephant's TRUNK, stood on end with `axis: 'y'`
 * overriding its recorded `z +1`, leaned 30 degrees, sunk 5/16, slimmed to 0.8
 * across so the crown's 0.625 square can carry three roots. Read that file for
 * the derivation; `box-33` is the 1.250 cube at the standard offset, so every
 * one of its numbers transfers unchanged.
 *
 * **What is new here is the two-tone, and it is what a guanaco IS.** The llama
 * is parti-coloured, the alpaca is one flat cream, and NEITHER carries a belly
 * line — `animal-llama.ts` says so in as many words. A guanaco is fawn above and
 * sharply white below, with a GREY head on a fawn neck, and both of those
 * boundaries are sayable: the flank line is `belly` at 8/16, the tiger's own
 * mammal line made exact, and the head is a slot of its own on `tube-06`.
 *
 * The ears are the tiger's small pricked pair rather than the llama's banana —
 * a guanaco's are short, and the llama's whole argument is that its are not.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The flat crown, and `HEIGHT_FLOOR`. `box-33` is the cube at the cube's offset. */
const HULL_CROWN_Y = 1.43125
/** How far the flat crown reaches in x and z before the chamfers start. */
const CROWN_FLAT_HALF = 0.3125
const REAR_PLATE_Z = -0.625
const REAR_PLATE_Y = 0.80625

/** `animal-llama.ts`'s four neck numbers, unchanged. Its §2 is the derivation. */
const NECK_LEAN = 30
const NECK_SINK = 0.3125
const NECK_Z = 0.1875

export const GUANACO_ASSEMBLY = defineCreature('animal-guanaco', {
  palette: {
    coat: 0xb98a55,    // UNREVIEWED: warm fawn — the HULL only, so the belly line is its own
    belly: 0xf6f1e6,   // UNREVIEWED: the hard white underside, and the sclera
    /* The coat's own fawn under a second name. `animal-stoat.ts`'s fault: a
     * `patch` is a property of the SLOT, so the neck and the tail would read the
     * belly split if they said `coat`. */
    fur: 0xb98a55,     // UNREVIEWED: the same fawn — the neck and the tail
    face: 0x8b8279,    // UNREVIEWED: the grey head and ears, which no other camelid has
    limb: 0xa87c4b,    // UNREVIEWED: the legs, a shade under the coat
    mark: 0x3b3128,    // UNREVIEWED: the nose
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The monkey's cube — 114 triangles, and no camelid is on it: the llama has
   * `box-03` and the alpaca `box-41`. */
  hull: { part: 'box-33' },
  /* 8/16 — the tiger's own mammal line, and this cube's own equator. It is the
   * whole separation from the other two camelids, neither of which has one. */
  belly: 0.5,

  /* At the neck's ROOT, exactly as `animal-terrapin.ts`, `animal-goose.ts` and
   * `animal-llama.ts` ship it: `EYE_CARD_Z` is 0.635, `CreatureDef.eyes` has no
   * z, and this animal's head is 0.87 above the eye plane. Flagged, not fixed. */
  eyes: { part: 'plate-01', paint: 'belly' },

  /* THE NECK. `animal-llama.ts`'s, character for character. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'fur',
    axis: 'y',
    dir: 1,
    stretch: [0.8, 1, 0.85],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, HULL_CROWN_Y, NECK_Z],
  },

  /* THE HEAD: the fox's muzzle on the neck's tip by pure donor transfer, painted
   * GREY. That colour is the field mark — a guanaco's head is grey where the
   * rest of it is fawn, and the llama and the alpaca have no such boundary. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'face' },

  /* THE TIGER'S PRICKED EAR, small and upright, on the CROWN flanking the neck's
   * root — `animal-llama.ts` proved no long-necked animal in this pack can carry
   * an erect ear on its head, so the palette is what ties these to the face. */
  ears: {
    part: 'wedge-16',
    paint: 'face',
    sink: 0.3125,
    at: [CROWN_FLAT_HALF, HULL_CROWN_Y, 0.0625],
  },

  /* The trunk again, turned around, on the flat rear plate's own centre. */
  tail: {
    part: 'box-18',
    paint: 'fur',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, REAR_PLATE_Y, REAR_PLATE_Z],
  },

  extras: [
    /* The deer's nose-tip on the head's own front, by pure transfer. */
    { name: 'muzzle', part: 'box-14', paint: 'mark', on: 'head' },
  ],

  motion: [{ kind: 'twitch', parts: ['ear'] }],

  flag: 'THE EYE CANNOT BE ON THE HEAD, which is animal-goose.ts\'s and animal-llama.ts\'s '
    + 'standing note rather than a new one: EYE_CARD_Z is 0.635, CreatureDef.eyes has no z '
    + 'field (rule 5 made unsayable), and this animal\'s head is about 0.87 above the eye '
    + 'plane, so the cards sit on the body\'s front plate at the neck\'s root. Not fixed here; '
    + 'it is your call and it is the same call on four animals. AGAINST animal-llama AND '
    + 'animal-alpaca the separations are three and all three are structural: the BELLY LINE at '
    + '8/16, which neither of those two has at all; the GREY HEAD, a slot of its own on '
    + 'tube-06 against a llama\'s cream and an alpaca\'s edge-to-edge fleece; and the SHORT '
    + 'PRICKED EAR (wedge-16, the tiger\'s) against the llama\'s tube-04 banana, which is that '
    + 'animal\'s own headline feature. The shell is box-33, the monkey\'s cube, which no '
    + 'camelid was on. THE NECK IS NOT RE-DERIVED — every number is animal-llama.ts\'s, and '
    + 'box-33 is the 1.250 cube at the standard offset so they transfer exactly. NEW PALETTE, '
    + 'UNREVIEWED.',
})
