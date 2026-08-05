/**
 * The hobby — the one falcon here that does NOT wear the falcon wing, and the
 * reason is anatomy rather than variety.
 *
 * A hobby is the falcon that looks like a giant swift: its wings are the longest
 * of the four relative to its body, so it takes `wedge-19` out from the flank at
 * pure donor transfer — 2.1960 across — where the peregrine, the kestrel and the
 * merlin all lay `blade-06` over the back at 1.2875. That single choice is what
 * stops four small grey falcons being one animal in four palettes, and it is
 * true of the bird.
 *
 * The tail goes the other way for the same reason: `box-18`, the bank's only
 * stub, turned 180, because a hobby's tail is short where a kestrel's is long.
 * Long wings and a short tail, which is the whole silhouette.
 *
 * The RUFOUS is in `limb` and not in a patch. A hobby's red thighs and vent are
 * the field mark, `Paint.patch` cuts at a height across the whole shell, and a
 * line low enough to catch the vent would paint the belly with it — so the
 * colour goes on the legs, where it is exact and where it costs nothing.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.16155
const FACE_Z = 0.63
const REAR: [number, number, number] = [0, 0.80625, -0.625]

export const HOBBY_ASSEMBLY = defineCreature('animal-hobby', {
  palette: {
    coat: 0x3e434e,    // UNREVIEWED: dark slate, nearly black, above
    belly: 0xefe7d8,   // UNREVIEWED: cream below
    /* The coat's own colour under a second name, and it exists because
     * `belly` splits the CELL of the slot the HULL is painted from — so a
     * part that also said `coat` was reading the wrong half of it. See
     * `animal-stoat.ts`'s header and the note in `collections/raptors.ts`. */
    flight: 0x3e434e,  // UNREVIEWED: wings and tail — the coat's slate, under its own name
    mark: 0x22262e,    // UNREVIEWED: the heavy moustache
    limb: 0xb8562e,    // UNREVIEWED: the RUFOUS thighs — see the header
    bill: 0x22262e,    // UNREVIEWED: dark
    hook: 0x101318,    // UNREVIEWED: the tip
    eye: 0x2f2a26,     // UNREVIEWED: near-black, the falcon eye
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The monkey's cube — a plain 1.250 shell nothing else in Raptors wears. */
  hull: { part: 'box-33' },
  belly: 0.5,

  eyes: { part: 'plate-08', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },
  tail: { part: 'box-18', paint: 'flight', spin: [{ axis: 'y' as const, deg: 180 }], at: REAR },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'blade-02', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 70 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    /* The long wing, OUT from the flank — the one falcon here that has it. */
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' as const },
    { name: 'moustache', part: 'plate-13', paint: 'mark', kind: 'pair' as const, at: [0.24, 0.64, FACE_Z] },
  ],

  flag: 'THIS IS THE ONE FALCON WITHOUT THE FALCON WING, on purpose. A hobby looks like a '
    + 'giant swift — its wings are the longest of the four relative to its body — so it wears '
    + 'wedge-19 out from the flank at 2.1960 across, where the peregrine, the kestrel and the '
    + 'merlin lay blade-06 over the back at 1.2875. With box-18\'s stub tail that gives long '
    + 'wings and a short tail, which is the whole silhouette, and it is what stops four small '
    + 'grey falcons being one animal in four palettes. THE RUFOUS IS ON THE LEGS AND NOT IN A '
    + 'PATCH: a hobby\'s red thighs and vent are its field mark, Paint.patch cuts at a HEIGHT '
    + 'across the whole shell, and any line low enough to catch the vent paints the belly with '
    + 'it — so the colour goes where it is exact. NEW PALETTE, UNREVIEWED.',
})
