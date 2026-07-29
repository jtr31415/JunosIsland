/**
 * Home Pets — the animals a child might actually keep, as build data.
 *
 * PB-036 phase 2, roster row 7, ship 2 (Joe's own proposed order puts this
 * second, behind Garden), name band `short`. `registry.ts:16-23` states the
 * recipe this file follows: one `Species` record per member, each with a `build`
 * its kit understands, and every printed name pulled out of the roster by
 * `defineSpecies` so a typo is a thrown error at module load rather than a pet
 * called "Hamstre" forever.
 *
 * THIS COLLECTION SHIPS PARTIAL, ON PURPOSE. The roster lists sixteen members;
 * ten are here. The six absent ones are absent because their kits do not exist
 * (`kit.ts:66-74`), not because they were forgotten:
 *
 *     animal-budgie, animal-canary, animal-cockatiel, animal-lovebird
 *                                                     -> songbird kit, unbuilt
 *     animal-corn-snake  -> legless; roster §1 puts the snake in `bespoke`
 *     animal-goldfish    -> swim kit, unbuilt
 *
 * `tests/island/species-home-pets.test.ts` names all six and asserts they are
 * ABSENT, so the day someone half-fills this file with a quadruped budgie the
 * suite says so. `registry.ts:11-14` — "do not finish this file" — applies here
 * exactly as it applies there.
 *
 * NO THREAT STATUS IS RECORDED. Same reason as `registry.ts:55-76`: roster §5
 * wants facts that are "true, checkable", and `Threat.checkedDate` exists so a
 * status is a dated reading of the Red List rather than a memory. None of these
 * ten has been read off the Red List, so none carries a status. An absent status
 * means "not checked yet", which is honest; a remembered one only looks checked.
 *
 * ---------------------------------------------------------------------------
 * THE HARD PART OF THIS COLLECTION IS THE SIX RODENTS.
 *
 * Hamster, guinea pig, gerbil, chinchilla, rat and degu are six small brown-ish
 * rodents in one album page, and roster §4's warning about confusable
 * silhouettes applies to them even though it does not list them by name. Palette
 * cannot carry it — four of the six are some shade of sandy brown in life, and
 * making them different colours to tell them apart would be a lie a child can
 * check against a picture book.
 *
 * So the separation is carried by PART CHOICE first, because that is what
 * survives being seen at 0.16 scale from the island's three-quarter camera, and
 * the tails genuinely differ in the real animals:
 *
 *     hamster     stub    round     a Syrian hamster's tail is a nub
 *     guinea pig  none    round     the only tailless rodent here, and famously so
 *     gerbil      tuft    pointed   thin, furred, with a brush on the end
 *     chinchilla  bushy   round     the squirrel-thick tail, and huge ears
 *     rat         thin    round     bare and long; the one everyone can name
 *     degu        tuft    round     tufted like a gerbil's, but a bigger animal
 *
 * Gerbil and degu are the one genuine tail collision, and they are separated by
 * the ear (a degu's are big and round, a gerbil's are small and folded back) and
 * by size — a degu is roughly rat-sized and a gerbil is not. Every pair is then
 * separated a SECOND time by proportion, with real margins, and the test asserts
 * both halves rather than trusting this comment.
 * ---------------------------------------------------------------------------
 *
 * ON THE NUMBERS. Every field except `height` is a multiplier off the kit's
 * reference silhouette (`kits/quadruped.ts:80-94`), and the reference is
 * fox-shaped. Two consequences worth stating once, because they explain nearly
 * every number below:
 *
 *   - THESE ARE CUBE PETS, NOT ANIMALS. The measured pack is 1.43-2.02 tall with
 *     a mean width/height of 0.97 (quadruped.ts:56-74). A hamster at true
 *     anatomical proportions is a stranger beside `animal-fox`, which roster §1
 *     forbids, so every rodent here is short-bodied, chunky and big-headed
 *     relative to life. `head` above 1 on the small rodents is doing exactly
 *     that work — it is also, per `types.ts:118`, "the single strongest read of
 *     what animal is this".
 *   - LENGTH IS CHARGED FOR. `pets.ts:652` makes the obstacle keep-out
 *     `max(width, depth) / 2`, and the kit's fit scales the whole rig up to
 *     `height` — so a long, low animal built by pushing `body` and dropping
 *     `legs` gets scaled up hard and walks around with a badger's keep-out.
 *     `quadruped.ts:104-110` says the same thing. The ferret is the animal that
 *     wants that treatment most and it is the one whose `body` is held back and
 *     whose `height` is dropped instead; the test measures the keep-out rather
 *     than taking this paragraph's word for it.
 */
import { defineSpecies } from '../define'
import type { Species } from '../types'

export const HOME_PETS_SPECIES: readonly Species[] = [
  /*
   * Hamster — the roundest thing in the collection.
   *
   * Short body and a big head, which is the pair of levers that says "pocket
   * rodent" before the tail is even visible. Legs almost absent: a Syrian
   * hamster's belly touches the floor. Golden coat with a pale underside is the
   * pet-shop Syrian, and the detail colour is the pink of ears and feet.
   */
  defineSpecies('animal-hamster', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.45,
      body: 0.82,
      head: 1.15,
      legs: 0.40,
      ears: 'round',
      tail: 'stub',
      palette: { coat: 0xd8a24a, belly: 0xfff1d8, detail: 0xe9b79c, accent: 0x8f5f24 },
    },
  }),

  /*
   * Guinea pig — the tailless one, and the flattest to the ground.
   *
   * `tail: 'none'` is the whole identity here and it is true to life. Body is
   * longer than the hamster's and legs are lower still (0.32, near the kit's
   * 0.25 floor), which gives the loaf-on-the-carpet read. Chestnut-and-white
   * because a Dutch-marked guinea pig is the one every child has seen: the coat
   * is chestnut, the detail colour paints the ears and paws white.
   */
  defineSpecies('animal-guinea-pig', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.50,
      body: 1.10,
      head: 1.00,
      legs: 0.32,
      ears: 'round',
      tail: 'none',
      palette: { coat: 0x9b5a33, belly: 0xf2e2c8, detail: 0xf5e6cc, accent: 0x2e211a },
    },
  }),

  /*
   * Gerbil — the leggy one.
   *
   * The only rodent here with legs near 0.8, and that is the honest read: a
   * gerbil stands up on its hind feet and hops, where a hamster shuffles. The
   * kit's `tuft` tail is a bare stalk with a brush on the end (quadruped.ts:414)
   * which is a gerbil's tail exactly. Ears `pointed` rather than round both
   * because a gerbil's are small and swept back and because it is the lever that
   * separates it from the degu, which shares its tail.
   *
   * Smallest height in the collection at 1.42 — it is the smallest animal in it.
   */
  defineSpecies('animal-gerbil', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.42,
      body: 1.18,
      head: 0.92,
      legs: 0.78,
      ears: 'pointed',
      tail: 'tuft',
      palette: { coat: 0xc79a5e, belly: 0xfaf0dd, detail: 0xe0bb86, accent: 0x6b4a2a },
    },
  }),

  /*
   * Pony — the one large animal on the page, and deliberately still a pony.
   *
   * Roster §1 offers "pony from horse" as a starting point, but there is no live
   * horse: the nearest relatives in the frozen 24 are `animal-deer` and
   * `animal-cow`, so this is built from the kit's reference rather than copied
   * off anything. Height 1.95 is at the top of the measured pack (1.43-2.02,
   * quadruped.ts:60) and NOT above it — a horse would want to break that ceiling
   * and a pony must not, or it stops being a pony and starts being a guest.
   *
   * `legs: 1.55` against `head: 0.85` is what carries "hoofed" rather than
   * "rodent": it is the only build here with legs above 1, and the only one
   * whose head is small against its body. `mane` and `snout` are the two extras
   * (`types.ts:127` allows three) — the mane is a collar behind the head
   * (quadruped.ts:491) and the snout is the long muzzle. Chestnut coat with a
   * near-black mane and tail brush, both painted by `accent`.
   */
  defineSpecies('animal-pony', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.95,
      body: 1.15,
      head: 0.85,
      legs: 1.55,
      ears: 'pointed',
      tail: 'tuft',
      extras: ['mane', 'snout'],
      palette: { coat: 0x8c5a30, belly: 0xd8b58a, detail: 0x3b2a1c, accent: 0x2f2119 },
    },
  }),

  /*
   * Ferret — long and low, within what the keep-out will pay for.
   *
   * The temptation is `body: 1.5` and `legs: 0.3`, and that is the exact trap
   * `quadruped.ts:104-110` documents. The rig is scaled up until it is `height`
   * tall, so the LOWER a creature is built the harder it is scaled — and its
   * length, which the obstacle radius charges for at `pets.ts:652`, is scaled
   * with it. Measured: `body: 1.30, legs: 0.46` gave this ferret a keep-out of
   * 1.45, worse than any animal in the live pack. `body: 1.18, legs: 0.58` and
   * a height dropped to 1.42 gives 1.28, and looks the same from the island
   * camera. The lesson generalises: on a low animal, `legs` buys keep-out.
   *
   * `snout` is the mustelid muzzle and is what stops it reading as a big rat;
   * the bushy tail is the other half of that. Sable colouring: cream body, dark
   * legs and paws (the detail colour), dark mask and nose (`accent`).
   */
  defineSpecies('animal-ferret', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.42,
      body: 1.18,
      head: 0.80,
      legs: 0.58,
      ears: 'round',
      tail: 'bushy',
      extras: ['snout'],
      palette: { coat: 0xd8c49c, belly: 0xf5ecd8, detail: 0x4a3524, accent: 0x33241a },
    },
  }),

  /*
   * Gecko — a lizard, built honestly out of the quadruped kit.
   *
   * It is the one member here where the kit had to be checked before it was
   * trusted, and it passes: a leopard gecko IS a four-legged animal with a broad
   * flat head, no external ear worth a mesh, and a long tail. `ears: 'none'` is
   * a real case in the kit (quadruped.ts:375) rather than an omission, and the
   * `thin` tail is a long box swept back (quadruped.ts:401) which is the right
   * shape. It is the lowest-slung member here — the belly-on-the-floor read is
   * the whole point — but `legs: 0.46` rather than the 0.30 it wants, for the
   * keep-out reason spelled out on the ferret above.
   *
   * What the kit CANNOT do is splay the legs sideways — they stay under the body
   * like a mammal's. At 0.16 scale, against a cube-pet pack, that is a stylistic
   * cost rather than a lie, and it is the same simplification the pack makes of
   * everything else. Leopard-gecko yellow with dark markings in `accent`.
   */
  defineSpecies('animal-gecko', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.40,
      body: 1.15,
      head: 1.00,
      legs: 0.46,
      ears: 'none',
      tail: 'thin',
      palette: { coat: 0xe8c85c, belly: 0xfaf0d0, detail: 0xd8a63c, accent: 0x4a3a1c },
    },
  }),

  /*
   * Chinchilla — the ears and the tail are the animal.
   *
   * Roundest body of the six rodents after the hamster (0.88) but noticeably
   * taller at 1.60, which is the "sits up like a ball on legs" read. Big round
   * ears and a squirrel-thick `bushy` tail are the two parts nothing else in the
   * collection pairs, and `whiskers` is the third signal — a chinchilla's are
   * absurdly long and it is the one place the extra is unarguably earned.
   *
   * Blue-grey with a white belly. This is the one rodent whose colour genuinely
   * does differentiate it, so it is used: no other member is grey.
   */
  defineSpecies('animal-chinchilla', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.60,
      body: 0.88,
      head: 1.05,
      legs: 0.55,
      ears: 'round',
      tail: 'bushy',
      extras: ['whiskers'],
      palette: { coat: 0x8f95a3, belly: 0xf2f1ee, detail: 0xb9bec9, accent: 0x3c4149 },
    },
  }),

  /*
   * Terrapin — the shell does the work.
   *
   * `shell` (quadruped.ts:516) is a dome in the accent colour with a rim in the
   * detail colour over the whole back, which is precisely a terrapin from three
   * metres away. Everything else is tuned to get out of its way: small head
   * (0.72, smallest here), legs near the floor, no ears, and a stub tail.
   *
   * Red-eared-slider colouring, which is the terrapin a child meets: olive skin,
   * a yellow-striped underside, a yellow shell rim and a darker olive dome.
   */
  defineSpecies('animal-terrapin', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.40,
      body: 1.05,
      head: 0.72,
      legs: 0.35,
      ears: 'none',
      tail: 'stub',
      extras: ['shell'],
      palette: { coat: 0x4e7a3c, belly: 0xe8d98a, detail: 0xf0d23c, accent: 0x2f4a22 },
    },
  }),

  /*
   * Rat — the long bare tail, and the only one that gets it.
   *
   * `thin` is shared with the gecko and nothing else, and the gecko has no ears
   * at all, so within the six rodents the bare tail is unambiguous. `whiskers`
   * is the second signal.
   *
   * `snout` was tried here and removed: it reads well but it pushes geometry
   * forward, and a long body plus a long tail plus a muzzle put the keep-out at
   * 1.41 — worse than anything in the live pack. The muzzle is the part a rat
   * can most afford to lose, so the ferret keeps `snout` and the rat does not,
   * which also separates the two most similar builds on the page.
   *
   * Longest rodent body here at 1.20, standing on real legs: a rat walks, it
   * does not shuffle like a hamster. Agouti brown-grey, with the pink ears,
   * feet and tail of a pet rat carried by the detail colour.
   */
  defineSpecies('animal-rat', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.55,
      body: 1.20,
      head: 0.86,
      legs: 0.78,
      ears: 'round',
      tail: 'thin',
      extras: ['whiskers'],
      palette: { coat: 0x6e6259, belly: 0xe6dccd, detail: 0xd8a99a, accent: 0x3a322c },
    },
  }),

  /*
   * Degu — a gerbil's tail on a rat-sized, more compact animal.
   *
   * The one deliberate tail collision in the collection (`tuft`, shared with the
   * gerbil) and it is kept because it is TRUE — both animals have a thin tail
   * with a brush on the end. The separation is therefore carried elsewhere and
   * carried hard: round ears against the gerbil's pointed ones (a degu's are
   * large and round, and that is the field mark), 1.62 tall against 1.42, and a
   * chunkier, shorter body (1.05 against 1.18). Legs 0.86 are the highest of the
   * six rodents — degus are upright, fast and diurnal, which is why they are the
   * one small rodent a child sees awake.
   *
   * Warm sandy brown, browner and darker than the gerbil's sand.
   */
  defineSpecies('animal-degu', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.62,
      body: 1.05,
      head: 0.90,
      legs: 0.86,
      ears: 'round',
      tail: 'tuft',
      palette: { coat: 0xa8804c, belly: 0xf0e2c6, detail: 0xc9a877, accent: 0x53381f },
    },
  }),
]
