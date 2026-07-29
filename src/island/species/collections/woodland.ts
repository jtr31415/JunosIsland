/**
 * The Woodland collection — roster row 9, `ship: 10`, name band `medium`.
 *
 * PB-036 phase 2. `roster.ts` says which species exist; this file says what
 * fourteen of Woodland's sixteen ARE, as `QuadrupedBuild` data. Nothing here
 * builds geometry — every number is a multiplier off the one reference
 * silhouette in `kits/quadruped.ts`, so retuning the whole collection is an edit
 * to `REF` and not to this file.
 *
 * SHIPS PARTIAL, DELIBERATELY. Woodland has sixteen members and this file has
 * fourteen. `animal-pheasant` and `animal-capercaillie` are game birds: they
 * need the songbird kit (or a bespoke one) and neither is built — `kit.ts`
 * throws `UnbuiltKitError` for both by name. A bird pressed into the quadruped
 * kit is a four-legged pheasant, which is the exact failure roster §1's "kits
 * before species" rule exists to prevent, so they are ABSENT rather than
 * approximated. `tests/island/species-woodland.test.ts` asserts their absence by
 * name so nobody half-fills the collection later without noticing.
 *
 * WHY THE NUMBERS ARE STOCKIER THAN THE ANIMALS. All 24 live GLBs were measured
 * (see the `REF` comment in `kits/quadruped.ts`): the pack is 1.43–2.02 tall,
 * mean 1.65, mean width/height 0.97. A brown bear built at true anatomical
 * proportions beside `animal-fox` (1.25 x 1.69 x 2.31, W/H 0.74) is a stranger,
 * which roster §1 forbids. So this collection's bear and its chipmunk differ by
 * far less than reality — 2.00 against 1.50 — and that is correct for this pack.
 *
 * WHY NO LENGTH IS EXPRESSED THROUGH `body`. `pets.ts:652` sets a pet's obstacle
 * keep-out to `max(width, depth) / 2`, so LENGTH IS CHARGED FOR: the kit header
 * records a `body: 1.9` stoat coming out 4.0 units deep, unable to walk between
 * two trees. `body` clamps at 1.55, and no member here goes near it by accident.
 *
 * AND A COROLLARY THE KIT HEADER DOES NOT STATE, found by measuring this
 * collection rather than by reading. The kit's advice is to express long-and-low
 * by "dropping `legs` and `height` instead, which costs nothing" — but the fit
 * (`quadruped.ts:588-597`) is UNIFORM and solves for height, so dropping `legs`
 * lowers the raw silhouette, raises the fit scale, and the body gets LONGER in
 * world units. A stoat at `body: 1.55, legs: 0.28` measured 3.56 deep, a keep-out
 * of 1.78 — worse than the pack's widest (the fox, 1.17) and worse than the kit's
 * own worked "plausible stoat" (`kit-quadruped.test.ts:93`, which measures 1.59).
 * So low legs are not free: every long member below is tuned against the measured
 * keep-out, not against the multipliers, and the ceiling held is 1.6.
 *
 * WHY THERE ARE NO `threat` RECORDS. Roster §5 wants statuses "true, checkable",
 * and `Threat.checkedDate` exists so a status is a dated reading of the Red List
 * rather than a memory. Writing categories here from recall would produce
 * records that LOOK checked. Absent means "not recorded yet", which is honest;
 * `registry.ts:55-76` holds the same line for the base 24.
 *
 * ROSTER §4 LIVES HERE. Woodland carries more of the confusable-silhouette list
 * than any other collection: otter/mink/coypu against each other and against
 * `animal-beaver`; hare against `animal-bunny`; bear against `animal-polar` and
 * `animal-panda`; plus three mustelids and two cats internally. The live 24 are
 * FROZEN, so every one of those separations is made on this side, in proportion
 * and palette, and is written down at the species it belongs to.
 */
import { defineSpecies } from '../define'
import type { Species } from '../types'

/**
 * Fourteen of Woodland's sixteen, in the roster's own member order with the two
 * game birds skipped.
 */
export const WOODLAND_SPECIES: readonly Species[] = [
  /*
   * BEAR — roster §4 "bear: … polar *(base)* / panda *(base)*".
   *
   * `animal-polar` measures 1.25 x 1.50 x 1.50 and `animal-panda` is the pack's
   * black-and-white one; both are frozen GLBs, so all three separations are made
   * here. Height 2.00 puts this bear a full third taller than the polar bear —
   * the field scales every pet by the same 0.16 (`pets.ts:643`), so height is
   * real size on screen and a brown bear reading BIGGER than a polar bear is the
   * cheapest true difference available. `hump` is the grizzly shoulder, which
   * neither of the frozen two has, and the coat is warm brown against white and
   * against black-and-white. `legs: 0.62` keeps it heavy rather than tall-legged;
   * `head: 1.05` and `snout` give the long dished muzzle a panda has not got.
   */
  defineSpecies('animal-bear', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.0, body: 0.95, head: 1.05, legs: 0.62,
      ears: 'round', tail: 'stub', extras: ['snout', 'hump'],
      palette: { coat: 0x8a5a2e, belly: 0xc39a68, detail: 0x5c3a1c, accent: 0x3a2410 },
    },
  }),

  /*
   * OTTER — roster §4 "otter / giant otter / mink / coypu / beaver *(base)*".
   *
   * Against the frozen `animal-beaver`, whose whole read is the paddle: the
   * beaver wears `tail: 'flat'`, so this one wears `thin` and never `flat`.
   * Against mink and coypu below, the otter is the LONGEST and the LOWEST of the
   * three (`body: 1.30`, `legs: 0.44`) with the biggest head (`0.92`) — a broad
   * flat skull is what an otter actually reads as at pet scale — and it is the
   * only one of the three carrying `whiskers`. Chestnut coat over a pale cream
   * throat, against the mink's near-black and the coypu's coarse mid-brown.
   *
   * `legs: 0.44` and not lower: see the corollary in the file header. Measured,
   * a leggier otter is a SHORTER one, and at 0.32 this animal's keep-out was 1.81.
   */
  defineSpecies('animal-otter', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.6, body: 1.3, head: 0.92, legs: 0.44,
      ears: 'round', tail: 'thin', extras: ['whiskers'],
      palette: { coat: 0x7d5433, belly: 0xe9d6b4, detail: 0x4e3320, accent: 0x2e1e12 },
    },
  }),

  /*
   * CHIPMUNK — the collection's small one, at 1.50 and not at the 0.6 reality
   * would ask for. See the file header: the measured pack floors at 1.43.
   *
   * The size that is left is spent on the head: `head: 1.15` with `body: 0.85`
   * is the cheek-pouched, short-bodied read, and it is the only member here with
   * a head bigger than its reference. The bushy tail is carried up by the kit
   * (`quadruped.ts:390-399`), which is exactly how a chipmunk holds it.
   */
  defineSpecies('animal-chipmunk', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.5, body: 0.85, head: 1.15, legs: 0.45,
      ears: 'round', tail: 'bushy', extras: ['whiskers'],
      palette: { coat: 0xc07a34, belly: 0xf6e6c8, detail: 0x6b4520, accent: 0x33200f },
    },
  }),

  /*
   * ELK — the tall one, and the only antlered animal in the collection.
   *
   * `legs: 1.35` is what makes it: nothing else in Woodland stands above 1.10
   * except the hare, and the hare's legs come with `ears: 'long'`, so the two
   * cannot be confused from any angle. Held apart from the frozen `animal-deer`
   * by the antlers, which the kit keeps inside the body's own width so a stag
   * does not walk round the island with a hedge's keep-out (`quadruped.ts:453`).
   */
  defineSpecies('animal-elk', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.0, body: 1.1, head: 0.95, legs: 1.35,
      ears: 'pointed', tail: 'stub', extras: ['antlers', 'snout'],
      palette: { coat: 0x7d5a34, belly: 0xd9c396, detail: 0x4b3320, accent: 0x2f2013 },
    },
  }),

  /*
   * PINE MARTEN — mustelid one of three (with stoat and mink).
   *
   * The ARBOREAL one, so it is the tallest-legged and shortest-bodied of the
   * three (`legs: 0.62`, `body: 1.15`): a marten climbs, a stoat pours itself
   * down a hole. It is also the only mustelid here with `pointed` ears. The
   * yellow bib is real and is the one marking a child could name, so it goes in
   * `belly`, where the kit paints the underside, the muzzle and nothing else.
   */
  defineSpecies('animal-pine-marten', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.55, body: 1.15, head: 0.88, legs: 0.62,
      ears: 'pointed', tail: 'bushy',
      palette: { coat: 0x5a3a1e, belly: 0xf2cf70, detail: 0x3a2410, accent: 0x21140a },
    },
  }),

  /*
   * STOAT — the extreme of long-and-low, and the reason the `body` clamp exists.
   *
   * It has the longest body and the lowest legs in the collection, and the
   * numbers are held BACK from where the type would allow: `body` clamps at 1.55
   * and this stoat sits at 1.45 with `legs: 0.40`, because at 1.55/0.28 it
   * measured 3.56 units deep — a keep-out of 1.78, worse than the pack's widest.
   * That is the kit header's own worked failure arriving by a different route;
   * see the corollary at the top of this file. 1.45/0.40 measures 1.58, which is
   * where the kit's own reference stoat lands (`kit-quadruped.test.ts:93`).
   *
   * `head: 0.70` is the smallest in the collection: a stoat's skull is barely
   * wider than its neck, which is most of the animal's read. Chestnut over a
   * white belly; the black tail tip the kit has no part for is not faked.
   */
  defineSpecies('animal-stoat', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.4, body: 1.45, head: 0.7, legs: 0.4,
      ears: 'round', tail: 'thin',
      palette: { coat: 0xb0713a, belly: 0xfaf4e6, detail: 0x2a1b0e, accent: 0x1a1109 },
    },
  }),

  /*
   * LYNX — cat one of two (with the wildcat).
   *
   * `tufted` ears are the lynx's, and the kit gives the tuft the ACCENT colour
   * because a tuft the same colour as the ear is invisible at 0.16 scale
   * (`quadruped.ts:363-366`) — so the accent here is deliberately dark against a
   * pale silvery coat. Beyond the ears the separation from the wildcat is size
   * and stance: 1.90 against 1.65, `legs: 1.10` against 0.80 (a lynx is famously
   * long in the leg), and the bobbed `stub` tail against the wildcat's bushy one.
   */
  defineSpecies('animal-lynx', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.9, body: 1.0, head: 1.0, legs: 1.1,
      ears: 'tufted', tail: 'stub', extras: ['whiskers'],
      palette: { coat: 0xc2a26f, belly: 0xf7eeda, detail: 0x6d5133, accent: 0x3b2b19 },
    },
  }),

  /*
   * SKUNK — the one animal in the collection a child identifies by MARKING
   * rather than by shape, and the kit has no stripe part. So the marking is
   * spent through the palette instead: a near-black coat, `belly` white (the kit
   * paints the underside, the muzzle AND the bushy tail's tip with it —
   * `quadruped.ts:396`, so the tail flashes white the way it should), and an
   * `accent` that is white too, because accent is the nose and the snout tip and
   * that is where the facial blaze goes. It is the only member here whose accent
   * is lighter than its coat, and that is on purpose, not a transposition.
   */
  defineSpecies('animal-skunk', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.55, body: 1.1, head: 0.85, legs: 0.45,
      ears: 'round', tail: 'bushy', extras: ['snout'],
      palette: { coat: 0x201c1a, belly: 0xf7f4ec, detail: 0x35302c, accent: 0xf2eee2 },
    },
  }),

  /*
   * PORCUPINE — `spines`, which the kit draws as a ridge of rotated boxes down
   * the spine in the ACCENT colour (`quadruped.ts:505-514`). The accent is
   * therefore a pale bone-cream against a dark coat, so the quills read as quills
   * from three metres rather than as a slightly different back.
   *
   * Low and blunt: `legs: 0.40`, `head: 0.80`, `body: 1.05`. Nothing else in
   * Woodland wears `spines`, so it is unmistakable from any angle.
   */
  defineSpecies('animal-porcupine', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.6, body: 1.05, head: 0.8, legs: 0.4,
      ears: 'round', tail: 'stub', extras: ['spines', 'snout'],
      palette: { coat: 0x4b3524, belly: 0x9b8262, detail: 0x2d2015, accent: 0xe6d9b6 },
    },
  }),

  /*
   * WOLVERINE — a mustelid built like a small bear, which is the whole problem:
   * it shares `round` ears, a `bushy` tail and a `snout` with the skunk above.
   * The separation is proportion and it is deliberately wide — 1.75 against the
   * skunk's 1.55, `legs: 0.60` against 0.45, `body: 1.12` against 1.10 — plus a
   * dark brown coat with the real tan flank blaze in `belly`, against black and
   * white. Against the BEAR it is shorter (1.75 v 2.00), longer in the body, has
   * a bushy tail where the bear has a stub, and carries no `hump`.
   */
  defineSpecies('animal-wolverine', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.75, body: 1.12, head: 0.95, legs: 0.6,
      ears: 'round', tail: 'bushy', extras: ['snout'],
      palette: { coat: 0x402c1b, belly: 0xc79a52, detail: 0x281a10, accent: 0x16100a },
    },
  }),

  /*
   * HARE — roster §4 "hare / arctic hare / bunny *(base)* / jackalope".
   *
   * `animal-bunny` is the tallest thing in the frozen pack (2.13) and is built
   * as a compact sitting rabbit, so height alone cannot do the work here. What
   * does it is the LEGS: `legs: 1.50` is the highest in this collection by a
   * clear margin, and a hare that stands up off the ground on long back legs is
   * the difference a child actually points at. Add a longer body (1.05 against a
   * bunny's crouch) and a tawny field coat rather than the bunny's soft grey.
   */
  defineSpecies('animal-hare', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.0, body: 1.05, head: 0.8, legs: 1.5,
      ears: 'long', tail: 'stub',
      palette: { coat: 0xb4874a, belly: 0xf3e7cd, detail: 0x6a4a26, accent: 0x2c1e10 },
    },
  }),

  /*
   * WILDCAT — cat two of two, and it also has to stand apart from the frozen
   * `animal-cat`.
   *
   * Against the LYNX: smaller (1.65 v 1.90), shorter in the leg (0.80 v 1.10),
   * `pointed` ears rather than `tufted`, and a thick `bushy` tail rather than the
   * lynx's bob — the tail is the wildcat's field mark in real life too.
   * Against the frozen house cat: a heavier body (1.10) and a grey-brown tabby
   * coat instead of a pet's flat colour.
   */
  defineSpecies('animal-wildcat', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.65, body: 1.1, head: 0.95, legs: 0.8,
      ears: 'pointed', tail: 'bushy', extras: ['whiskers'],
      palette: { coat: 0x8f7c5b, belly: 0xe2d6bb, detail: 0x50432f, accent: 0x2b2318 },
    },
  }),

  /*
   * MINK — roster §4, third against otter/coypu/beaver, and mustelid three of
   * three against stoat and pine marten.
   *
   * It sits BETWEEN the otter and the stoat in every proportion, which is what a
   * mink is, so the honest reads are the tail and the colour. Its tail is
   * `bushy` where the otter's and the stoat's are `thin`; its coat is the darkest
   * brown in the collection after the skunk, against the otter's chestnut and the
   * stoat's russet, with a small white chin in `belly` — the marking mink are
   * told apart by. No `whiskers`, which the otter has and which is the other half
   * of that pair's separation. Its `legs: 0.48` sit between the stoat's 0.40 and
   * the marten's 0.62, which is the order those three actually stand in.
   */
  defineSpecies('animal-mink', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.45, body: 1.22, head: 0.76, legs: 0.48,
      ears: 'round', tail: 'bushy',
      palette: { coat: 0x38271c, belly: 0xece3d2, detail: 0x241810, accent: 0x140d08 },
    },
  }),

  /*
   * COYPU — roster §4's fourth, and the one closest to the frozen
   * `animal-beaver`: same wetland, same coarse brown, same blunt rodent head.
   *
   * The beaver's read is the paddle tail, so the coypu gets `thin` — a coypu's
   * tail IS a bare rat's tail and that is the true difference, not a made-up one.
   * `hump` is the arched back a coypu carries out of the water, and it is what
   * separates the silhouette from the otter's flat back at a glance. Against the
   * otter and the mink it is much shorter in the body (1.00 against 1.30 and
   * 1.22) with a big blunt head (1.00), because a coypu is a rodent shaped like a
   * rodent and the mustelids are tubes.
   */
  defineSpecies('animal-coypu', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.52, body: 1.0, head: 1.0, legs: 0.45,
      ears: 'round', tail: 'thin', extras: ['whiskers', 'hump'],
      palette: { coat: 0x8b6a41, belly: 0xe6d3ab, detail: 0x5b4128, accent: 0x342519 },
    },
  }),
]
