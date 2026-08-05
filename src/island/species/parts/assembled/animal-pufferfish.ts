/**
 * The pufferfish — the easiest animal in Ocean, and it is easy for a reason
 * nobody planned: a ball covered in short spikes is the HEDGEHOG, and §8's
 * repeat-and-sink idiom was built for exactly this silhouette.
 *
 * So it is `cone-01` — the bee's and the caterpillar's antenna, the hedgehog's
 * own spine — on the top row, both upper chamfers and both flanks, which is the
 * five-facing set §8 says makes a cubic body read as ROUND. A puffed fish is the
 * roundest thing in the collection and the idiom's whole purpose is a curve out
 * of a cube.
 *
 * Everything else is the pack's fish: `box-20`'s hull, `plate-08`'s big round
 * eye at its own recorded height, `plate-03`'s small mouth, and `box-43`'s fin.
 * The tail is `wedge-03`, the beaver's paddle, which is broad and short where a
 * shark's is long — a puffed fish's tail is a stub behind a balloon.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const PUFFERFISH_ASSEMBLY = defineCreature('animal-pufferfish', {
  palette: {
    coat: 0xd9a441,
    belly: 0xf6e7c4,
    spine: 0x7a5a2a,
    fin: 0xe0b768,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-20',
  belly: 0.375,
  legs: false,
  eyes: { part: 'plate-08', y: 0.9875 },

  /* The beaver's paddle: broad and short, which is a puffed fish's stub tail. */
  tail: { part: 'wedge-03', paint: 'fin' },

  /* Five facings — top, both chamfers, both flanks — §8's curve out of a cube. */
  ridge: {
    part: 'cone-01',
    paint: 'spine',
    name: 'spike',
    count: 3,
    rows: ['top', 'chamfer', 'side'],
    span: 0.375,
  },

  extras: [
    { name: 'pectoral', part: 'box-43', paint: 'fin', kind: 'pair', sink: 0.4, at: [0.625, 0.5625, 0.25] },
    { name: 'mouth', part: 'plate-03', paint: 'spine', at: [0, 0.6875, 0.635] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first pufferfish ever built and the first '
    + 'colours ever proposed for it. It is the HEDGEHOG\'S own mechanism turned onto a '
    + 'fish: fifteen cone-01 spines on five facings, which is §8\'s idiom for making a '
    + 'cube read round. The question for you is the SPINE COUNT — a hedgehog wears '
    + 'twenty and this wears fifteen, and a real pufferfish is denser than either. More '
    + 'spikes is one number in the ridge block, and the only cost is triangles.',
})
