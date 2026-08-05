/**
 * The Arctic fox — a fox that has to be three foxes away from three other foxes.
 *
 * `animal-fox` is FROZEN and a child meets it in the base pack. `animal-fennec-
 * fox` is built and wears `box-06`, the bank's tallest ear, `box-23`, the fox's
 * own brush, and `tube-01`. `animal-wildcat` is built. So the two parts this
 * animal must not take are exactly the two that say "fox" loudest, and both are
 * already spoken for:
 *
 *   - **`box-23`, the brush, is REFUSED.** `animal-wolf.ts` measured why it
 *     travels — taper 0.961, a round section (y and z both 0.910248), 1.67x the
 *     volume of any other tail — and the fennec already wears it. The tail here
 *     is **`wedge-03`, the beaver's paddle**: thick (0.589 on its thin axis,
 *     inside §7's thick group) but SHORT, 0.4153 of reach against the brush's
 *     0.910, and it TAPERS to 0.577. Short, thick and tapering is a winter fox's
 *     brush; long, thick and untapering is a red fox's.
 *   - **`box-06`, the tallest ear, is refused for the obvious reason.** An
 *     Arctic fox has the SMALLEST ears of any fox — that is the one thing a
 *     child is told about it — so it takes `box-02`, the beaver's and the POLAR
 *     BEAR's round button, which is the roundest ear in the bank and the only
 *     one an arctic animal already wears. Its band 7 is Kenney's own inner cut,
 *     ten triangles on the button's front face, so a pink inner ear costs one
 *     entry and no geometry.
 *
 * **`sink: 0.35` and not the shape's own 0.778.** The polar bear buries this
 * button until it shows 0.070, which `animal-sheep.ts` measured and refused as
 * invisible; at 0.35 it shows 0.205 and reads as an ear. Still nearly three
 * times §3's nothing-floats floor.
 *
 * `tube-01` IS shared with the fennec and that is the honest half: two small
 * foxes with short muzzles should have the same short muzzle, and inventing a
 * shape difference between them would be a lie a child can check.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * The button ear, shown rather than buried. `box-02` is 0.315 tall and its own
 * recorded burial is 0.778, which leaves 0.070 proud — `animal-sheep.ts` §5
 * measured that and called it invisible. 0.35 leaves 0.205.
 */
const EAR_SINK = 0.35

export const ARCTIC_FOX_ASSEMBLY = defineCreature('animal-arctic-fox', {
  palette: {
    coat: 0xdde6ee,    // UNREVIEWED: winter white with a blue cast, so it is not paper
    belly: 0xfdfeff,   // UNREVIEWED: the underside, a true white against that cast
    inner: 0xd8b3ac,   // UNREVIEWED: the inner ear, band 7 of box-02
    mark: 0x2b3038,    // UNREVIEWED: the nose
    eye: 0x3b332c,     // UNREVIEWED: dark to the rim — a white animal needs a dark eye
    limb: 0xc9d5e0,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  /* The whole animal is white, so the line is the only thing giving it a top
   * and a bottom at all. 8/16 is the pack's own equator and the tiger's zone. */
  belly: 0.5,

  /* THE POLAR BEAR'S OWN BUTTON, shown at 0.205 rather than buried to 0.070.
   * Band 7 is Kenney's inner cut — ten triangles on the button's front face. */
  ears: { part: 'box-02', paint: { base: 'coat', byBand: { 7: 'inner' } }, sink: EAR_SINK },

  /* Shared with the fennec on purpose — see the header. */
  snout: 'tube-01',
  nose: { part: 'box-10', paint: 'mark' },

  /* The beaver's paddle: thick, SHORT and tapering, against the fox's and the
   * fennec's long round untapering brush. */
  tail: { part: 'wedge-03', paint: 'coat' },

  eyes: { paint: 'eye' },

  flag: 'THE TAIL IS THE DECISION AND IT IS A REFUSAL. box-23, the fox\'s brush, is the shape '
    + 'this animal most obviously wants and it is refused: animal-wolf.ts measured that it '
    + 'travels (taper 0.961, round section, 1.67x the volume of any other tail in the bank) and '
    + 'animal-fennec-fox already wears it, so taking it would build a white fennec. What is '
    + 'here instead is wedge-03, the beaver\'s paddle — thick on its thin axis (0.589) but only '
    + '0.4153 of reach against the brush\'s 0.910, and tapering to 0.577. Short, thick and '
    + 'tapering is a winter fox; long, thick and untapering is a red fox. THE EAR IS THE POLAR '
    + 'BEAR\'S, box-02, and it is here because an Arctic fox has the smallest ears of any fox '
    + 'and this is the roundest button in the bank. Its sink is 0.35 and NOT the shape\'s own '
    + '0.778: the polar bear buries it until 0.070 shows, which animal-sheep.ts already called '
    + 'invisible, and 0.35 shows 0.205. THE MUZZLE IS SHARED WITH THE FENNEC on purpose — two '
    + 'small foxes with short faces should have the same short face. NEW PALETTE, UNREVIEWED, '
    + 'and it is a white animal on a white ground: the blue cast in the coat and the 8/16 belly '
    + 'line are the only things giving it a top and a bottom, so look at those first.',
})
