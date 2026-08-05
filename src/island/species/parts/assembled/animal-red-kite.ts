/**
 * The red kite — the one raptor here a child can name from behind, because the
 * FORK is real geometry and nothing else in the project has one.
 *
 * **A FORKED TAIL IS A `pair` TAIL, and `PartDef.kind` already allowed it.**
 * Every tail in this repo is `kind: 'single'` because that is the default and
 * because nothing had wanted two. `wedge-18` — the tiger's, 0.200 x 1.0466 x
 * 0.5552, the longest thin blade in the bank — is spun twice: `{x, 90}` lays its
 * 1.0466 long axis along z so it TRAILS instead of standing, and `{y, -14}`
 * splays it outward. Mirrored, the two copies run from x -0.082..0.325 and
 * -0.325..0.082 over z -1.145 to -0.105: they touch at the base and their tips
 * finish 0.650 apart. That is a fork, measured, and it is the whole animal.
 *
 * It is not free. Two copies of a 212-triangle shape put this bird at 900
 * against the pack's measured ceiling of 951 — the highest count in Raptors, and
 * the reason the kite wears the FINE hook (`blade-02`, 28 triangles) rather than
 * the eagles' deep one (`box-24`, 44). If a hand edit adds anything here, the
 * cheapest thing to give back is the second tail blade, and giving it back is
 * giving back the bird.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
/** Half `wedge-13`'s own 0.3231 height, so the talon's underside is the ground. */
const TALON_Y = 0.16155
/** The fork's join: half a blade's width off the midline, low on the rear face. */
const FORK_AT: [number, number, number] = [0.12, 0.6, -0.625]

export const RED_KITE_ASSEMBLY = defineCreature('animal-red-kite', {
  palette: {
    coat: 0x9a4a2c,    // UNREVIEWED: the rufous back and the forked tail
    belly: 0xd8cdbd,   // UNREVIEWED: the pale grey head and underside
    /* The coat's own colour under a second name, and it exists because
     * `belly` splits the CELL of the slot the HULL is painted from — so a
     * part that also said `coat` was reading the wrong half of it. See
     * `animal-stoat.ts`'s header and the note in `collections/raptors.ts`. */
    fan: 0x9a4a2c,     // UNREVIEWED: the forked tail — the coat's rufous, under its own name
    flight: 0x53341f,  // UNREVIEWED: darker wings
    limb: 0xe0b83c,    // UNREVIEWED: yellow foot
    bill: 0xd8c48a,    // UNREVIEWED: horn base
    hook: 0x241f1a,    // UNREVIEWED: the down-turned tip
    eye: 0xc0a24a,     // UNREVIEWED: pale amber
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  belly: 0.5,

  eyes: { part: 'plate-08', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },

  /* THE FORK. Two spins and a pair — see the header for the measured tips. */
  tail: {
    part: 'wedge-18',
    paint: 'fan',
    kind: 'pair' as const,
    spin: [{ axis: 'x' as const, deg: 90 }, { axis: 'y' as const, deg: -14 }],
    at: FORK_AT,
  },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    /* The FINE hook, for triangles as much as for anatomy — see the header. */
    { name: 'hook', part: 'blade-02', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 70 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' as const },
  ],

  flag: 'THE FORK IS A `pair` TAIL AND IT IS THE FIRST ONE IN THE PROJECT. wedge-18, the '
    + 'tiger\'s tail and the longest thin blade in the bank, spun {x,90} so its 1.0466 long '
    + 'axis TRAILS instead of standing up, then {y,-14} to splay it, then mirrored. The two '
    + 'copies touch at the base and their tips finish 0.650 apart over z -1.145 to -0.105. THE '
    + 'DIAL IS THE SPLAY: 14 degrees is a kite, 6 is a notch, 25 is a swallow. THIS IS THE '
    + 'MOST EXPENSIVE BIRD IN RAPTORS at 900 triangles against the pack\'s measured 951, '
    + 'because 212 of them are spent twice. It wears the fine blade-02 hook rather than the '
    + 'eagles\' box-24 for that reason and not for a reason about kites, so if you add anything '
    + 'to this bird, the budget has 51 triangles in it. NEW PALETTE, UNREVIEWED.',
})
