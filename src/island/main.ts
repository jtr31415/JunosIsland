/**
 * Pet Island entry point.
 *
 * Phase 4: the island exists, you can orbit it, and you can see where the
 * next tile could go. The loop that earns those tiles arrives in Phase 5.
 */
import { createWorld } from './scene'
import { createIsland, place } from './world/grid'

const canvas = document.getElementById('view') as HTMLCanvasElement

async function boot(): Promise<void> {
  const world = await createWorld(canvas)

  // A small starting island so there is something to orbit while the earn
  // loop is built. Fred's lonely rock returns as the opening in Phase 6.
  let island = createIsland()
  island = place(island, { q: 1, r: 0 }, 'grass')
  island = place(island, { q: 0, r: 1 }, 'water')
  island = place(island, { q: -1, r: 1 }, 'grass')

  world.setIsland(island)
  world.showSockets(true)

  canvas.addEventListener('pointerdown', e => {
    const hit = world.pick(e.clientX, e.clientY)
    if (hit?.kind === 'socket') {
      island = place(island, hit.axial, 'grass')
      world.setIsland(island)
    }
  })

  world.start()
  document.getElementById('boot')?.remove()
}

boot().catch(err => {
  const el = document.getElementById('boot')
  if (el) el.textContent = 'Could not start: ' + err.message
  console.error(err)
})
