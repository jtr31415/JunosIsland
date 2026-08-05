/**
 * The gorilla — the biggest shell in the pack, and the silver back is the
 * skunk's inverted belly line.
 *
 * Three primates now share this project and every one of them is separated on a
 * different axis: the FROZEN `animal-monkey` is Kenney's own, `animal-baboon`
 * takes the monkey's shell with a long dog-like muzzle and an arched tail, and
 * this one takes `box-41` — the only hull bigger on all three axes — and has NO
 * TAIL AT ALL, which is a fact about gorillas and not a saving.
 *
 * **THE SILVERBACK IS `animal-skunk.ts`'s TRICK.** `Paint.patch` paints the
 * slot named by `under` BELOW its line, so naming the silver as `coat` and the
 * black as `under` at 12/16 puts silver on the top quarter of the body and black
 * everywhere under it. It costs no geometry and it is the one marking a gorilla
 * has.
 *
 * **The sagittal crest is one `wedge-06`** — the cat's ear, which
 * `animal-crocodile.ts` measured as the tallest keeled plate the bank can stand
 * on a back (0.154466 proud at its own burial). One, on the crown, unspun.
 *
 * The muzzle is `blade-04`, the lion's radial nose-tip, on `box-41`'s own muzzle
 * boss at z = 0.725 — the boss is geometry this shell already has and a gorilla
 * is the animal that wants it.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s FLAT crown, which is `box-03`'s at the same world height (the goose's §5). */
const CROWN_Y = 1.43125
/** The bounding front — the tiger's muzzle boss, standing 0.100 proud of the flat plate. */
const BOSS_Z = 0.725

export const GORILLA_ASSEMBLY = defineCreature('animal-gorilla', {
  palette: {
    coat: 0x8a857e,    // UNREVIEWED: the SILVER — this is the back, not the body
    dark: 0x201e1d,    // UNREVIEWED: near-black — everything under the saddle
    sclera: 0xe6ddcf,  // UNREVIEWED: named because `under` is now the black
    limb: 0x1a1817,    // UNREVIEWED: the arms and legs, darker still
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-41' },

  /* THE INVERSION. `under` is the BLACK here and `coat` is the silver, so the
   * pale slot is the back rather than the belly — `animal-skunk.ts`'s finding,
   * spent on the only other animal in the project that wears it that way up. */
  under: 'dark',
  belly: 0.75,

  /* `under` is the black, so the sclera has to be named or the pupil reads as a
   * catch-light and the eye inverts — `animal-ferret.ts` measured that. */
  eyes: { paint: 'sclera' },

  /* Set WIDE and SHORT: a gorilla stands on its knuckles and the wheelbase is
   * the only way this kit can say a heavy front end. */
  legs: { x: 0.34, z: 0.30 },

  /* Small, dark and close to the head, pinned to `box-41`'s FLAT crown at
   * 1.43125 rather than to its bounding 1.48125 — the goose's §5 warning: that
   * extra 0.05 is two transverse ridges and joining to it floats a part. */
  ears: { part: 'wedge-04', paint: 'dark', at: [0.2, CROWN_Y, 0.25] },

  extras: [
    /* THE SAGITTAL CREST — one cat's ear, unspun, on the flat crown. Its
     * attachment is `y +1`, which animal-crocodile.ts names as the only
     * condition under which a donor's burial transfers to a mount like this. */
    {
      name: 'crest',
      part: 'wedge-06',
      paint: 'dark',
      at: [0, CROWN_Y, 0.0625] as [number, number, number],
    },

    /* THE MUZZLE. The lion's nose-tip is the bank's one RADIAL nose (0.400 x
     * 0.400) and it sits on the muzzle boss this shell already carries, so a
     * gorilla's flat broad muzzle costs 28 triangles and no derivation.
     *
     * y = 0.70 is solved, not picked: the boss runs y 0.494 to 0.894 (the goose
     * measured it) and this card is 0.400 tall, so 0.694 is the only height at
     * which the whole of it stands on the boss and none of it hangs in the air
     * over the face 0.100 behind. 0.70 is that, on the pack's own grid. */
    {
      name: 'muzzle',
      part: 'blade-04',
      paint: 'dark',
      at: [0, 0.7, BOSS_Z] as [number, number, number],
    },
  ],

  flag: 'THE SILVER BACK IS THE BELLY LINE RUN BACKWARDS — animal-skunk.ts\'s trick, and '
    + 'this is the second animal in the project to want it. `coat` is the silver and `under` '
    + 'is the black at 12/16, so the top quarter of the body is silver and everything below '
    + 'it is not. It costs no geometry and the proportion is one number. THERE IS NO TAIL, '
    + 'and that is the separation from animal-baboon and the frozen animal-monkey rather than '
    + 'an omission. WHAT IS MISSING IS THE ARMS: a gorilla\'s reach is the thing a child '
    + 'draws, and the leg row is four copies of one shape at one height, so the front pair '
    + 'cannot be longer than the back. The wheelbase is set wide to say a heavy front end and '
    + 'that is as far as the mechanism goes. NEW PALETTE, UNREVIEWED.',
})
