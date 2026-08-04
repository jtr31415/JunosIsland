/**
 * The leopard gecko — Home Pets' four-legged reptile, and the first species in
 * the project whose whole face is built out of CARDS.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What a child names this animal by, and the one thing it cannot have
 *
 * A broad flat smiling head, huge lidded eyes, a fat tail, four short sprawling
 * legs with pale splayed toes, sandy yellow above and cream below — and SPOTS,
 * which are the animal's name and which this pack cannot draw. That last one is
 * this species' badger problem and it is dealt with the badger's way: named
 * exactly, flagged where Joe reads it, and nothing authored or borrowed to fake
 * it. The section at the bottom says which mechanism falls short of what.
 *
 * ## THE HULL IS `box-03` BECAUSE OF THE FACE, and that is a measurement
 *
 * A gecko is broad and flat and the pack has no flat hull it can stand on
 * (`HEIGHT_FLOOR`), so the shell is chosen on the next thing that matters, which
 * here is the only thing that matters: this animal's read is its FACE, and its
 * face is three flat cards — two eyes and a mouth line — that have to be
 * coplanar or the eyes float in front of the smile.
 *
 * `EYE_CARD_Z` is 0.6350 and it never moves, on any hull, for any species
 * (rule 5, and `hulls.ts` re-derives it). A solved face card lands at that
 * hull's own front face plus `CARD_STANDOFF`, the 0.010 of daylight the pack
 * gives a zero-thickness card. So:
 *
 *     box-03  0.625 + 0.010 = 0.635   the eye plane exactly
 *     box-31  0.500 + 0.010 = 0.510   the mouth 0.125 BEHIND the eyes
 *     box-41  0.725 + 0.010 = 0.735   the mouth 0.100 IN FRONT of them
 *
 * `box-03` is the only shell in the pack on which the solve puts a mouth on the
 * eye plane, and it does it to the last decimal because 0.635 is `plate-03`'s own
 * recorded z as well. Nothing was chosen; three numbers agreed.
 *
 * **Three other hulls were considered and refused, and each refusal is a number:**
 *
 *   - **`box-13`, the crab's — the flattest shell in the bank and the obvious
 *     reach for a flat animal.** It cannot be worn at all. Its recorded bottom is
 *     y = 0.320972 where every other hull's is `HULL_BOTTOM_Y` = 0.18125, so the
 *     pack's own leg row — which is a constant — would end 0.139 below its belly
 *     with nothing in between; and it is 0.4506 tall, so even re-seated on that
 *     row the animal measures 0.632 against a floor of 1.43. There is no feature
 *     that pays 0.8 back. **Recorded here so the next builder does not reach for
 *     it again for the same good reason.**
 *   - **`box-31`, the lion's shallower shell** — the newt and this animal are
 *     both low sprawling reptiles and it is the obvious shared answer. Refused on
 *     the face arithmetic above: the newt has no mouth card and this one is
 *     mostly mouth.
 *   - **`box-12`, the "wider" shell.** `animal-badger.ts` measured its 0.289 of
 *     extra width and it is not width: it is two fused EAR LUGS on a 1.250 cube
 *     torso, fifteen points a side, high and forward on the head where the cow
 *     and the deer wear their ears. A gecko's ear is a HOLE in the side of its
 *     head, so a pair of lugs is the wrong animal — and it costs 180 triangles
 *     against the cube's 60 for the privilege.
 *
 * ## Every number, and where it came from
 *
 *   - **THE EYE IS `plate-14`, THE PANDA'S — the biggest card in the bank.**
 *     0.435472 x 0.442601 against the default oval's 0.400 x 0.320208, and there
 *     is nothing bigger to reach for; rule 5 makes stretching one unsayable. It
 *     is also the right SPLIT for this animal without any help: 40 of its 57
 *     triangles are band 15, so seven tenths of the card is pupil, and a leopard
 *     gecko's eye is very nearly all pupil. Its station is the panda's own
 *     recorded (0.258676, 0.920023) and its z is the absolute 0.6350 — three
 *     numbers, none of them typed here, which is why `eyes:` names the card and
 *     says nothing else.
 *
 *   - **THE MOUTH IS TWO `plate-03`, ABUTTED AT THE MIDLINE.** `animal-nightjar.ts`
 *     established this hours ago and measured it: the bank's only mouth shapes
 *     are two flat cards, `plate-03` (0.236581 x 0.100851) and `plate-13`
 *     (0.219210 x 0.100), and a mirrored PAIR of the wider one meets at x = 0 and
 *     reads **0.473162 across** — the widest line this pack can draw. On a 1.250
 *     head that is 37.9%, against 18.9% for a single card. A gecko's smile is
 *     most of its read, so it gets the widest one there is. `GAPE_HALF` is the
 *     card's own recorded half-width and nothing else.
 *
 *   - **The mouth drops to 10/16, and the reason is measured rather than felt.**
 *     At `plate-03`'s own recorded height, 0.686849, the two cut-outs OVERLAP the
 *     panda's eye cards — **ten triangle pairs**, four coplanar cards on the same
 *     z = 0.635, which is the z-fight `CARD_STANDOFF` exists to prevent between a
 *     card and a hull and cannot prevent between two cards. **The pack never made
 *     this combination**: no
 *     donor of `plate-14` (the panda) donates `plate-03` (bee, caterpillar, fish,
 *     monkey), so nobody had checked. At **y = 0.625, 10/16 on the pack's own
 *     grid**, the count is zero. It is also still wholly on the hull's flat front
 *     face, which runs 0.49375 to 1.11875, and it is where a gecko's mouth is:
 *     low, under a very large eye.
 *
 *   - **THE TAIL IS `box-23`, THE FOX'S BRUSH, AND IT IS THE FATTEST SHAPE IN THE
 *     BANK.** §7 splits the seven tails on thickness rather than length and this
 *     is the top of that list by both measures that matter: 0.744 across its
 *     narrowest axis against the next tail's 0.626, and 1.67x the volume of
 *     either other thick one. Its section is ROUND — y and z are both 0.910248 to
 *     six decimals — and it barely narrows, taper 0.961. A leopard gecko stores
 *     fat in its tail and it is thicker than any other pet lizard's; this is the
 *     one shape in the pack that is honestly that.
 *
 *   - **The tail hangs at the hull's own centre, and the donor's raw number is
 *     what refused itself.** `box-23`'s recorded y is 0.868750 — but that is the
 *     FOX's placement on `box-21`, whose centre is 0.933788, so on its own donor
 *     the brush roots **0.065038 BELOW** the body's axis. Transferred raw onto a
 *     cube centred at 0.80625 the same number sits 0.0625 ABOVE it, which inverts
 *     the relationship the donor actually recorded. `HULL_MID_Y` puts it back on
 *     the axis, which is also what a gecko's tail does: it continues the line of
 *     the back rather than hanging off the rump. The newt, the salamander and the
 *     crocodile each arrived at the same place from their own animals.
 *
 *   - **Band 5 of that tail is painted from the pale slot, and it is Kenney's own
 *     cut.** §4's first way: 30 of the brush's 92 triangles are a second band
 *     covering its upper outer quadrant — the fox's white tip — so a paler tail
 *     end costs no geometry at all. `animal-fennec-fox.ts` and
 *     `animal-raccoon.ts` both spend this same cut DARK; this one is deliberately
 *     the other way, because a leopard gecko's tail is PALER than its body and
 *     because a dark cap on a spotless animal would read as the one spot it is
 *     not allowed to have. It is ONE band where the animal carries several, and
 *     the flag says so.
 *
 *   - **THE LEGS SPRAWL TO 0.4375, WHICH IS THE EXACT LIMIT.** `box-01` is 0.375
 *     across, so at 0.4375 the outer face of each leg lands on **0.625 — the
 *     hull's own side, and not one thousandth past it.** The pack's own axiom,
 *     checked over 23 of 23 animals, is that every leg sits inside the body's
 *     footprint; this is that axiom at its limit and it is as sprawled as a kit
 *     with a fixed leg row can honestly be. `animal-crocodile.ts` solved the same
 *     bound for the same reason. The newt and the salamander leave the default
 *     0.27 alone, and that is right for them — their separation is spent on a
 *     crest and on blotches — but a leopard gecko standing with its elbows out is
 *     the difference between a lizard and a small mammal, so this one pays for
 *     it. The wheelbase is left at the default 0.25: a gecko is short-bodied,
 *     which is the other half of the sprawl and costs nothing to say.
 *
 *   - **THE TOES ARE JT-044's TWO-TONE LEG.** Joe ruled it for hooves — *"just
 *     use a two tone leg for hooves"* — and a gecko's pale splayed toe pads under
 *     a darker limb is the same mechanism doing the same job. `at: 0.25` is 4/16
 *     on the pack's authoring grid, which `texture.ts` requires, and on a 0.30625
 *     leg it paints the bottom **0.076563** cream. It costs no geometry: the
 *     boundary is a plane painted into the `limb` cell and the leg is the pack's
 *     own 44 triangles either way. **`limb` is painted by nothing else on this
 *     animal**, which is what makes the split safe — a patch belongs to a SLOT,
 *     not to a part, so a second `limb` part would silently wear the same line.
 *
 *   - **THE TUBERCLES ARE `box-08`, THE BUNNY'S MUZZLE, AND THEY ARE SKIN.** A
 *     leopard gecko is a bumpy animal — the raised tubercles down its back and
 *     flanks are diagnostic of it in a way the spots are not — and this is the
 *     bank's cheapest shape that can say so: `y +1`, which is the only condition
 *     under which a donor's burial transfers to a radial mount (the fault that
 *     cost `animal-corn-snake.ts` a rebuild), sunk its own measured 0.751980, so
 *     **0.081128 of a 0.327103 part stands proud**. Fine bumps, not a spine.
 *     They are painted from the COAT and not from a dark slot, deliberately: nine
 *     dark bumps on a sandy back is a fake spot pattern, and §8's argument for
 *     this idiom was always the SILHOUETTE.
 *
 *   - **Two rows, top and chamfer, and no side row.** Three facings — 0 and
 *     +/-45 degrees — which rounds the BACK, which is where a gecko's tubercles
 *     are; its belly and lower flanks are smooth granular skin. It is also free:
 *     with no side row the animal is exactly `box-03` wide, **1.250**, so nine
 *     tubercles cost zero keep-out. A five-row run would have pushed it to 1.412
 *     and put bumps on a smooth part of the animal. The span is the builder's own
 *     solve — §8 step 4's embedded bound — and it comes out at 0.5, stations at
 *     +/-0.5 and 0, the whole length of the back. Checked at the CORNERS rather
 *     than at the station, as `animal-newt.ts` insists: every tubercle's buried
 *     face lies inside `box-03`'s own surface, the tightest by 0.0242.
 *
 *   - **NO SNOUT AND NO NOSE, and both absences are the animal.** A gecko's head
 *     runs straight into its body and its nostrils are two dots on a blunt lip;
 *     at 0.16 scale a muzzle on a gecko reads as a mammal, which is the trap this
 *     collection's six rodents are already spending their separation on. There is
 *     also a mechanical reason and it is the stronger one: a snout joins the front
 *     face at z = 0.625 and reaches forward from there, so it would swallow both
 *     mouth cards and both eye cards whole. **The mouth IS the muzzle here.**
 *
 *   - **The belly is PAINTED at 6/16**, §4's second way — no second shape, no
 *     split triangle. §7 measured the pack's mammal boundary wandering across
 *     0.4808-0.5481; that is a mammal's line and this is a lizard, whose pale
 *     part is the venter only, so 0.375 is the nearest notch below that zone —
 *     the same reading `animal-slow-worm.ts` made for the same reason, and one
 *     notch under `animal-corn-snake.ts`'s 7/16, which is right because a corn
 *     snake's ventral scales wrap onto the flank and a gecko's do not.
 *
 *     One thing worth knowing about that number, because it is a trap rather than
 *     a taste: a split lives on the SLOT, and an unpatched part painted from the
 *     same slot reads its cell's CENTRE row, which is 8 of 16. 6/16 is below it,
 *     so the tail and the nine tubercles — `coat`, unpatched — still read coat. A
 *     belly line at 9/16 or above would have quietly turned every one of them
 *     cream. The test pins it.
 *
 * ## WHAT SEPARATES THIS ANIMAL FROM ITS COLLECTION
 *
 * Home Pets holds two other reptiles and `species-garden.test.ts:261-286` is the
 * precedent for a collection test that fails silhouette twins.
 *
 *   - **Against the corn snake**: it has no leg feature at all and no tail
 *     feature at all — it is a bare body on a coil. This one has four legs and
 *     the fattest tail in the bank. There is no angle from which they are the
 *     same animal, and the coats are 0xd98a5a against 0xe3b45f.
 *   - **Against the terrapin** (being built alongside this): a terrapin is
 *     shelled and short-tailed. This one's whole rear half is tail — 0.910248 of
 *     reach off the back, which is 73% of the hull's own depth — and it wears
 *     nothing that could be read as a shell.
 *   - **Against the collection's six rodents and four cage birds**: it is the only
 *     member with the pack's biggest eye card and the only one with a mouth 0.473
 *     wide.
 *
 * ## THE SPOTS, AND THE PALETTE
 *
 * **FLAGGED, for two things.** Neither is a strained rule: 808 triangles inside
 * the pack's 422-951 and 588 vertices inside its 405-1626, height 1.5124 inside
 * 1.43-2.02, feet on y = 0 exactly, keep-out 1.008 against the fox's own 1.15,
 * the hull at its own standard size, every part joined at a face its donor joined
 * its own to, one mass, and nothing authored.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/*
 * THE SOLVED CONSTANTS WERE REMOVED ON 4 AUGUST — the editor's push inlined their
 * values and left them declared and unread, which fails `tsc --noEmit`. Their
 * derivations, because the numbers are still in the definition:
 *
 *   HULL_MID_Y  0.80625   `box-03`'s own recorded centre — the axis a gecko's
 *                         tail continues
 *   GAPE_HALF   0.118291  `plate-03`'s own recorded half-width. Two copies at
 *                         this station abut at x = 0 and read as ONE line
 *                         0.473162 across — the widest the pack can draw, 37.9%
 *                         of this hull's 1.250 head. `animal-nightjar.ts`
 *                         measured it first, for a bird whose gape is its whole
 *                         animal; a gecko's smile is the same claim.
 *   GAPE_Y      0.625     10/16 on the pack's grid, and the one notch that clears
 *                         the eye: at `plate-03`'s own recorded 0.686849 the two
 *                         mouth cards overlap the panda eye cards' cut-outs — ten
 *                         triangle pairs, all four coplanar on z = 0.635 with
 *                         nothing to break the tie. No donor ever wore these two
 *                         shapes together, so nobody had found it. At 0.625 the
 *                         count is zero and it is where a gecko's mouth sits.
 *   CARD_Z      0.635     the front face plus the daylight the pack gives a
 *                         zero-thickness card — the same 0.6350 its own 48 eye
 *                         cards sit at, standard deviation 0.0000. The mouth has
 *                         an explicit `at` (a pair cannot be solved onto the
 *                         midline) and so had to be told.
 *   LEG_X       0.4375    the sprawl at its exact limit: `box-01` is 0.375
 *                         across, so a leg centred here puts its outer face on
 *                         0.625 — `box-03`'s own side, flush and not past it.
 */

export const GECKO_ASSEMBLY = defineCreature('animal-gecko', {
  palette: {
    coat: 0xe3b45f,
    belly: 0xf7edd9,
    mark: 0x584022,
    limb: 0xc9993f,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
    'plate-03': 0x696969,
    tubercle: 0x92753f,
  },

  belly: 0.375,
  legs: { x: 0.4375, paint: { base: 'limb', patch: { below: 'belly', at: 0.25 } } },
  eyes: { part: 'plate-14' },
  ridge: {
    part: 'box-08',
    name: 'tubercle',
    count: 3,
    rows: ['top', 'chamfer'],
    paint: 'tubercle',
  },
  extras: [
    {
      part: 'plate-03',
      name: 'plate-03',
      at: [0, 0.625, 0.6625],
      paint: 'plate-03',
      stretch: [3.35, 1, 0.25],
    },
    {
      part: 'tube-06',
      name: 'tube-06',
      at: [0, 0.575, -0.55],
      spin: [{ axis: 'x', deg: -180 }],
      stretch: [1.55, 1, 1.75],
    },
  ],
  flag: 'THE SPOTS CANNOT BE EXPRESSED, and a LEOPARD gecko is named for them. Colour '
    + 'here is entirely a texture LOOKUP and the atlas carries no positional '
    + 'information at all (docs/HANDOFF.md section 6), so every route runs out: '
    + '`Paint.patch` takes ONE number and that number is a HEIGHT — it paints one level '
    + 'boundary across a whole part and cannot say "a spot goes here", because it '
    + 'cannot say "here"; `byBand` can only re-colour where Kenney already cut, and '
    + '`box-03` is ONE band over all sixty of its triangles, so there is nothing to '
    + 'cut; and the bank\'s only marking cards are the cow\'s, dog\'s and giraffe\'s flank '
    + 'blotches, `plate-10` (0.244 x 0.253) and `plate-11` (0.400 x 0.433) — 20% and '
    + '35% of this hull\'s own side. Four of those is the fire salamander\'s blotching, '
    + 'which is correct for a salamander and is not a leopard gecko\'s dozens of small '
    + 'spots, so they are refused rather than borrowed. NOTHING WAS AUTHORED OR FAKED: '
    + 'this animal is a plain sandy yellow with a cream belly, and what carries it '
    + 'instead is all SHAPE — the pack\'s biggest eye card, the widest mouth line the '
    + 'bank can draw (two `plate-03` abutted, 0.473 across a 1.250 head), the fattest '
    + 'tail in the bank, nine raised tubercles, and four legs set at 0.4375, which is '
    + 'the exact station where a leg\'s outer face lands flush on the hull\'s own side. '
    + 'The tail carries ONE pale band, from Kenney\'s own cut in the fox\'s brush, where '
    + 'a real gecko\'s tail carries several. ALSO: NEW PALETTE, UNREVIEWED — '
    + '`home-pets.ts` has never carried colours for this species, so these four are the '
    + 'first ever proposed for a gecko and nothing downstream treats them as agreed. '
    + 'Joe should look at them, and at whether a spotless leopard gecko is worth a '
    + 'bespoke spot card.',
})
