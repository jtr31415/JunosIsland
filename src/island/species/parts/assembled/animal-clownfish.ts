/**
 * The clownfish — three white bars on orange, and the bars are the animal.
 *
 * Everything else here is the goldfish's solved fish: `box-20`'s hull, the round
 * `plate-08` eye at the fish's own recorded height, `plate-03`'s mouth, the
 * pack's own `box-43` fin. What this species has to add is a BAND that wraps —
 * a clownfish's bar runs over the back and down both flanks, and a flank card
 * cannot do that because it is flat and one-sided.
 *
 * So the bars are `box-19`, the fish's own shell-ring, worn at its DONOR
 * ORIENTATION — upright and concentric, which is how Kenney's fish wears it —
 * and thinned to a fifth of its depth. At its own 0.520 a single ring is 1.025
 * against the hull's 1.953 and rule 3 refuses it as a second mass; at 0.104 it
 * is 0.205, and three of them still leave the hull three times the biggest.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The ring, thinned so three of them stay clear of rule 3's margin. */
const BAR = {
  part: 'box-19',
  paint: 'bar' as const,
  stretch: [1, 1, 0.2] as const,
  sink: 0.5,
}

export const CLOWNFISH_ASSEMBLY = defineCreature('animal-clownfish', {
  palette: {
    coat: 0xe8701c,
    belly: 0xf6b26b,
    bar: 0xfbf6ee,
    fin: 0x2b2118,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-20',
  belly: 0.375,
  legs: false,
  eyes: { part: 'plate-08', y: 0.9875 },

  /* The beaver's paddle: broad and rounded, which is a clownfish's tail. */
  tail: { part: 'wedge-03', paint: 'fin', sink: 0.25 },

  extras: [
    { ...BAR, name: 'bar-head', at: [0, 0.80625, 0.375] },
    { ...BAR, name: 'bar-mid', at: [0, 0.80625, 0] },
    { ...BAR, name: 'bar-tail', at: [0, 0.80625, -0.375] },
    { name: 'pectoral', part: 'box-43', paint: 'fin', kind: 'pair', sink: 0.4, at: [0.625, 0.5625, 0.25] },
    { name: 'mouth', part: 'plate-03', paint: 'fin', at: [0, 0.6875, 0.635] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first clownfish ever built and the first colours '
    + 'ever proposed for it. THE THREE WHITE BARS ARE box-19, THE PACK\'S OWN FISH RING, '
    + 'thinned to a fifth and worn three times — the first species in this project to '
    + 'wear one shape three times as a MARKING rather than as anatomy. The thinning is '
    + 'forced: at its own depth one ring is a second mass and rule 3 refuses it. Look '
    + 'at whether three rings read as painted bars or as three hoops stuck on the fish; '
    + 'if they read as hoops, the honest alternative is to paint the bars into the '
    + 'texture instead, which costs no geometry but cannot wrap a chamfer as cleanly.',
})
