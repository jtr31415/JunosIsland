# Rock hexes as a third tile type — a proposal

*Written 27 July 2026, for Joe's ruling before any of it is built.*

Joe's ask, verbatim:

> i'd like a bit more use of the mountain/rock hexes, pure grey, with green and
> with green and trees. there should be some pre-assembled ones. allow as a 3rd
> tile option after there are say 15 tiles already.

This is written up rather than built because it is **not a scenery change**. The
first two thirds of it already exist; the last third changes the save format, and
that is the part that deserves a decision rather than a commit.

---

## 1. What already exists

The KayKit hexagon pack ships exactly what Joe describes, and `props.ts` already
plants most of it — as SCENERY on a grass tile, not as a tile in its own right:

| Joe's phrase | Models in the pack | Used today |
|---|---|---|
| "pure grey" | `mountain_A`, `mountain_B`, `mountain_C` | **No** — deliberately excluded |
| "with green" | `mountain_A_grass`, `_B_grass`, `_C_grass` | Yes, weight 1 each in `highland` |
| "with green and trees" | `mountain_A_grass_trees`, `_C_grass_trees` | Yes, weight 1 each |
| "pre-assembled" | `hills_A/B/C`, `hills_A_trees`, `hills_B_trees`, `hills_C_trees` | Yes |

So "more use of" is a weights question, and it is cheap. "As a 3rd tile option"
is not.

**One measured caveat on "pure grey", already recorded in `props.ts`:** the bare
mountain variants carry no grass and sample the atlas's rock swatch, which the
Summer palette renders **tan**. Two of them side by side read as a sand mesa
dropped into a green island — which is why they were taken out. Pure grey is
therefore not available from this pack in the Summer atlas without either
switching palette per tile or editing the atlas. That is a real constraint on the
first row of the table above and it needs Joe's eye, not my guess.

---

## 2. The cheap two thirds — do this regardless

No new tile type, no save change, no risk:

1. Raise the mountain weights in `FEATURES.highland` from 1 to about 3, and add a
   `rocky` big feature or two so stony ground gets a skyline of its own.
2. Raise the `highland` character weight so ranges appear more often.

That alone delivers "a bit more use of the mountain/rock hexes" and could ship in
an hour. It does **not** deliver "a 3rd tile option", because a character is
derived from the coordinate — the island decides, not the child.

---

## 3. The expensive third — a real `TileType`

`type TileType = 'grass' | 'water'` is load-bearing in more places than it looks.

### What has to change

| Area | Change | Risk |
|---|---|---|
| `world/grid.ts` | `TileType` gains `'rock'` | Type errors flush out most call sites — good |
| `world/tiles.ts` | A `RenderKind` and a model URL per rock variant | Low |
| `world/coast.ts` | **Every rule that says "grass" must decide what rock is** | **High — see below** |
| `flow.ts` | `tileOffer` gains a third entry past a threshold | Low |
| `world/increments.ts` | A `PALETTE.rock` and a fit for it | Low |
| `save.ts` | Migration, and a version bump | **High** |
| `balance/balance.json` | The "after 15 tiles" threshold | Low |

### The coastline is the hard part, and it is newly hard

As of today the coast rules are a **hard constraint enforced at placement**: water
may only go where the water cell can carry its whole beach, which is 19 of the 64
possible neighbourhoods. Every one of those rules is currently phrased as
*grass versus not-grass*:

- `typesAround` maps a neighbour to `land` if it is grass, `water` otherwise.
- `drawableAsWater` counts green edges.
- `allows` re-checks every affected water tile after a hypothetical placement.

A rock tile is land. If it is treated as `land`, the 19-neighbourhood enumeration
still holds and rock behaves exactly like grass at the shore — which is almost
certainly right, since a rock hex has a flat rim like a grass hex. **But that must
be measured, not assumed:** the rock models must be checked to present land at all
six edges at the same height as grass, or a rock tile beside water produces the
very step the coast work has just eliminated. `tests/island/coast.test.ts` already
re-derives edge heights from the `.gltf` files; the same measurement extended to
the mountain models is the honest first step, and it is about an hour.

### The save is the part that has bitten before

`save.ts` has migrations and `tests/island/save.test.ts` covers them. HANDOFF
records that **rolling the build back shows the child an empty island**, and that
a reader which called Juno's existing save "not one of ours" would have wiped
everything she owns. A new tile type means old builds cannot read new saves.

Mitigation, and the reason this wants sequencing rather than speed:

- Land the **release tag** first (Phase 3 item 4, still waiting on Joe), so
  production is pinned and a rollback is a deliberate act rather than an accident.
- Write the migration so an unknown tile type degrades to `grass` rather than
  failing the whole save — a rock hex becoming a green hex loses nothing the
  child owns, which satisfies brief §19; refusing to load loses everything.

---

## 4. The gameplay question that is genuinely Joe's

"allow as a 3rd tile option after there are say 15 tiles already" raises one thing
I should not decide.

**What is a rock tile FOR?** Grass grows pets' habitats; water is a pond. If rock
is purely decorative, it is a third button that makes the island prettier and
costs the same sums — fine, but it competes with grass for the space pets need,
and the space-surplus governor already tells the child to read more friends
home when they have too much empty land. If rock is *not* habitable, then
choosing it is choosing to slow their own pet progress, which a six-year-old
cannot be expected to weigh.

Three options, and I would want Joe's answer before building any of it:

1. **Decorative and habitable** — rock counts as land for the governor, pets walk
   on it. Simplest, no new rules, and the third button is a pure aesthetic choice.
   My recommendation.
2. **Decorative and not habitable** — needs the governor and `spaceSurplus` to
   distinguish, and needs the game to communicate it without text.
3. **Rock is the mountain tile the biome ladder wants anyway** — item 14 in the
   Phase 3 brief is the biome and tile ladder, which is where new tile types were
   always going to come from. Folding this into that item would mean it arrives
   with spring, desert and ice rather than on its own, and the tile offer becomes
   a genuine pick-of-several instead of a pick-of-three.

Option 3 is the tidiest engineering answer and the slowest. Option 1 is what I
would build if Joe wants it soon.

---

## 5. Recommendation

- **Now:** do §2. It is an hour, it has no save implications, and it answers "a
  bit more use of the mountain/rock hexes" directly.
- **Before §3:** measure the rock models' edge heights against the coast table,
  and get Joe's answer on §4.
- **Sequence §3 after the first release tag**, for the rollback reason above.
- **Note the "pure grey" constraint** — it is a fact about the Summer atlas, not a
  preference, and Joe may want to look at a bare mountain in situ before deciding
  he wants them at all.
