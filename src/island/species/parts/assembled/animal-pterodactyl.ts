/**
 * The Pterodactyl — and the third job one shape has now done.
 *
 * `blade-06` and `blade-07` carry `bee:wing-left` and `penguin:wing-left` as
 * their provenance, and `docs/how-the-animals-are-made.md` §14 records the
 * consequence: **the pack's insect wing and the pack's flipper are bit-identical**,
 * which is why three sea animals call the same shape a flipper and seven Critters
 * call it a wing. A pterosaur's membrane is the third reading, and it is the one
 * the shape is closest to — a single skin stretched on one long spar.
 *
 * **THE AXIS IS OVERRIDDEN, WHICH IS WHAT MAKES IT A WING RATHER THAN A FIN.**
 * `blade-06`'s recorded attachment is `y +1` — the bee wears it standing off the
 * back — with only 0.200 of extent that way. Declared `axis: 'x', dir: 1` it runs
 * along its 0.693 instead, which is 3.5x further, and `kind: 'pair'` mirrors it.
 * That override is `PartDef.axis`'s sanctioned tortoise-hoop trick and it is what
 * `animal-goose.ts` does to the trunk.
 *
 * **IT FLAPS WITHOUT BEING TOLD TO.** `withDefaultFlap` in `creature.ts` triggers
 * on the PART'S ROLE and not on a feature name, so any `wing` shape moves unless
 * the species names it in a motion of its own. This one wants exactly that and
 * says nothing.
 *
 * The beak is `tube-03`, the deer's, stretched 1.6x on its own depth — the only
 * straight rigid tube in the bank at that length, and `animal-echidna.ts`'s
 * argument for it holds here for a longer jaw on a lighter head.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own flank and crown. */
const HULL_SIDE_X = 0.625
const HULL_MID_Y = 0.80625
const CROWN_Y = 1.43125

/**
 * 1.8x on `blade-06`'s 0.693 of span, giving 1.2474 per side.
 *
 * At its own recorded 0.41289 burial that leaves 0.732 standing clear each side,
 * so the animal measures **2.715 across against a 1.250 body** — the widest thing
 * in the collection by far and the only member whose binding dimension is WIDTH.
 * Its keep-out is 1.3574, against the fox's 1.15 and Woodland's ceiling of 1.6.
 * Ocean's ray was the first species in the project that had to be checked that
 * way; this is the second.
 */
const WING_STRETCH = 1.8

export const PTERODACTYL_ASSEMBLY = defineCreature('animal-pterodactyl', {
  palette: {
    coat: 0x9c7248,    // UNREVIEWED: a warm tan body
    belly: 0xe0cfae,   // UNREVIEWED: the pale underside, and the sclera
    wing: 0x74543a,    // UNREVIEWED: the darker membrane, one tone under the coat
    crest: 0xc4603a,   // UNREVIEWED: the rust head crest
    limb: 0x846044,    // UNREVIEWED: the two legs and the long beak
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The 1.250 cube. A flying animal spends its budget on span, so the shell is
   * the cheap one at 60 triangles and the wings are 184 of the 426. */
  hull: { part: 'box-03', paint: 'coat' },

  /* 8/16 — the tiger's own mammal line made exact, and the cube's equator. It
   * splits the `coat` CELL and nothing else here reads from `coat`. */
  belly: 0.5,

  /* THE BEAK. The deer's muzzle at its own zero burial, so all of it stands
   * clear, stretched 1.6x on depth alone — the length is the animal and the
   * width is not. */
  snout: { part: 'tube-03', paint: 'limb', stretch: [0.8, 0.8, 1.6] },

  legs: false,
  extras: [
    /* TWO legs at the chicken's and the goose's biped station. A pterosaur walked
     * on four, and two is the honest read for a thing shown flying. */
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair', sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },

    /* THE WINGS. The bee's and the penguin's own shape, re-axised so it runs
     * along its long extent, mirrored, at its own recorded 0.41289 burial. It
     * flaps because `creature.ts` reads the bank's `wing` role, not the name. */
    {
      name: 'wing',
      part: 'blade-06',
      paint: 'wing',
      kind: 'pair',
      axis: 'x',
      dir: 1,
      stretch: [WING_STRETCH, 1, 1],
      at: [HULL_SIDE_X, HULL_MID_Y + 0.25, 0],
    },

    /* THE CREST. cone-01, the bank's zero-taper point, swept BACK off the crown
     * — the same shape three spiny animals wear as a quill, doing a fourth job. */
    {
      name: 'crest',
      part: 'cone-01',
      paint: 'crest',
      spin: [{ axis: 'x', deg: -55 }],
      sink: 0.25,
      at: [0, CROWN_Y - 0.05, 0.25],
    },
  ],

  flag: 'ONE SHAPE, A THIRD JOB. blade-06 carries bee:wing-left AND penguin:wing-left as its '
    + 'provenance — the pack\'s insect wing and the pack\'s flipper are bit-identical, which is '
    + 'why three Ocean animals call it a flipper and seven Critters call it a wing. A '
    + 'pterosaur\'s membrane is the reading it is closest to: one skin on one long spar. THE '
    + 'AXIS IS OVERRIDDEN AND THAT IS THE WHOLE OF IT: its recorded attachment is y +1 with '
    + 'only 0.200 of extent that way, and declared axis x dir 1 it runs along its 0.693 '
    + 'instead, 3.5x further. That is PartDef.axis\'s sanctioned override, the same one '
    + 'animal-goose.ts uses on the trunk. IT FLAPS WITHOUT BEING ASKED — creature.ts\'s '
    + 'withDefaultFlap triggers on the bank ROLE and not on a feature name, deliberately, '
    + 'because your editor names an extra after the part it wears. WIDTH IS THE BINDING '
    + 'DIMENSION HERE and it is only the second time in the project, after Ocean\'s ray: 2.715 '
    + 'across against a 1.250 body, keep-out 1.3574 against the fox\'s 1.15 and Woodland\'s '
    + 'ceiling of 1.6. WING_STRETCH is your dial and every 0.1 of it is 0.069 more span each '
    + 'side. NEW PALETTE, UNREVIEWED.',
})
