/**
 * The snow petrel — a bird that is entirely white, which is a harder problem
 * than it sounds and is solved with the SMALLEST eye card in the bank.
 *
 * A snow petrel has no markings of any kind: white plumage, a short black bill,
 * a black eye and nothing else, which is exactly why it is one of the most
 * recognisable birds in the world. So the whole design is what is left when
 * everything is taken away, and the one part choice that carries it is the eye.
 *
 * **`plate-06` is 0.330 x 0.276 — the smallest eye card the pack drew**, against
 * `plate-01`'s 0.400 x 0.320 and `plate-08`'s 0.400 round. Rule 5 makes eye size
 * a part choice and nothing else (a card is never scaled), so a small dark bead
 * on a white face is available exactly once in the bank and this is the bird
 * that should spend it. Painted solid to the rim, it is the only mark above the
 * bill.
 *
 * Against `animal-seagull`, which is built: that bird is `box-41`, the biggest
 * shell, with a grey mantle painted into band 15 and `plate-08`'s round yellow
 * eye. This is the plain 1.250 cube, no mantle, no second colour anywhere, and
 * the bank's smallest eye. Against `animal-puffin`: no bill colour at all, which
 * is that animal's entire identity.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

export const SNOW_PETREL_ASSEMBLY = defineCreature('animal-snow-petrel', {
  palette: {
    coat: 0xfbfcfd,    // UNREVIEWED: white, and it has to stay a hair off paper
    flight: 0xf0f3f6,  // UNREVIEWED: the wing, just dark enough to read against the body
    bill: 0x1a1a1c,    // UNREVIEWED: the short black bill
    limb: 0x2f3236,    // UNREVIEWED: the feet, which are the bird's only other dark
    pale: 0xffffff,    // UNREVIEWED: the sclera, whiter than the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  under: 'pale',

  /* THE SMALLEST CARD IN THE BANK, painted solid — see the header. */
  eyes: { part: 'plate-06', paint: 'bill' },

  /* Short. The established bird bill, and a petrel's is stubby rather than
   * long, so it is taken at its own donor transfer and left alone. */
  snout: { part: 'tube-02', paint: 'bill' },

  /* A FAN, not the stub. Every galliform and cage bird in the project wears
   * `box-18` — the elephant's trunk worn backwards — as a short square tail,
   * and a snow petrel's is a wedge it spreads. `box-38` is the parrot's fan and
   * it is a real tail rather than a repurposed trunk; the donor transfer joins
   * it at this cube's rear face and recovers the parrot's own recorded
   * z = -0.772857, exactly as it does on `animal-wolf`. */
  tail: { part: 'box-38', paint: 'flight' },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* The chick's and the parrot's real wing. It carries the `wing` role, so
     * the wingbeat attaches with nothing declared — and a snow petrel is a bird
     * that is almost never seen on the ground. */
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' },

    /* THE TUBENOSE, and it is the family's own name. Every petrel carries a
     * pair of horny tubes along the top of its bill; `tube-08`, the panda's
     * nose-tip, is the smallest tube-form shape in the bank and is laid along
     * the bill's own upper line rather than stood on its end. Nothing else in
     * the project wears it this way, and it is the one anatomical feature an
     * otherwise unmarked white bird has. */
    { name: 'tubenose', part: 'tube-08', paint: 'bill', stretch: [0.8, 0.8, 1.6], at: [0, 0.80, 0.66] },
  ],

  flag: 'THE WHOLE BIRD IS ONE PART CHOICE. A snow petrel has no markings at all — white '
    + 'plumage, a short black bill, a black eye — so everything here is subtraction and the '
    + 'one thing that carries it is plate-06, at 0.330 x 0.276 the SMALLEST eye card the pack '
    + 'drew, against plate-01\'s 0.400 x 0.320 and plate-08\'s 0.400 round. Rule 5 forbids '
    + 'scaling a card, so a small dark bead on a white face is available exactly once in the '
    + 'bank and this is the bird to spend it on. AGAINST animal-seagull, which is built: that '
    + 'one is box-41 with a grey mantle in band 15 and a round yellow plate-08; this is the '
    + 'plain cube with no mantle, no second colour and the smallest card. AGAINST '
    + 'animal-puffin: no bill colour, which is that bird\'s entire identity. THE RISK IS THAT '
    + 'IT READS AS A BLANK — the wing is deliberately a hair darker than the body so there is '
    + 'an edge to see, and if that is not enough it is the dial. IT COMES IN UNDER THE PACK\'S '
    + 'OWN VERTEX FLOOR at 347 against 405, and that is reported rather than padded: '
    + 'animal-quail.ts hit the same floor and fixed it by adding a real marking, and this bird '
    + 'has no marking to add. Every other lever — a bigger eye card, a comb, a barring card — '
    + 'would be a thing a snow petrel does not have, so the count is left honest. It is the '
    + 'lightest animal in the project because it is the plainest one. NEW PALETTE, UNREVIEWED.',
})
