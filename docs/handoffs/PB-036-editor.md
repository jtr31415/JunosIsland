# PB-036 phase 7 — the species editor

*Written 1 August 2026 by the editor manager. This file is the editor's baton
only. `docs/MANAGER-HANDOFF.md` belongs to the queue manager and was not touched,
nor were `joe/backlog.json` or `joe/tasks.json` — other managers are running in
parallel worktrees and those three files conflict on merge.*

## The five jobs Joe asked for — all five landed

His verdict that started this: *"concept of the editor is brilliant and works
well. needs a bit more work, but its the way to get the animals done much
quicker."*

| # | His words | State |
|---|---|---|
| 1 | *"need to be able to save my edits."* | **DONE**, proven round-trip in the browser |
| 2 | *"sorted by part and have headers for the categories"* | **DONE** |
| 3 | *"i need to be able to insert a new component."* | **DONE** |
| 4 | *"3d components snap to somewhere"* | **DONE**, diagnosed then fixed |
| 5 | *"start a new animal conmpletely from scratch"* | **DONE** |

Plus the named debt: the provisional Vite transform is **deleted**.

---

## How the editor now behaves — read this before using it

**Save is in the toolbar above the animal**, next to snap/explode — not in "Take
it out". It was originally put at the bottom of the right-hand rail and on a
625px-tall window it was **never on screen at all**; the button existed and could
not be clicked. That is worth remembering as a class: a control that is off the
fold is a control that does not exist, and nothing in a unit test can see it.

- **Saving writes a draft to `joe/species-edits.json`.** It never writes `src/`.
  The live 24 are frozen and there is no path from this page to them — the only
  way out is you copying the module text from "Show it as a module".
- **One draft per species id.** Saving the mouse twice patches the same `SD-nnn`
  rather than growing a pile. A second variant of the same animal is a new animal
  with a new name, which the page can now do.
- **The page never deals an id.** It sends a draft with no id and the server
  allocates `SD-nnn` inside the request. That is what makes it safe for an agent
  to be writing the same file while your tab is open — proven live: a draft
  written by curl survived a save from the page untouched.
- **Your drafts come back in the Animal list**, in a "My drafts" group under
  "Shipped species". Selecting one reopens the definition exactly as you left it.
  Verified: an inserted part survived a full page reload.
- **The unsaved marker is live.** It reads "unsaved changes" the moment a gesture
  lands and "SD-002 — saved" once the server has it.
- **"Start again from the original"** goes back to the baseline definition. For a
  draft that is the shipped species it came *from*, so the warnings keep telling
  you how far you have moved from a real animal.
- **A new animal refuses a shipped id.** Typing "Hedgehog" is declined by name.
  An editor that lets a typo put you on top of a frozen species while you think
  you are making something new is the one accident that must not be possible.
- **A new animal is a palette and nothing else** — `blankDef()` in `def.ts`. Hull,
  legs and eyes are `CreatureDef`'s *defaults*, not things you ask for, so an
  empty definition already builds a standard body on four legs with two eye
  cards. The grey is deliberately unpainted-looking so you recolour it.
- **The shape dropdown is grouped** — `Blades (5) · Boxes (41) · Cones (6) ·
  Plates (16) · Tubes (9) · Wedges (18)`, alphabetical, natural numeric order
  within a group so `box-9` precedes `box-10`. Grouping is **not** filtering:
  every one of the 95 rows is still there. The hull picker shows one group
  (`Boxes (10)`), which is honest but says little.
- **"Add a part"** inserts into `extras` at the shape's own measured join to this
  body, then selects it so you can drag it. Inserting the same shape repeatedly
  gives `box-25`, `box-25-2`, … each separately pickable.

---

## Job 4, the snapping bug — what it actually was

Joe: *"some parts snap to a location, even though snap is off — eyes are fine and
I can move them perfectly, 3d components snap to somewhere."*

**It was a double unit conversion in `stage.ts`, and the handoff's instinct was
right: the round trip, not the gizmo.**

`stage.ts:164` scales the built group by `SHARED_SCALE` (0.6207). three.js's
`TransformControls` **already** converts a drag into parent space before writing
`object.position` — `TransformControls.js:561` does
`.applyQuaternion(_parentQuaternionInv).divide(_parentScale)`, and `_parentScale`
is the parent's *world* scale. So `handle.position` was already in definition
units, and `stage.ts:301` divided by `SHARED_SCALE` a second time: every translate
landed **1.611× past the cursor**.

`stage.ts:304` was the one Joe saw. For the **hull** the base was not a delta but
an *absolute* position, also divided — so one nudge wrote
`at = 1.611 × at_old + 1.611 × delta`, **a fixed destination independent of the
drag**. That is literally "snaps to a location". And because `creature.ts:494`
builds `hullFrame` from `hullAt` and `assembly.ts:596-598` re-grounds the group,
the whole animal reshuffled.

**Why eyes were fine**, exactly as he observed: `def.ts:419-422` writes only x and
y for an eye and `creature.ts:727-730` pins z to `EYE_CARD_Z`. The card is
constrained to the face plane, so the same error can only slide it imperceptibly.
Solid parts have three free axes and, for the hull, an absolute error term.

**The file contradicted itself, which is how it was proved rather than guessed**:
the explode path at `stage.ts:365` correctly *divides* a world push to get local,
and `stage.ts:398` correctly *multiplies* a definition-unit snap step because
`translationSnap` really is in world units. Both were left alone.

Verified in the browser on the mouse, snap off, hull selected: after a drag,
`at.y` is **0.80625** — exactly the measured default (0.625 + 0.18125 legs).
Under the old code it would have been 0.80625 × 1.611185 = **1.29903**. The axis
dragged moved; the other two are untouched.

`tests/tools/editor-stage-drag.test.ts` (10 tests) pins the arithmetic against an
extracted pure `joinFromDrag`. Revert-checked: reintroducing the two divisions
fails 9 of 10, with `expected [0, 1.006991, 0] to deeply equal [0, 0.625, 0]` —
and 0.625 × 1.611185 = 1.006991, the bug naming itself.

---

## The debt: the Vite transform is gone

`src/island/species/parts/creature.ts` now carries
`export const CREATURE_DEFS = new Map<string, CreatureDef>()`, written by
`defineCreature` beside the build it returns. `vite.workbench.config.ts`'s
`joe-workbench-capture-defs` plugin and its 22-line justification are **deleted**.

**The "two lines" claim held for the mechanism but not for the change.** It also
needed:
- `capture.ts` rewritten. `loadBuiltDefs()` keeps its exact signature and its
  throw-if-empty, but the **barrel side-effect import must survive** — a map does
  not populate itself — and it must **still `structuredClone`** each def, because
  the editor hands its working def to `creatureSpec` on every gesture and would
  otherwise mutate the object the species module holds.
- `defFrom` in `def.ts` still returns `null`, deliberately. `def.ts` is
  three.js-free by explicit invariant so the edit model runs in node, and
  `creature.ts` pulls `spinVec` from `assembly.ts`, which imports three. The
  editor reads `CREATURE_DEFS` through `capture.ts`, which is outside `src/`.
  The old test comment said "nothing keeps the definition" — now false — so the
  **comment** was corrected and the assertion left alone.

**Landmine, and it nearly reddened a gate**: `tools/smoke/channel.mjs:57-67`
greps every file under `src/` for the literal string `tools/workbench` and fails
the build on a hit — **including inside a comment**. The first draft of the
`CREATURE_DEFS` doc named `tools/workbench/public/editor/capture.ts` and would
have failed. It now says "Joe's local species editor" and explains why it is
vague. Anyone editing that doc block needs to know.

---

## Gate results

Run on the final tree, all five, output pasted.

```
$ npx tsc --noEmit -p tsconfig.json
TSC_EXIT=0            (zero output)

$ npm test
 Test Files  123 passed (123)
      Tests  2740 passed (2740)

$ npm run build
precache  8 entries (1275.21 KiB)
files generated  ../../dist/island/sw.js, ../../dist/island/workbox-9c191d2f.js

$ npm run smoke
ok no runtime errors on boot ... ok score bar initialised
all boot checks passed

$ npm run parity
self-check  spoken utterances : 4 / 4
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically

$ node tools/smoke/channel.mjs      (not one of the five, run because of the above)
src/ → workbench  no references, as it must be
channel check passed
```

**On the two flakies, done properly rather than waved at.** Three consecutive
runs failed `governors > leaves a wide corridor between the two walls at every
size` with `Test timed out in 5000ms`, which is more often than "1 in 6" and so
was NOT taken on trust. It was checked against a tree with my changes stashed
out: on that unmodified tree one full run went red and the next went green — the
flake is real, pre-existing and not mine. A later run showed `governors` **and**
`pettap > does NOT let the camera into the keep-out or the blob` together, which
is exactly the named pair; the run above is the clean one. Both were left alone
and neither was silenced. `pettap` is PB-054 and belongs to someone else.
`governors` alone passes in 3.43s — it is a cold-cache load, not a logic fault.

---

## Where the next editor run starts

**Nothing here is blocked.** The five jobs and the debt are done, so the next run
picks its own ground. In priority order as I see it, and none of it is settled:

1. **`setJoin` declines an axis silently.** `def.ts:417` drops the **y** of a leg
   drag and moves all four legs symmetrically; `def.ts:423` returns the ridge
   unchanged. Both now *say so* through `onSay`, which is the user-facing half —
   but the model still discards an axis while reporting "moved legs". The clean
   shape is `setJoin` reporting which axes it kept. Eyes drop z the same way,
   left silent on purpose: Joe says eyes feel right and `EYE_CARD_Z` is rule 5.
2. **Dragging the hull while explode is ON writes a wrong `at`.** `applyExplode`
   mutates `mesh.position` for every slot including the hull, so the hull's
   *absolute* base picks up the explode offset. Non-hull parts are safe — the
   push cancels in the delta. The fix is for the hull's base to come from
   `userData.home` rather than the live position. Narrower than the bug Joe
   reported and deliberately not folded into it.
3. **The draft has no name, fact or collection UI.** The record carries
   `givenName`, `fact`, `factSource`, `collection` and `note` and the save path
   round-trips all of them, but only `givenName` is settable (and only when
   starting from scratch). `givenName(speciesId)` in
   `src/island/species/naming.ts` draws a collision-free name for an id the
   roster has never seen.
4. **Inserting a hull-shaped id is the one insert that will not build.**
   `warningsFor` says it loudly (`one-mass`, naming both masses) and
   `creatureSpec` then refuses it by name with RULE 3. Both messages beat a dead
   dropdown row, so it is deliberately not prevented. `apply()` catches the throw
   and keeps the old model on screen, so it cannot take the page down — that was
   checked.

**Still deferred, unchanged, seams at the top of the editor's `main.ts`:** the
visual parts library with thumbnails and shape search (note 2 was the agreed
substitute and it is now built, so this is further away than it was); the
copy-an-original-and-decompose flow (**its hard half IS measured — do not
re-measure it**: join `PARTS_BANK.provenance` on `(species, node:'body',
ordinal)`, 177 of 206 resolve unambiguously, 16 of 24 species at 100%, the 29
misses being horns and claws never banked; **do not match on triangle counts,
46.6% ambiguous**); and the two-tone colour experiment, on which nobody has a
verdict.

---

## What I learned that is not in the code

- **A control below the fold is a control that does not exist.** Save sat at
  y=815 in a 625px window, inside a scrolling rail. Clicks reported success and
  the handler never ran; the tell was that a GET fired on page load and never on
  click. It cost the best part of an hour and looked exactly like a hung fetch.
  When a handler seems not to fire, get the element's bounding box before
  suspecting the code.
- **The browser is the only instrument for a UI bug, and it must be YOUR build.**
  A stale dev server from another worktree held 4173. `strictPort` makes that
  loud rather than silent, and killing the PID was right — but the reason to
  check is that the page would have looked perfect while testing someone else's
  code.
- **Three consecutive failures is not automatically a flake.** The orders named
  `governors` as flaky and it would have been easy to wave it through. Stashing
  the change and reproducing the intermittency on the unmodified tree is what
  makes "not mine" a fact rather than a hope, and it took one command.
- **A `<select>` is the whole of Joe's note 2 and it took an hour, not a day.**
  The thumbnail library has been deferred three times; grouping 95 rows by a
  field the data already carried closed the question for now. Cheap answers to
  expensive-sounding requests are worth looking for first.
- **A smoke gate can grep comments.** See the `channel.mjs` landmine above.
- **`pathFromUserData` had a real bug found on the way to job 3**: it tested
  `name === raw || name === stripped` per extra in one pass, and since
  `uniqueExtraName` hands out `wart-2` beside `wart` while
  `stripCopyTag('wart-2') === 'wart'`, clicking a fresh copy selected the part it
  was copied FROM. Pre-existing — `duplicatePart` of any extra hit it. Now two
  passes, whole name first, and pinned.
- **The reported NUL bytes at `def.ts:913` do not exist.** Every file under
  `tools/workbench/public/editor/` was byte-scanned: zero NUL bytes. Either it
  was already fixed or the report came from another tree. The previous handoff
  says otherwise; it is wrong.

---

## Decisions

**RAISED: none.** `joe/tasks.json` is off-limits this run (parallel managers), so
the one question below is reported to the drumbeat to record centrally rather
than appended by me.

**NEEDS JOE — one, and it is small:** the shape dropdown is grouped by **form**
(box, wedge, tube…), because `library.ts` already treats `form` as the label and
its ids share the prefix, so the headers match what he reads in each row. The
alternative was grouping by **role** (Ears, Noses, Tails), which names categories
he might find more meaningful — but role is what the bank *thinks* a shape suits,
and the editor deliberately lets any shape go anywhere, so role headers would
make a semantic claim the editor otherwise avoids. Grouping by form is
reversible in one function (`groupShapes`, `library.ts:363`). Ask him which he
wants when he next uses it; do not pre-empt it.

**NOT ACTED ON, inherited intact:** JT-036 (do mouse, shrew, mole and badger get
ears), the 14 Garden animals and 96 facts awaiting sign-off, and the wider half
of JT-029 (*"we drop the colours"*). All three are Joe's and none was touched.

**Not built, on purpose:** no new species. That is queued behind this run.
