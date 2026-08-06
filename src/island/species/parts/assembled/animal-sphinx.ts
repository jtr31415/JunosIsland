/**
 * PLACEHOLDER. A sphinx is a lion's body with a HUMAN FACE on it, and there is
 * no human anything in this pack. What is below is the nearest honest
 * approximation — the lion body, and the Great Sphinx's nemes headdress built
 * out of JT-041's sanctioned square — with the face left as a blank the
 * headdress frames. Joe finishes this one by hand or rules that it stays.
 *
 * **WHAT IS MISSING, AND THE MEASUREMENT.** Kenney drew twenty-four animals and
 * no people. Of the bank's 100 records the `nose` role holds **28 distinct
 * shapes** and every single one is an animal's muzzle, beak, nose-tip or
 * nostril card; there is no forehead, no brow, no chin, no cheek, no hair and no
 * human ear anywhere in the 100. That is not a gap a placement can close.
 *
 * **AND IT IS THE ONE PLACE §3.1 EXPLICITLY STOPS PAYING.** §3.2 of
 * `docs/building-animals-from-parts.md`: *"some shapes carry a read that
 * survives being moved. A tongue, a beak, a horn, a claw, an eye. Repurposing
 * those is where §3.1 stops paying and starts costing, and no measured axis will
 * ever catch it, because the confusion is semantic and the axes are geometric."*
 * A FACE is the strongest member of that list. Any animal muzzle put on this
 * animal makes it a lion; leaving the front blank at least makes it a lion
 * wearing something.
 *
 * **WHAT STANDS IN.** The headdress, and it does the whole job:
 *
 *   - **The nemes** — one `bespoke-square-01` across the flat crown, 0.688 wide
 *     and 0.175 thick, painted gold. JT-041 sanctioned the square by name for
 *     everybody, permanently, so it carries no rule 1 flag.
 *   - **The two lappets** — the same shape again, a mirrored pair on the flanks
 *     at the front of the head, joined `axis: 'x'` so the solve moves them
 *     outward while the prism itself stays upright. That is the striped cloth
 *     that hangs beside a pharaoh's face, and it is the single most recognisable
 *     thing about the Great Sphinx after the lion body.
 *   - **`plate-13`** — the pack's own face plate, four species' worth of it, as
 *     a mouth. It is the only flat card in the bank small enough to read as one.
 *
 * **NO MUZZLE, DELIBERATELY.** `tube-01`, `tube-06`, `blade-05` and `cone-06`
 * were all available and every one of them turns this into a big cat. The
 * absence of a snout is the strongest statement about a human face this kit can
 * make, and it is why the animal is worth having on the bench at all.
 *
 * **WHAT TO TRY FIRST**, if it is to be finished:
 *
 *   1. **One authored flat FACE CARD** — a `bespoke-*` sheet with a human profile
 *      cut into it, at `EYE_CARD_Z`'s own plane and painted from two slots. It is
 *      the cheapest possible commission (a card is zero-thickness and the pack's
 *      48 eye cards prove the mechanism), it needs no new role, and it would
 *      finish this species outright. It would carry a rule 1 flag, which is the
 *      escape clause working rather than failing.
 *   2. Failing that, a `chin`: any small blunt shape below the eye plane turns a
 *      blank front into a face. `box-08`, the bunny's muzzle boss, is 0.271 x
 *      0.327 x 0.283 and is the closest thing in the bank to one — but it is a
 *      MUZZLE and reads as an animal's, which is why it is not taken here.
 *
 * The lion half is real and needs nothing: `wedge-15` is THE LION'S OWN TAIL,
 * tuft and all, at its own donor transfer, and the four legs are the pack's own
 * row. `box-31`, the lion's own shell, is refused for the reason
 * `animal-griffin.ts` measures — it has **no front face at all**, a 1.000 x
 * 1.000 hole where the mane goes — and a species whose whole problem is its face
 * cannot start from a shell that has not got one.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown, +/-0.3125 in x and z. */
const CROWN_Y = 1.43125
/** The flat flank, and the plate's own centre band where a lappet can join. */
const FLANK_X = 0.625

export const SPHINX_ASSEMBLY = defineCreature('animal-sphinx', {
  palette: {
    coat: 0xc9a26a,    // UNREVIEWED: limestone, not lion tawny — this is a statue
    belly: 0xe0c69a,   // UNREVIEWED: the pale underside, weathered
    gold: 0xd6a521,    // UNREVIEWED: the nemes headdress
    stripe: 0x2b4f74,  // UNREVIEWED: the lapis band on the lappets
    mouth: 0x6b543a,   // UNREVIEWED: the one card on the blank face
    limb: 0xb28d59,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The cube. `box-31`, the lion's own shell, has NO FRONT FACE — measured in
   * `animal-griffin.ts` — and a species whose whole problem is its face cannot
   * start from a shell that has not got one. */
  hull: 'box-03',
  belly: 0.4375,

  /* The pack's most common card, at its own recorded station. On an animal with
   * no muzzle these two are most of the face there is. */
  eyes: { part: 'plate-01' },

  /* NO SNOUT. Every muzzle in the bank turns this into a big cat — see the
   * header. The blank front is the statement. */

  /* THE LION'S OWN TAIL, tuft and all, at its own donor transfer. Sunk past its
   * recorded 0.14 (which buries 0.078 of 0.555) to clear §3's 0.125 floor. */
  tail: { part: 'wedge-15', paint: 'coat', sink: 0.25 },

  extras: [
    /* THE MOUTH: `plate-13`, the pack's own face plate, the only flat card in
     * the bank small enough to read as one. */
    { name: 'mouth', part: 'plate-13', paint: 'mouth', at: [0, 0.6875, 0.635] },

    /* THE NEMES, across the flat crown. One of JT-041's three base shapes, which
     * Joe sanctioned by name for everybody and which needs no rule 1 flag. */
    {
      name: 'nemes',
      part: 'bespoke-square-01',
      paint: 'gold',
      stretch: [0.55, 0.25, 0.5],
      at: [0, CROWN_Y, 0.05],
    },

    /* THE LAPPETS — the cloth that hangs beside a pharaoh's face, and the most
     * recognisable thing about the Great Sphinx after the lion body. Joined
     * `axis: 'x'` so the solve carries them outward; the prism itself is
     * extruded along y whatever the join axis says, so they stay upright. */
    {
      name: 'lappet',
      part: 'bespoke-square-01',
      paint: 'stripe',
      kind: 'pair',
      axis: 'x',
      dir: 1,
      stretch: [0.22, 0.45, 0.25],
      at: [FLANK_X, 1.0, 0.3],
    },
  ],

  flag: 'PLACEHOLDER — a sphinx is a lion\'s body with a HUMAN FACE and there is no human '
    + 'anything in this pack. THE MEASUREMENT: Kenney drew twenty-four animals and no '
    + 'people, and of the bank\'s 100 records the `nose` role holds 28 DISTINCT SHAPES of '
    + 'which every single one is an animal\'s muzzle, beak, nose-tip or nostril card. '
    + 'There is no forehead, no brow, no chin, no cheek, no hair and no human ear in the '
    + '100. It is also the one place §3.1 explicitly stops paying: §3.2 says a tongue, a '
    + 'beak, a horn, a claw and an EYE carry a read that survives being moved, and no '
    + 'measured axis catches it because the confusion is semantic. A face is the strongest '
    + 'member of that list. WHAT STANDS IN is the NEMES HEADDRESS — one bespoke-square-01 '
    + 'across the crown and a mirrored pair as the lappets that hang beside a pharaoh\'s '
    + 'face — plus plate-13 as a mouth, and a DELIBERATELY BLANK FRONT: tube-01, tube-06, '
    + 'blade-05 and cone-06 were all available and every one of them turns this into a big '
    + 'cat, so the absence of a snout is the strongest statement about a human face this '
    + 'kit can make. WHAT TO TRY FIRST: one authored flat FACE CARD, a bespoke sheet with '
    + 'a human profile cut into it, sitting on EYE_CARD_Z\'s own plane and painted from '
    + 'two slots. It is the cheapest commission possible — a card has zero thickness and '
    + 'the pack\'s own 48 eye cards prove the mechanism — it needs no new parts-bank role, '
    + 'and it finishes this species outright. Second choice is a CHIN: any small blunt '
    + 'shape below the eye plane turns a blank front into a face, and box-08 (the bunny\'s '
    + 'muzzle boss) is the closest in the bank — but it is a muzzle and reads as one. THE '
    + 'LION HALF IS REAL and needs nothing: wedge-15 is the lion\'s own tail, tuft and all. '
    + 'box-31, the lion\'s own shell, is refused because it has NO FRONT FACE (a 1.000 x '
    + '1.000 hole where the mane goes, measured in animal-griffin.ts) and a species whose '
    + 'problem is its face cannot start from a shell without one. NEW PALETTE, UNREVIEWED: '
    + 'limestone rather than lion tawny, because this is a statue.',
})
