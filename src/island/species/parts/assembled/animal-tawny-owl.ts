/**
 * The tawny owl — the round brown one, and the third owl this project has to
 * hold apart from two others.
 *
 * There are five owls in the game now: `animal-owlet` (Birds, brown, tufted,
 * amber), `animal-snowy-owl` (Ice, white, untufted, chrome yellow, barred), and
 * this collection's three. So the separation is written here as a table rather
 * than as an adjective:
 *
 *       barn owl    box-39   white + golden   panel disc, WHITE   h 1.4312
 *       tawny owl   box-33   warm brown       panel disc, TAWNY   h 1.4312
 *       eagle owl   box-21   orange-brown     tufts + bars        h 1.9617
 *       owlet       box-39   brown            tufts, no disc      h 1.4312
 *       snowy owl   box-33   white            bars, no disc       h 1.4312
 *
 * This bird's own claim is the SUBTLE disc: `plate-11` spun forward exactly as
 * the barn owl wears it, but painted a mid-tawny only two steps off the coat
 * rather than white — a tawny owl's disc is a shading, not a mask. Untufted, on
 * purpose: `animal-owlet.ts`'s header says the tufts are what stop it being "a
 * round brown bird with big eyes", and a tawny owl IS a round brown bird with
 * big eyes. The wing is sunk 0.35, so this is the narrowest owl here.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.16155
const FACE_Z = 0.63
const REAR: [number, number, number] = [0, 0.80625, -0.625]

export const TAWNY_OWL_ASSEMBLY = defineCreature('animal-tawny-owl', {
  palette: {
    coat: 0x7a5b3a,    // UNREVIEWED: warm tawny brown
    belly: 0xd9c8ac,   // UNREVIEWED: streaked buff below
    disc: 0xb99a70,    // UNREVIEWED: the disc, two steps off the coat — a shading, not a mask
    limb: 0xc9b492,    // UNREVIEWED: feathered legs
    bill: 0xcbb98e,    // UNREVIEWED: horn
    hook: 0x8a7a56,    // UNREVIEWED: the tip
    eye: 0x2a2622,     // UNREVIEWED: black — a tawny owl's eye, unlike every other owl here
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The monkey's cube: no marking band at all, which suits the plainest owl. */
  hull: { part: 'box-33' },
  belly: 0.5,

  eyes: { part: 'plate-14', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y' as const, deg: 180 }], at: REAR },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'blade-02', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 70 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    /* Sunk 0.35 — 1.9949 across, the narrowest of the three owls. */
    { name: 'wing', part: 'wedge-19', paint: 'coat', kind: 'pair' as const, sink: 0.35 },
    { name: 'disc', part: 'plate-11', paint: 'disc', kind: 'pair' as const, at: [0.21, 0.93, FACE_Z], spin: [{ axis: 'y' as const, deg: -90 }] },
  ],

  flag: 'FIVE OWLS EXIST IN THIS GAME NOW AND THIS ONE IS THE PLAINEST, deliberately. '
    + 'animal-owlet (Birds, brown, tufted, amber), animal-snowy-owl (Ice, white, barred, chrome '
    + 'yellow), and Raptors\' three: the barn owl (box-39, white and golden, a WHITE disc), this '
    + 'one (box-33, warm brown, a TAWNY disc two steps off its own coat) and the eagle owl '
    + '(box-21, 1.9617 tall against these two at 1.4312, tufted, orange-eyed). UNTUFTED ON '
    + 'PURPOSE: animal-owlet.ts argues its tufts are what stop it being "a round brown bird with '
    + 'big eyes", and a tawny owl is exactly a round brown bird with big eyes, so it gets the '
    + 'disc instead. THE DISC IS animal-barn-owl.ts\'s FIND, in a colour that barely reads — '
    + 'that is the design, and if it is too subtle the dial is the `disc` slot alone. '
    + 'NEW PALETTE, UNREVIEWED.',
})
