# Pet Island — where we are

*Written 27 July 2026, against `pet-island-brief.md` and `docs/pet-island-slice1.md`.*

The short version: **M0 is done and proven, M1 is done and playable, and most
of slice-1 is in.** The game is deployed at
<https://jtr31415.github.io/JunosIsland/> and has not yet been played by the
QA department, whose verdict outranks both documents (brief §17).

Two decisions are waiting on Joe — see [Waiting on you](#waiting-on-you).

---

## Against the brief's milestones (§17)

| Milestone | State |
|---|---|
| **M0 — Extraction** | **Done.** `core/` is extracted, pure and golden-verified against the frozen original; the 2D game ships from those modules, which is the proof the port is faithful. |
| **M1 — Island grey-box** | **Done, and past grey-box.** Hex place loop, wandering pets, hatching eggs, code-built Fred, the opening script with TTS, orbit camera, juice, debug tooling. |
| **M2 — Pets & wants** | **Partial.** Album and name generator are in. Variants, habitats, nursery, pet quests, visitor eggs are not. |
| **M3 — The ladder** | **Not started.** |
| **M4 — Dress & seasons** | **Not started**, though the art pass is well ahead of grey-box. |

### Guardrails (§18) — all holding

Nothing a child owns can be lost; no timers, no expiry; wrong answers cost
nothing; three stumbles summon help and never shame; UK English; bright never
scary. Several of tonight's bugs were §18 violations found and fixed —
a reset button one tap from wiping everything, a two-second window where a
hatched pet was not yet saved, a coastline that re-cut land she already owned.

### The frozen original

`v0/junos-words.html` has not been touched. `npm run parity` drives the 2D
shell and the original through the same 14 steps and asserts identical
rendering; `npm run smoke` boots it headlessly. Both are in CI.

**One caveat worth knowing:** the parity gate flaked once tonight — reported
four differing steps, then passed on four consecutive re-runs. A gate that
fails at random is a gate you stop trusting, so it deserves a look before it
is relied on for a real port question.

---

## Against slice-1, section by section

### §1 The first ten minutes — **done**

The eight-beat opening plays, is replayable by tapping Fred, and is skippable.
It asks her name first, greets her by it, and the sign on the home tile reads
*[Name]'s Island*.

### §2 The growing plot — **done, and reshaped by Joe**

The spec has the tile built by increments. What shipped is Joe's revision of
it, which is better: the whole finished tile appears as a **golden outline**
from the moment it is sited, and each collected page turns one more piece
real. Seeing the finished tile means the work has a *shape* — she can see
there are four things left, and which four, without being told a number.

- Pieces are seeded from the socket, so no two hexes grow the same thing and a
  given hex always grows the same thing.
- The count is a property of the sequence, not the price: a sixteen-sum tile
  grows the same eight props as a one-sum tile. Pinned by a test, because
  inverting it would clutter an expensive island and leave pets no room.
- The tile keeps **exactly** what she built — the prop field adopts the grown
  scenery rather than planting a different set at touchdown.

### §3 The cracking egg — **done**

Stages at 25/50/75/90%, hatch ceremony performed on the stage: burst, shell
breaks, the friend pops up on the turntable, name card, spoken name, stage
dissolves, she arrives on the island, album chip flies to the book. Eggs now
arrive rather than appearing.

### §4 Costs — **done, with a contradiction to resolve** ⚠️

The curve is implemented and drives everything. **The spec's own table and
formula disagree** at n = 5, 6 and 8 (table 9/10/12, formula 8/9/11) and no
single `tau` reconciles them. The build follows the formula. See
[Waiting on you](#waiting-on-you).

### §5 The governors — **done**

Symmetric, want-framed, silent during the grace period, and they divert a tap
rather than stranding it — an earlier version moved the flow into a challenge
and *then* declined to open one, which left no overlay and no way out but a
reload.

### §6 The challenge stage — **done, three items outstanding**

Split view, live vignette, turntable, progress dots, fly-back. The vignette is
a **transparent** container per Joe's direction, so the object floats against
the real island rather than sitting in a box with its own grass and sky.

Not done, tracked on issue #11:

- The **"1s breath"** after the album chip, on the non-opening path.
- The **move-in check** after a tile lands — needs a design call on what
  "moving in" means before habitats exist.
- **"World does not render while the stage is up."** Measured: the world holds
  a locked 60fps with p95 equal to median on a 37-tile island. My
  recommendation is **won't-do** — suppressing the world to save one small
  scene would freeze the clouds, the pets and Fred, all visible behind the
  panel, for a saving nobody has shown is needed. Re-open only if the tablet
  disagrees.

### §7 Biome & tile ladder — **not started**

Grass and water only. The atlas has the seasonal palettes; the unlock ladder,
the ceremony and the pet-family coupling are all still to build.

### §8 balance.json — **done and honoured**

Costs, governors, stage timings and story pacing all live there. Joe can tune
the feel without a code change, which is the whole point of the file.

### §9 Open items

- **Tile material variants confirmed:** the pack ships grass, water, five
  coast shapes, rivers, roads, hills and mountains in four seasonal palettes.
  §7's names can now be written against the atlas rather than optimism.
- Academic progression spec — still with the product owner.
- Sums 8–10 escalation — still parked.

---

## Waiting on you

1. **#4 — the cost curve.** Table or formula? The build follows the formula;
   the spec contradicts itself and should say one thing.
2. **#6 — tilt-shift.** Built, measured and reverted. `pet-island-lighting.md`
   §1, headed *non-negotiable*, says "No post-processing stack on tablet. No
   bloom. MSAA only." I had reworded §7 around that, which was rationalising.
   The measured cost was also poor: MSAA lost for the whole world, quarter
   resolution on a DPR-2 tablet, the sky's `toneMapped: false` defeated so the
   celebration bump pulsed the sky — and the effect itself invisible at σ < 1px
   across the island. Amending §1 is your call, and the project's own
   precedent (§3's shadow-map amendment) requires measured fps on the target
   tablet plus a settings toggle.

---

## The thing I cannot test

Juno has not played this. Everything above is verified by tests, by the
gates, and by me driving the deployed build in a browser — but the pacing of
a ceremony you see forty times in a sitting, whether the outline reads as a
promise or as clutter, whether the opening is quick enough: those are hers to
answer, and the brief already says her verdict outranks both documents.
