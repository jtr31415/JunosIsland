/**
 * Every species the assembly kit can build — one line each, and nothing else.
 *
 * This was one 562-line file holding two species' records. Thirteen Garden
 * species are now being built in parallel and that file was the most
 * comment-dense in the repo: every number in an `AssemblyBuild` carries the
 * measurement that produced it, in a comment beside it, and a comment lost in a
 * merge is a reason lost with nothing left to show it was ever there.
 *
 * So the records live one per file under this directory, named for the species
 * id, and this file is the whole of the shared surface.
 *
 * ## ADDING A SPECIES IS A FILE AND A LINE
 *
 *   1. Write `parts/assembled/animal-<name>.ts`. It exports one const, defined
 *      through `defineAssembly('animal-<name>', { ... })`.
 *   2. APPEND one `export { ... } from './animal-<name>'` line to the list below.
 *
 * Nothing else. Not `parts/index.ts` (it re-exports this whole module with a
 * `export *`), not `collections/garden.ts` (`defineSpecies` picks the assembly up
 * by id off the register), not `assembledSpecies()`, not `buildAssembled()`.
 *
 * **Why one line is enough.** Evaluating a re-export evaluates the module it
 * names, and a species module calls `defineAssembly` as it defines its const —
 * so the same line that publishes the name is what puts the species on the
 * register that `ASSEMBLED_BUILDS` and `assemblyFor` read. See `register.ts`.
 *
 * ## THE LINE MUST NEVER PRECEDE THE FILE
 *
 * Step 1 then step 2, always, and never the other way round. On 29 July a
 * manager fanning out eleven species in parallel wrote all thirteen lines here
 * UP FRONT, so the subagents would not have to touch a shared file. Five of the
 * files did not exist yet, the module graph failed to resolve, and the viewer
 * went blank — for Joe, live, because the workbench dev server reads this
 * working tree directly. There is no "it is fine once I commit".
 *
 * So with concurrent subagents the rule is: **each appends its own line only
 * after its file is written and type-checks, or the manager appends centrally
 * as each subagent REPORTS.** A subagent is finished when it has reported, not
 * when it was dispatched. If a batch genuinely cannot keep the tree loadable at
 * every instant, do it in a worktree and merge it in complete.
 *
 * **APPEND, do not sort.** The list order is the order `assembledSpecies()`
 * reports and the order the approver bench shows. §6 of
 * `docs/building-animals-from-parts.md` is one species at a time, in the order
 * they shipped, and the hedgehog is first because it was first.
 *
 * §0 still holds over all of it: the names and the facts are never regenerated,
 * and a species that is not in the roster throws rather than being invented.
 */
export { HEDGEHOG_ASSEMBLY } from './animal-hedgehog'
export { SQUIRREL_ASSEMBLY } from './animal-squirrel'
export { MOUSE_ASSEMBLY } from './animal-mouse'
export { SHREW_ASSEMBLY } from './animal-shrew'
export { DORMOUSE_ASSEMBLY } from './animal-dormouse'
export { VOLE_ASSEMBLY } from './animal-vole'
export { FROG_ASSEMBLY } from './animal-frog'
export { TOAD_ASSEMBLY } from './animal-toad'
export { TORTOISE_ASSEMBLY } from './animal-tortoise'
export { SALAMANDER_ASSEMBLY } from './animal-salamander'
export { NEWT_ASSEMBLY } from './animal-newt'
export { BADGER_ASSEMBLY } from './animal-badger'
export { MOLE_ASSEMBLY } from './animal-mole'
export { SLOW_WORM_ASSEMBLY } from './animal-slow-worm'
export { CORN_SNAKE_ASSEMBLY } from './animal-corn-snake'
export { GOLDFISH_ASSEMBLY } from './animal-goldfish'
export { CROCODILE_ASSEMBLY } from './animal-crocodile'
export { OPOSSUM_ASSEMBLY } from './animal-opossum'
export { NIGHTJAR_ASSEMBLY } from './animal-nightjar'
export { WOLF_ASSEMBLY } from './animal-wolf'
export { TARSIER_ASSEMBLY } from './animal-tarsier'
export { FIREFLY_ASSEMBLY } from './animal-firefly'
export { CIVET_ASSEMBLY } from './animal-civet'
export { KINKAJOU_ASSEMBLY } from './animal-kinkajou'
export { RACCOON_ASSEMBLY } from './animal-raccoon'
export { KIWI_ASSEMBLY } from './animal-kiwi'
export { BUSHBABY_ASSEMBLY } from './animal-bushbaby'
export { FENNEC_FOX_ASSEMBLY } from './animal-fennec-fox'
export { AYE_AYE_ASSEMBLY } from './animal-aye-aye'
export { GLOW_WORM_ASSEMBLY } from './animal-glow-worm'
export { CHINCHILLA_ASSEMBLY } from './animal-chinchilla'
export { GUINEA_PIG_ASSEMBLY } from './animal-guinea-pig'
export { PONY_ASSEMBLY } from './animal-pony'
export { HAMSTER_ASSEMBLY } from './animal-hamster'
export { DEGU_ASSEMBLY } from './animal-degu'
export { GECKO_ASSEMBLY } from './animal-gecko'
export { GERBIL_ASSEMBLY } from './animal-gerbil'
export { FERRET_ASSEMBLY } from './animal-ferret'
export { BUDGIE_ASSEMBLY } from './animal-budgie'
export { RAT_ASSEMBLY } from './animal-rat'
export { TERRAPIN_ASSEMBLY } from './animal-terrapin'
export { COCKATIEL_ASSEMBLY } from './animal-cockatiel'
export { LOVEBIRD_ASSEMBLY } from './animal-lovebird'
export { CANARY_ASSEMBLY } from './animal-canary'
export { CHICKEN_ASSEMBLY } from './animal-chicken'
export { SHEEP_ASSEMBLY } from './animal-sheep'
export { HORSE_ASSEMBLY } from './animal-horse'
export { GOOSE_ASSEMBLY } from './animal-goose'
export { MULE_ASSEMBLY } from './animal-mule'
export { ALPACA_ASSEMBLY } from './animal-alpaca'
export { ROOSTER_ASSEMBLY } from './animal-rooster'
export { PIGEON_ASSEMBLY } from './animal-pigeon'
export { OX_ASSEMBLY } from './animal-ox'
export { LLAMA_ASSEMBLY } from './animal-llama'
export { QUAIL_ASSEMBLY } from './animal-quail'
export { GUINEA_FOWL_ASSEMBLY } from './animal-guinea-fowl'
export { TURKEY_ASSEMBLY } from './animal-turkey'
export { DONKEY_ASSEMBLY } from './animal-donkey'
export { GOAT_ASSEMBLY } from './animal-goat'
export { WATER_BUFFALO_ASSEMBLY } from './animal-water-buffalo'
export { HARE_ASSEMBLY } from './animal-hare'
export { STOAT_ASSEMBLY } from './animal-stoat'
export { CHIPMUNK_ASSEMBLY } from './animal-chipmunk'
/* -- append the next species' line directly above this one -- */

import { assembledBuilds } from './register'

/**
 * Every species the assembly kit can build, by species id.
 *
 * Derived from the register rather than typed out, which is the half of the
 * split that stops "added the file, forgot the map" being a thing that can
 * happen. Frozen at module load: every re-export above has already been
 * evaluated by the time this line runs, because `export ... from` is hoisted.
 */
export const ASSEMBLED_BUILDS = assembledBuilds()

export { assemblyFor, assembledCount } from './register'
