/**
 * The hummingbird — a needle for a bill, and a gorget that costs no geometry.
 *
 * **Read `animal-robin.ts` first**; the passerine idiom is settled there and this
 * bird takes all of it — `box-39` for the shell, two `box-01` at the pack's own
 * leg row, `plate-08` for the round eye, `wedge-19` for the wing. Two things are
 * this animal's own:
 *
 *   - **THE BILL IS `cone-06` AT 0.35 ACROSS AND 3.0 ALONG.** The parrot's beak
 *     is one of only two records in the whole bank with taper 0 — a true point —
 *     and cut this thin it is 0.140 square standing 0.550 clear of the face. Rule
 *     1 sanctions a stretch on a snout by name and §3 measured the pack's own
 *     varying 2.90x, so this is inside what Kenney drew. Nothing else in the
 *     project is narrower than 0.24 at the face.
 *   - **THE GORGET IS BAND 3, PAINTED.** `box-39` arrives pre-split at Kenney's
 *     own cut — the penguin's white front — so a ruby throat is one `byBand`
 *     entry and no geometry at all (§4's first way). `animal-wren.ts` leaves that
 *     band deliberately unspent; this is the bird it was waiting for.
 *
 * **A HUMMINGBIRD CANNOT BE SMALL**, and `animal-wren.ts` did that arithmetic:
 * `HEIGHT_FLOOR` is 1.43125, a bare hull on the pack's own leg row, and a hull is
 * never scaled. So the smallest bird there is stands the height of a swan, and
 * the smallness has to be spent on shape — which is why the tail below is cut to
 * half and nothing else sticks out anywhere.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** 0.35 across, 3.0 along: a 0.140-square needle with 0.550 of reach. */
const BILL_STRETCH: [number, number, number] = [0.35, 0.35, 3.0]

export const HUMMINGBIRD_ASSEMBLY = defineCreature('animal-hummingbird', {
  palette: {
    coat: 0x2f8f5e,    // UNREVIEWED: the iridescent green back
    belly: 0xe3e8d8,   // UNREVIEWED: the pale underside, and the sclera
    gorget: 0xb4243c,  // UNREVIEWED: the ruby throat — Kenney's band 3
    flight: 0x28453a,  // UNREVIEWED: the wings and the tail
    bill: 0x231d18,    // UNREVIEWED: the black needle
    eye: 0x161210,     // UNREVIEWED: a small dark eye
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE PENGUIN'S SHELL, and band 3 is the whole gorget. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'gorget' } } },

  /* The tiger's mammal line made exact, and this hull's own equator. */
  belly: 0.5,

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE NEEDLE. See BILL_STRETCH. */
  snout: { part: 'cone-06', paint: 'bill', stretch: BILL_STRETCH },

  /* The parrot's fan cut to about half, and hung at 0.9 rather than at the
   * parrot's own high 1.0998 — a hummingbird's tail leaves the body low and
   * short, and every part of the smallness has to be spent on shape. */
  tail: {
    part: 'box-38',
    paint: 'flight',
    stretch: [0.55, 0.45, 0.6],
    at: [0, 0.9, -0.625],
  },

  legs: false,
  extras: [
    /* Two legs, not four. The pack's own leg at its own row and burial. */
    {
      name: 'leg-front',
      part: LEG_ROW.part,
      paint: 'flight',
      kind: 'pair' as const,
      sink: LEG_ROW.sink,
      at: [0.2, LEG_ROW.y, 0] as [number, number, number],
    },

    /* The chick's and the parrot's wing, at its own donor transfer. It FLAPS
     * without a `motion` line: `withDefaultFlap` triggers on the part's own
     * `wing` role, which is the whole of your 4 August instruction. */
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' as const },
  ],

  flag: 'THE HOVER IS NOT THERE AND IT IS THE ANIMAL. The wing flaps — that is automatic '
    + 'from the part\'s own `wing` role, your 4 August instruction — but a hummingbird\'s '
    + 'wing beats fifty times a second in a figure of eight, and `motion.ts` gives a flap one '
    + 'amplitude and one period about one axis. Nothing here can say a blur. It also cannot '
    + 'HANG IN THE AIR: moves.ts says `air`, which hovers it at TREE_HEIGHT, and that is the '
    + 'nearest the game has. A HUMMINGBIRD CANNOT BE SMALL EITHER: HEIGHT_FLOOR is 1.43125, a '
    + 'bare hull on the pack\'s own leg row, and a hull is never scaled — animal-wren.ts did '
    + 'this arithmetic first — so the smallest bird there is stands the height of a swan and '
    + 'the smallness is spent on the bill and the cut-down tail instead. THE IRIDESCENCE IS A '
    + 'FLAT COLOUR: one swatch per slot, no view-dependent anything. NEW PALETTE, UNREVIEWED.',
})
