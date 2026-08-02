/**
 * Africa — roster row 4, ship 7, name band `medium`.
 *
 * PB-036 phase 2. `roster.ts` says which sixteen species this collection holds;
 * this file says what thirteen of them ARE. The other three are not here and
 * that is the ruling, not an oversight — see NOT BUILT below. `registry.ts`
 * already states the shape of that gap: "A species in the roster with no record
 * here is a species that has not shipped."
 *
 * NOT BUILT, deliberately, and not to be filled in without building a kit first:
 *
 *   - `animal-ostrich` — two legs, a neck longer than its body, no tail as this
 *     kit means the word. Wants `songbird`/`bespoke`.
 *   - `animal-vulture` — hooked beak, broad wings, tail fan. Wants `raptor`,
 *     declared in `types.ts` and not built.
 *
 * BOTH WANT WINGS, AND THE BANK HAS NONE. Measured, not assumed: the `wing` role
 * is declared in `bank.generated.ts` and occurs zero times in the data, alongside
 * `horn` and `claw`; and the pack's own three birds — parrot, chick, penguin —
 * are a fused hull plus a beak, legs and eye cards, with no wing between them.
 * So there is no shape to adapt and rule 1 has nothing to work on. How those two
 * should read is a LOOK decision and it belongs to Joe, not to a measurement.
 *
 * `animal-crocodile` WAS on this list until 2 August 2026 and left it the only
 * honest way, by being built on the route the entry already named: `bespoke`, on
 * the assembly kit. The ruling that kept it off — that the quadruped kit's legs
 * stand under the body and its skull is a cube — is not overturned by that; it is
 * satisfied by it. Its record below carries no `build` at all.
 *
 * Africa therefore ships PARTIAL, FOURTEEN of sixteen, and
 * `tests/island/species-africa.test.ts` asserts the two remaining absences by
 * name so nobody half-fills the collection later by improvising a shape for
 * them. That improvisation is the exact failure roster §1's "kits before
 * species" rules out.
 *
 * WHAT THE NUMBERS MEAN. Every field except `height` is a multiplier off the
 * kit's reference silhouette (`kits/quadruped.ts` REF), which is fox-shaped on
 * purpose. `height` is absolute in Kenney units. The measured pack runs
 * 1.43–2.02 tall with a mean width/height of 0.97, so these are all in
 * 1.5–2.2 and all deliberately CHUNKIER than the animal really is: a
 * correctly-proportioned cheetah is a stranger beside `animal-fox`, which
 * roster §1 forbids. The hippo and the meerkat here differ by 0.7 units where
 * reality would say a factor of thirty, and that is correct for this pack.
 *
 * Long-and-low is expressed by dropping `legs` and `height`, never by pushing
 * `body`. `kits/quadruped.ts` LIMIT explains why: `pets.ts:652` takes the
 * obstacle keep-out from `max(width, depth) / 2`, so body LENGTH is charged for
 * in trees the creature cannot walk between. Hence the mongoose and the
 * aardvark sit at `legs: 0.60` rather than at `body: 1.5`.
 *
 * NO `threat` IS RECORDED. Six of these thirteen are genuinely threatened, but
 * `Threat.checkedDate` exists so a status is a dated reading of the Red List
 * rather than a memory — `registry.ts:55-76` makes that argument in full, and
 * writing categories here from recall would produce records that LOOK checked.
 * Absent is the honest state.
 */
import { defineSpecies } from '../define'
/*
 * Evaluated for its SIDE EFFECT, not for a name: each species module under
 * `parts/assembled/` registers its own build as it defines it, and
 * `defineSpecies` picks that up by id. Without this line the crocodile below
 * would find no assembly and would build as a bare hull.
 * `tests/island/assembly-constants.test.ts` fails loudly if it is ever dropped.
 */
import '../parts/assembled'
import type { Species } from '../types'

export const AFRICA_SPECIES: readonly Species[] = [
  /*
   * Zebra. A horse the kit has never been given a horse to copy, so the read is
   * carried by three things at once: long legs (1.50, the second-leggiest here),
   * `mane`, and a palette that is chalk with a black mane, black tail brush and
   * a black nose. The kit has NO stripe geometry and roster §1 forbids sculpting
   * one, so the stripes live in the album placard and in the child's head; what
   * the silhouette owes is "small-headed, long-legged, upright-eared, maned",
   * and that is what is written here.
   */
  defineSpecies('animal-zebra', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.10,
      body: 1.15,
      head: 0.85,
      legs: 1.50,
      ears: 'pointed',
      tail: 'tuft',
      extras: ['mane'],
      palette: { coat: 0xf2ece0, belly: 0xfffdf6, detail: 0x2a2724, accent: 0x1c1a18 },
    },
  }),

  /*
   * Hippo. THE TEST OF THE HEIGHT CLAMP (1.2–2.6): the biggest thing in the
   * collection, and still 2.20 rather than the 2.6 the clamp would allow,
   * because 2.6 is already "at the edge of the family" by the kit's own note and
   * this has to stand beside `animal-fox` at 1.69 without looking like a guest.
   *
   * Everything else says mass instead. `body: 0.80` is the short-and-deep end of
   * the multiplier — the kit trades length for girth at roughly constant volume,
   * so a LOW body number is what makes a barrel — `legs: 0.45` puts almost no
   * daylight under it, and `head: 1.45` is the single strongest read: a hippo is
   * mostly head. `ears: 'none'` is the kit's own advice at quadruped.ts:376,
   * "a hippo has no ears worth a mesh at this size". `tusks` are the lower
   * canines, which is the one part of a hippo a child draws.
   */
  defineSpecies('animal-hippo', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.20,
      body: 0.80,
      head: 1.45,
      legs: 0.45,
      ears: 'none',
      tail: 'stub',
      extras: ['tusks'],
      palette: { coat: 0x8a7a82, belly: 0xd6a394, detail: 0x6a5c63, accent: 0x4a3f45 },
    },
  }),

  /*
   * Cheetah. MUST NOT READ AS `animal-tiger` OR `animal-lion`, both of which are
   * frozen (roster §1) — they will never move, so all the separation is on this
   * side of the line.
   *
   * The lion's read is a big maned head on a heavy body; the tiger's is bulk and
   * stripes. So the cheetah is given the opposite of both: `head: 0.78` (the
   * smallest skull in the collection — a real cheetah's head is famously small
   * for its body) and `legs: 1.70`, the leggiest thing here. No `mane`, and a
   * `thin` tail rather than the lion's brush.
   *
   * PALETTE IS THE ONLY MARKING CHANNEL. The kit has no spot geometry and none
   * may be added, so the spots are carried by a dark `detail` on the paws and a
   * near-black `accent` on the nose against a bright tawny coat — the same
   * light-body/dark-points contrast the spots actually produce at three metres.
   * Reaching for a bespoke spot part here is the failure this phase exists to
   * avoid.
   */
  defineSpecies('animal-cheetah', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.00,
      body: 1.20,
      head: 0.78,
      legs: 1.70,
      ears: 'round',
      tail: 'thin',
      extras: ['whiskers'],
      palette: { coat: 0xd9a03f, belly: 0xfbf0da, detail: 0x33241a, accent: 0x241a12 },
    },
  }),

  /*
   * Meerkat. Half of the meerkat/mongoose problem (they are close cousins and
   * genuinely similar animals), so the three separations are stated deliberately
   * and all three point the same way:
   *
   *   SMALLER   1.50 against the mongoose's 1.60 — as far apart as this pack's
   *             own range honestly allows.
   *   PALER     sand and cream, against the mongoose's grey-brown.
   *   UPRIGHTER `body: 0.82` with `legs: 1.20`. That is the sentry pose as far
   *             as a four-legged kit can say it: a short trunk carried high.
   *             The mongoose is the mirror image, 1.30 on 0.60.
   *
   * No extras. A meerkat's signature is the dark eye patch, and there is no part
   * in the closed list for one — `types.ts:142` closes that list precisely so a
   * species cannot invent a part. Better a meerkat separated by proportion than
   * a meerkat wearing something it does not have.
   */
  defineSpecies('animal-meerkat', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.50,
      body: 0.82,
      head: 1.05,
      legs: 1.20,
      ears: 'round',
      tail: 'thin',
      palette: { coat: 0xd7c39c, belly: 0xf6ecd6, detail: 0x8a7454, accent: 0x4a3c2a },
    },
  }),

  /*
   * Warthog. `animal-hog` is already the wild boar and is FROZEN, so this must
   * not read as it. A boar is a low, heavy, short-legged wedge; a warthog is the
   * comparatively long-legged, big-headed one that trots with its tail straight
   * up. So `legs: 1.00` (a whole reference leg, high for something this heavy),
   * `head: 1.15`, and `tail: 'tuft'` — a bare stalk with a brush on the end,
   * which is the only tail in the kit that is literally the warthog's aerial.
   *
   * `tusks` as briefed. `mane` is the dorsal crest of coarse hair, and here it
   * doubles as the second thing holding it off the boar.
   */
  defineSpecies('animal-warthog', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.70,
      body: 1.05,
      head: 1.15,
      legs: 1.00,
      ears: 'pointed',
      tail: 'tuft',
      extras: ['tusks', 'mane'],
      palette: { coat: 0x7b6752, belly: 0xa89179, detail: 0x453729, accent: 0x2c221a },
    },
  }),

  /*
   * Gorilla. Half of the gorilla/baboon problem — both apes, and the kit has one
   * body for both. The levers, per the brief, are head, `mane` and proportion,
   * and they are pushed apart in every one of the three:
   *
   *   HEAD   1.15 against the baboon's 1.00, and NO `snout`. That is the whole
   *          difference between an ape face and a dog face, and the kit's
   *          `snout` case (a long two-box muzzle, quadruped.ts:481) is exactly a
   *          baboon's and exactly not a gorilla's.
   *   MANE   the gorilla has none. It gets `hump` instead, which the kit places
   *          FORWARD of centre (`len * 0.12`) — so it lands over the shoulders
   *          and reads as the silverback's crest and shoulder mass rather than
   *          as a camel's back.
   *   PROP   `legs: 0.70` and `body: 0.90`: a knuckle-walker is a deep chest
   *          close to the ground. The baboon stands at 0.95.
   *
   * And `tail: 'none'` — no great ape has one, and it is the cheapest, loudest
   * separation available.
   */
  defineSpecies('animal-gorilla', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.00,
      body: 0.90,
      head: 1.15,
      legs: 0.70,
      ears: 'round',
      tail: 'none',
      extras: ['hump'],
      palette: { coat: 0x33302f, belly: 0x55504e, detail: 0x1b1918, accent: 0x121110 },
    },
  }),

  /*
   * THE CROCODILE — the fourteenth, and the first of this collection's three
   * absences to be filled.
   *
   * It has no `build` and no numbers here at all, which is the whole point. The
   * ruling above still stands word for word — the quadruped kit stands its legs
   * under the body and gives it a cube skull, and a crocodile expressed through
   * it is a lizard-shaped dog — so it was never going to be filled in by adding
   * numbers to this file. `bespoke` sends it to the ASSEMBLY kit, which places
   * bank parts one at a time, and `parts/assembled/animal-crocodile.ts` carries
   * every measurement with the reason beside it: the elephant's trunk stretched
   * flat as a jaw, the cat's ear repeated as dorsal scutes, the beaver's paddle
   * as the tail, and the leg row pushed out to the exact edge of the hull's
   * footprint, which is as sprawled as a fixed leg row can honestly go.
   *
   * THE OSTRICH AND THE VULTURE ARE STILL ABSENT AND STILL MUST NOT BE
   * IMPROVISED. Both want wings; the bank has no `wing` shape at all, and the
   * pack's own birds have none either. That is a look decision and it is Joe's.
   *
   * Its palette is proposed there rather than agreed here, because this species
   * was never in this file to be given one. It is FLAGGED and Joe has not seen
   * it — along with the deliberate absence of teeth, which brief §19's "bright,
   * never scary" is the reason for.
   */
  defineSpecies('animal-crocodile', 'bespoke'),

  /*
   * Antelope. The impala/gazelle read: `head: 0.70`, the smallest here, on
   * `legs: 1.62` — second only to the cheetah, which is the other thing in this
   * collection built out of leg. `ears: 'long'` is not the bunny it was written
   * for — a gazelle's ears really are that big against that small a skull, and
   * it is what keeps this off the zebra, which is the other tall pointed-eared
   * thing in the collection.
   *
   * 1.62 rather than the 1.75 the animal deserves, because the ears set the
   * pre-fit height and the fit then divides the width by it: at 1.75 this came
   * out at width/height 0.59, which is inside the kit's bound and outside what
   * the measured pack looks like (mean 0.97). Legs are the cheapest thing to
   * give back.
   *
   * `horns` rather than `antlers`: the kit's horns are two short back-swept
   * stubs, which is an antelope; antlers are a branched beam, which is the deer
   * this is not. `tail: 'stub'` — the flicking white scut.
   */
  defineSpecies('animal-antelope', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.95,
      body: 0.95,
      head: 0.70,
      legs: 1.62,
      ears: 'long',
      tail: 'stub',
      extras: ['horns'],
      palette: { coat: 0xc98a49, belly: 0xfaf1e0, detail: 0x6d4a29, accent: 0x2f2318 },
    },
  }),

  /*
   * Mongoose. The other half of the meerkat pair, and the inverse of it in every
   * one of the three axes named above: taller (1.60), darker (grey-brown against
   * sand), and LONG AND LOW rather than upright — `body: 1.30` on `legs: 0.60`.
   *
   * `tail: 'bushy'` is the fourth separation and the one a child will actually
   * see: a mongoose drags a thick tapering brush, a meerkat carries a thin
   * whip. It is also why `body` stops at 1.30 rather than going for the 1.55
   * ceiling — a bushy tail is depth, and depth is keep-out.
   */
  defineSpecies('animal-mongoose', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.60,
      body: 1.30,
      head: 0.85,
      legs: 0.60,
      ears: 'round',
      tail: 'bushy',
      palette: { coat: 0x8b7a5c, belly: 0xc3b18f, detail: 0x51452f, accent: 0x33291d },
    },
  }),

  /*
   * Hyena. The one animal in the collection whose whole silhouette is a slope:
   * high at the shoulder, low at the hip. The kit cannot tilt a spine, but
   * `hump` sits over the FRONT of the back (quadruped.ts:501, `len * 0.12`) and
   * in coat colour, so it reads as the shoulder rise rather than as a saddle.
   * That plus `head: 1.05` — the heavy jaw — is the hyena.
   *
   * It shares `hump` with the gorilla and the wildebeest, which is fine and is
   * what a closed extras list is FOR: three animals that genuinely have a
   * shoulder mass, held apart by everything else on the record (the gorilla has
   * no tail and half the leg; the wildebeest has horns, a mane and upright ears).
   */
  defineSpecies('animal-hyena', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.85,
      body: 1.15,
      head: 1.05,
      legs: 1.15,
      ears: 'round',
      tail: 'bushy',
      extras: ['hump'],
      palette: { coat: 0xa3906a, belly: 0xc6b48e, detail: 0x4b3f2e, accent: 0x2d2519 },
    },
  }),

  /*
   * Baboon. The dog-faced monkey, and `snout` is the reason it is not the
   * gorilla: the kit's snout is a long muzzle with an accent tip, and the accent
   * here is the one warm red in the collection (0x8f4535) so the muzzle carries
   * the baboon's bare pink-red face rather than disappearing into the coat.
   *
   * `mane` is the cape over the shoulders, `tail: 'thin'` is the kinked tail
   * carried out behind — the gorilla has neither. Olive-brown against the
   * gorilla's charcoal completes it.
   */
  defineSpecies('animal-baboon', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.80,
      body: 1.10,
      head: 1.00,
      legs: 0.95,
      ears: 'round',
      tail: 'thin',
      extras: ['snout', 'mane'],
      palette: { coat: 0x7c6b48, belly: 0xbfa77f, detail: 0x4a3c26, accent: 0x8f4535 },
    },
  }),

  /*
   * Wildebeest. Half of the wildebeest/buffalo problem — two large horned
   * bovines, which roster §4's whole point is that they will read as duplicates
   * unless separated on purpose. The three channels the brief names:
   *
   *   SIZE    2.05 on `legs: 1.35`. The wildebeest is the leggy, narrow,
   *           galloping one; the buffalo is 2.15 on 0.85, a wall on short legs.
   *           That is a half-reference-leg apart, the widest leg gap between any
   *           two large animals here.
   *   HORNS   the SAME kit part, read differently by what surrounds it. Against
   *           `ears: 'pointed'` and a `mane`, the stubs read as the wildebeest's
   *           thin cow-horns; against the buffalo's `ears: 'round'` and nothing
   *           else on the head, they read as a heavy boss.
   *   PALETTE slate blue-grey, against the buffalo's warm brown-black.
   *
   * Three extras, the maximum: `horns`, `mane` (the shaggy neck and beard —
   * every child's drawing of a gnu has it) and `hump` for the high shoulder.
   */
  defineSpecies('animal-wildebeest', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.05,
      body: 1.10,
      head: 0.95,
      legs: 1.35,
      ears: 'pointed',
      tail: 'tuft',
      extras: ['horns', 'mane', 'hump'],
      palette: { coat: 0x5d5b60, belly: 0x807e86, detail: 0x312f33, accent: 0x1d1c1f },
    },
  }),

  /*
   * Buffalo. The other half. Everything the wildebeest is not: the heaviest
   * animal in the collection after the hippo (2.15), on the shortest legs of
   * anything tall (0.85), with the second-largest head (1.10) and NOTHING on it
   * but the horns — no mane, no hump — so the boss is the only thing above the
   * eyes and reads as mass rather than as decoration.
   *
   * `ears: 'round'` is the drooping fringed ear under the horn, and it is the
   * single field that most cheaply tells a child at three metres which bovine
   * this is. Warm brown-black; it shares "near black" with the gorilla and
   * nothing else, and the gorilla has no tail, no horns and 0.70 legs.
   */
  defineSpecies('animal-buffalo', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.15,
      body: 1.00,
      head: 1.10,
      legs: 0.85,
      ears: 'round',
      tail: 'tuft',
      extras: ['horns'],
      palette: { coat: 0x413a36, belly: 0x5f5651, detail: 0x272220, accent: 0x151211 },
    },
  }),

  /*
   * Aardvark. `snout` as briefed, and the kit's snout case genuinely earns it:
   * quadruped.ts:481 builds a long two-box taper standing proud of the muzzle
   * with an accent tip, which is the anteater it names in its own comment. That
   * is the aardvark's whole face.
   *
   * `ears: 'long'` for the rabbit ears it really has — the other long-eared
   * animal here is the antelope, at 1.95 tall on 1.75 legs with a stub tail,
   * which is the opposite creature. Low and long is bought with `legs: 0.60`
   * and `height: 1.60`, not with `body`, for the keep-out reason in the header.
   *
   * No `hump` for the arched back. It would be honest, but the aardvark already
   * carries a snout, and a third animal wearing the same shoulder lump as the
   * hyena buys less separation than the palette does — pinkish-buff, the one
   * bare-skinned coat in the collection.
   */
  defineSpecies('animal-aardvark', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.60,
      body: 1.25,
      head: 0.80,
      legs: 0.60,
      ears: 'long',
      tail: 'thin',
      extras: ['snout'],
      palette: { coat: 0xc2ab95, belly: 0xded0be, detail: 0x8b7660, accent: 0x6d5947 },
    },
  }),
]
