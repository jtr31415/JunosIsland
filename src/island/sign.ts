/**
 * The sign on the home tile: "[Name] Island".
 *
 * The one place the world says out loud that it belongs to her. Worth more
 * than any label in the interface, because it is IN the island rather than
 * on top of it — she can walk the camera round it, and it is still there.
 *
 * Built from primitives like Fred rather than bought, for the same reason:
 * nothing in the packs carries text, and text is the entire point.
 */
import * as THREE from 'three'

const POST = 0x8a6743
const BOARD = 0xd8b280
const INK = 0x3d2a18

/**
 * Draw the name onto a canvas to use as a texture.
 *
 * Sized generously and then fitted, because a six-year-old's name might be
 * "Jo" or "Anastasia" and neither may overflow the board or shrink to an ant.
 */
function nameTexture(name: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 160
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#d8b280'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const text = `${name}'s Island`
    ctx.fillStyle = '#3d2a18'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Shrink to fit rather than clip: a long name must still read.
    let size = 78
    do {
      ctx.font = `700 ${size}px ui-rounded, "Segoe UI", system-ui, sans-serif`
      size -= 4
    } while (size > 22 && ctx.measureText(text).width > canvas.width - 56)

    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

export interface Sign {
  group: THREE.Group
  /** Re-letter the board, e.g. once the child has told us her name. */
  setName(name: string): void
  dispose(): void
}

/*
 * Board and posts, derived rather than eyeballed.
 *
 * The posts used to be a flat 0.42 tall while the board's underside sat at
 * 0.355, so each one climbed 0.065 into the board — over a third of its
 * height — and, being slightly deeper than the board, stood PROUD of the
 * lettered face rather than behind it. The result was two stakes drawn on
 * top of her name. Deriving the post height from the board's underside means
 * moving the board can no longer put a post through the writing.
 */
export const BOARD_W = 0.52
export const BOARD_H = 0.17
export const BOARD_Y = 0.44
export const BOARD_BOTTOM = BOARD_Y - BOARD_H / 2
export const POST_H = BOARD_BOTTOM

export function createSign(name: string): Sign {
  const group = new THREE.Group()
  group.name = 'sign'

  const wood = (c: number): THREE.Material =>
    new THREE.MeshStandardMaterial({ color: c, metalness: 0, roughness: 1 })

  // Two posts rather than one: a single stake reads as a lollipop, and two
  // make it a sign somebody put up on purpose.
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.045, POST_H, 0.045), wood(POST))
    post.position.set(side * 0.19, POST_H / 2, 0)
    post.name = 'sign-post'
    group.add(post)
  }

  let texture = nameTexture(name)
  const face = new THREE.MeshStandardMaterial({
    map: texture, color: 0xffffff, metalness: 0, roughness: 1,
  })
  const edge = wood(BOARD)
  const trim = wood(INK)

  /*
   * The lettered face is its own material on the front only; the other five
   * sides are plain wood. Mapping the texture over the whole box would wrap
   * the name round the edges, which looks like a mistake rather than a sign.
   */
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(BOARD_W, BOARD_H, 0.03),
    [edge, edge, edge, edge, face, edge],
  )
  board.position.y = BOARD_Y
  board.name = 'sign-board'
  group.add(board)

  const cap = new THREE.Mesh(new THREE.BoxGeometry(BOARD_W + 0.04, 0.025, 0.05), trim)
  cap.position.y = BOARD_Y + BOARD_H / 2 + 0.0125
  group.add(cap)

  return {
    group,

    setName(next: string) {
      texture.dispose()
      texture = nameTexture(next)
      face.map = texture
      face.needsUpdate = true
    },

    dispose() {
      texture.dispose()
      group.traverse(o => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        m.geometry.dispose()
        const mat = m.material
        if (Array.isArray(mat)) mat.forEach(x => x.dispose())
        else mat.dispose()
      })
    },
  }
}
