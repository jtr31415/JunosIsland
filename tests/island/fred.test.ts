/**
 * @vitest-environment jsdom
 *
 * Joe, playing: "animals can still clip through the frog."
 *
 * The cause was not a radius that was too small. It was that Fred had no
 * radius at all — `publishObstacles()` in main.ts published the scenery and
 * the egg and nothing else, so the one CHARACTER on the island was the one
 * thing with no substance. Exactly the fault the egg had before it, which is
 * why this file checks that he can answer the question at all, and that the
 * answer is measured from the model rather than guessed at.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as THREE from 'three'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createFred } from '../../src/island/fred'
import { footprintBelow, WALKING_HEIGHT } from '../../src/island/world/props'

/** His body group — the frog itself, without the blob on the ground. */
function bodyOf(fred: ReturnType<typeof createFred>): THREE.Object3D {
  const body = fred.group.children.find(c => c.name !== 'blobShadow')
  return body as THREE.Object3D
}

afterEach(() => { vi.restoreAllMocks() })

describe('Fred takes up room', () => {
  it('reports a keep-out at all', () => {
    // The whole bug in one line: before this there was nothing to ask.
    const fred = createFred()
    expect(fred.obstacle().r).toBeGreaterThan(0)
  })

  it('measures it from the model rather than guessing low', () => {
    /*
     * The landmine this island has already paid for: every keep-out used to be
     * `hexSize × a guess` and every one came out too small — a mountain
     * measuring 0.9 across declared 0.58, so pets walked into it. Fred's has to
     * cover at least his own half-width, or a pet ends up inside him by exactly
     * the amount the guess was short.
     */
    const fred = createFred()
    const body = bodyOf(fred)
    body.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(body)
    const halfWidth = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2
    expect(fred.obstacle().r).toBeGreaterThanOrEqual(halfWidth)
  })

  it('measures it at WALKING height, the way the scenery does', () => {
    // One rule for what is in a walking creature's way, not two.
    const fred = createFred()
    expect(fred.obstacle().r)
      .toBeCloseTo(footprintBelow(bodyOf(fred), WALKING_HEIGHT), 6)
  })

  it('is not so wide that he owns the home tile', () => {
    /*
     * A sanity ceiling. The home rock also carries her signpost, the egg and
     * the first friend who arrives; a keep-out the size of the hex would leave
     * a pet nowhere to stand. The hex's circumradius is 1.15.
     */
    expect(createFred().obstacle().r).toBeLessThan(0.35)
  })
})

describe('Fred takes his keep-out with him', () => {
  it('starts where he stands', () => {
    const fred = createFred()
    fred.group.position.set(2, 0, -3)
    const at = fred.obstacle()
    expect(at.x).toBeCloseTo(2, 6)
    expect(at.z).toBeCloseTo(-3, 6)
  })

  it('follows him through a hop rather than staying at the take-off', () => {
    /*
     * He does not stand still — he potters about his patch, and the hop
     * carries his BODY across the group before the landing writes the group's
     * own position back. So a keep-out pinned to the group is in the wrong
     * place for the whole time he is in the air, which is the half of every
     * few seconds a pet is most likely to be walking past him.
     */
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const fred = createFred()
    fred.setHome(1, 1, 0.4)
    fred.hop()
    // Into the middle of the arc, where the body is furthest from the group.
    for (let i = 0; i < 18; i++) fred.update(1 / 60, i / 60)

    const at = fred.obstacle()
    const drift = Math.hypot(at.x - fred.group.position.x, at.z - fred.group.position.z)
    expect(drift).toBeGreaterThan(0.02)
  })

  it('answers in world space, not in the direction he happens to face', () => {
    /*
     * He turns to face wherever he is hopping. The body's offset is in his own
     * frame, so it has to come back out through his facing or his keep-out
     * lands on the wrong side of him whenever he is not pointing down +z.
     */
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const fred = createFred()
    fred.setHome(1, 1, 0.4)
    fred.hop()
    for (let i = 0; i < 18; i++) fred.update(1 / 60, i / 60)

    const body = bodyOf(fred)
    const inWorld = body.getWorldPosition(new THREE.Vector3())
    const at = fred.obstacle()
    expect(at.x).toBeCloseTo(inWorld.x, 6)
    expect(at.z).toBeCloseTo(inWorld.z, 6)
  })
})

/**
 * The wiring, which is where the bug actually lived.
 *
 * Fred could have had a perfectly good keep-out and still been walked through,
 * because nothing handed it to the pet field — that is precisely what happened
 * to the egg. main.ts is untested glue, which HANDOFF §5 names as this
 * project's four-time offender, so this reads the source the way
 * barrier.test.ts does. A weaker kind of test than the ones above, and here
 * because the ones above cannot reach the place where someone forgets to call.
 */
describe('main.ts hands Fred to the pet field', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const source = readFileSync(resolve(here, '../../src/island/main.ts'), 'utf8')
  const code = source
    .split('\n')
    .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
    .join('\n')

  it('publishes him as something that moves', () => {
    expect(code).toContain('pets.setMovers(')
  })

  it('publishes the frog itself, asked afresh rather than a snapshot', () => {
    // `fred.obstacle()` inside the callback, not a value read once at boot.
    expect(code).toMatch(/pets\.setMovers\(\s*\(\)\s*=>[^\n]*fred\.obstacle\(\)/)
  })
})
