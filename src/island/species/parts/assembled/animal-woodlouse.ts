/**
 * The woodlouse — the only species in this collection on the CRAB'S shell, and
 * the reason is not that it is flat.
 *
 * **A woodlouse is a crustacean.** It is a terrestrial isopod, closer to a crab
 * than to any insect in this album, and `box-13` is the pack's crab hull and the
 * only non-cubic shell in the bank: 1.333 x 0.4506 x 1.3474, volume 0.8092
 * against the cube's 1.9531. So the flat shell is a lineage here as well as a
 * silhouette, which is the strongest argument any hull choice in this collection
 * has.
 *
 * **The tergites are `box-19`, the FISH'S body-shell overlay** — a radial hoop
 * 1.404 across, and the only band in the bank nothing in this project had spent
 * as a segment. Five of them across the back at 4/16 spacing are a woodlouse's
 * armour plates, and at 1.404 on a 1.333 hull each stands 0.0355 proud all the
 * way round.
 *
 * **THE LEG ROW HAD TO MOVE, and it is arithmetic rather than taste.** `box-13`
 * is the ONE hull of the ten whose bottom is not `HULL_BOTTOM_Y`: it sits at
 * 0.3210 against everything else's 0.18125. A `box-01` joined at the standard
 * row reaches only 0.30625, which leaves it 0.0147 SHORT of the shell — floating,
 * against §3. The row is raised to 0.33 so the leg tops land inside the shell.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-13`'s own recorded centre — the crab's, and the only one not at 0.80625. */
const HULL_MID_Y = 0.5463

/** The one hull in the pack whose bottom is not 0.18125. Measured: 0.320972. */
const LEG_Y = 0.33

/**
 * The tergites are 0.36 of `box-19`'s height and 0.24 of its thickness.
 *
 * Two axes, and both are forced. **Thickness** is rule 3: at its own 0.520 the
 * hoop is 1.404 x 1.404 x 0.520 = 1.0251 against this hull's 0.8094 — bigger
 * than the mass it sits on — and `assertAssembly` wants a ratio of 3, so the
 * bounding box has to come under 0.2698. **Height** is the shell: `box-19` is
 * 1.404 tall and `box-13` is 0.4506, so an unstretched hoop would tower 0.702
 * above and below a plate a third of that, and read as a croquet hoop rather
 * than as a plate on a back. At [1, 0.36, 0.24] it is 1.404 x 0.5054 x 0.1248 =
 * 0.0886 and the ratio is 9.1, and it hugs the shell with 0.027 proud top and
 * bottom.
 */
const TERGITE: [number, number, number] = [1, 0.36, 0.24]

/** Five plates at 4/16 spacing on the pack's own authoring grid. */
const TERGITE_Z = [0.5, 0.25, 0, -0.25, -0.5] as const

export const WOODLOUSE_ASSEMBLY = defineCreature('animal-woodlouse', {
  /* NEW AND UNREVIEWED — the first woodlouse ever built here. Brief §19 is
   * "bright, never scary": a soft slate grey with a warm cream underside,
   * because the animal under a flowerpot is grey and a child likes it. */
  palette: {
    coat: 0x6f6a68,   // UNREVIEWED: the body, a soft slate grey
    belly: 0xe6dcc8,  // UNREVIEWED: the pale underside, and the sclera
    plate: 0x504b49,  // UNREVIEWED: the five tergites, a shade under the coat
    limb: 0xb9a98c,   // UNREVIEWED: the legs and antennae, pale like the venter
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE CRAB'S PLATE. See the header: the argument is the lineage, not just the
   * profile. It was unusable at all until you made the height band a norm that
   * REPORTS on 3 August; `animal-ray.ts` was the first species to wear it. */
  hull: 'box-13',

  belly: 0.375,

  /* Raised to 0.33 because `box-13`'s bottom is 0.3210 and not 0.18125 — the
   * one hull of the ten where the standard row leaves the legs in mid-air. */
  legs: { x: 0.34, y: LEG_Y, z: 0.34 },

  /* The default oval, sixteen donors' own, dropped to the shell's own height. */
  eyes: { part: 'plate-01', x: 0.24, y: 0.63 },

  /* The bank's SMALLEST shape, the bee's and the caterpillar's own — worn here
   * as the short forward antennae a woodlouse waves in front of it. */
  ears: { part: 'box-05', name: 'antenna', paint: 'limb' },

  extras: [
    /* THE FIVE TERGITES. `box-19` centred on the body at `sink: 0.5`, which is
     * the one sink at which the shift `-lo - sink x extent` is zero for a
     * symmetric shape, so each station below is a place rather than a face. */
    ...TERGITE_Z.map((z, i) => ({
      name: `tergite-${i}`,
      part: 'box-19',
      paint: 'plate',
      stretch: TERGITE,
      sink: 0.5,
      at: [0, HULL_MID_Y, z] as [number, number, number],
    })),
  ],

  flag: 'FIVE PLATES AND FOUR LEGS, WHERE A WOODLOUSE HAS SEVEN AND FOURTEEN — and rule 9 '
    + 'is what set both numbers. `box-13` costs 92 triangles, each `box-19` costs another '
    + '92, and five plates with six legs measured 966 against the pack\'s 951. So the plates '
    + 'won and the legs took the pack\'s own row of four, on the grounds that the ARMOUR is '
    + 'what a child names this animal by. Say if you would rather have the legs; it is one '
    + 'line either way. ALSO: IT IS 0.8548 TALL AGAINST THE PACK\'S 1.43 FLOOR, which is '
    + 'the crab shell and is deliberate — `animal-ray.ts` shipped at 0.8670 on the same '
    + 'hull and said the same thing. If it reads as too SMALL beside the fox rather than as '
    + 'correctly flat, nothing here can raise it, because a hull is worn at its own size; '
    + 'the honest alternative is to move it onto the cube and lose the crab lineage. ALSO: '
    + 'IT CANNOT ROLL UP, which is the one trick a child knows about this animal, and a '
    + 'pose is not a thing a static assembly can express at all. ALSO: NEW PALETTE, '
    + 'UNREVIEWED.',
})
