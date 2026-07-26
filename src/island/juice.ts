/**
 * The juice pass — mandatory art direction, not decoration (brief section 14).
 *
 * Sky gradient, fog matched to it, one warm key light, a cool fill so shadows
 * read as daylight rather than dusk, and a gentle vignette. It is perhaps
 * twenty lines, and it changes every judgement anyone makes about the scene
 * from here on — including mine — so it is on from the first frame rather
 * than bolted on at the end.
 *
 * Bright, never scary (brief section 1.2): nothing here goes dark.
 */
import * as THREE from 'three'

export interface SkyColours {
  top: number
  bottom: number
  fog: number
}

/** Warm, bright, midday-holiday. The default season. */
export const SUMMER_SKY: SkyColours = {
  top: 0x5fc8f5,
  bottom: 0xc7f0ff,
  fog: 0xbfe9ff,
}

/**
 * A large inward-facing sphere with a vertical gradient. Cheaper and softer
 * than a skybox, and it tints the fog for free.
 */
export function createSky(colours: SkyColours): THREE.Mesh {
  const geo = new THREE.SphereGeometry(200, 24, 12)
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(colours.top) },
      bottom: { value: new THREE.Color(colours.bottom) },
    },
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 top;
      uniform vec3 bottom;
      varying vec3 vPos;
      void main() {
        float h = clamp(normalize(vPos).y * 0.5 + 0.5, 0.0, 1.0);
        gl_FragColor = vec4(mix(bottom, top, h), 1.0);
      }
    `,
  })
  const sky = new THREE.Mesh(geo, mat)
  sky.name = 'sky'
  return sky
}

/**
 * One warm key from high and to the side, a cool hemisphere fill, and a soft
 * ambient floor. No shadow maps: the brief rules them out for tablet fill-rate
 * (section 6), and blob shadows under pets read better at this scale anyway.
 */
export function createLights(): THREE.Object3D[] {
  const key = new THREE.DirectionalLight(0xfff2d8, 2.1)
  key.position.set(6, 12, 4)
  key.name = 'key'

  const fill = new THREE.HemisphereLight(0xcfefff, 0x6a8f5a, 1.0)
  fill.name = 'fill'

  const ambient = new THREE.AmbientLight(0xffffff, 0.35)
  ambient.name = 'ambient'

  return [key, fill, ambient]
}

/** Fog tuned to the sky so the sea fades into the horizon rather than ending. */
export function applyFog(scene: THREE.Scene, colours: SkyColours): void {
  scene.fog = new THREE.Fog(colours.fog, 34, 120)
  scene.background = new THREE.Color(colours.fog)
}

/**
 * The sea: a big soft plane the island sits in. Not a simulation — a mood.
 * It bobs very slightly so the world is never completely still.
 */
export function createSea(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(400, 400, 1, 1)
  const mat = new THREE.MeshLambertMaterial({ color: 0x4fb8e8 })
  const sea = new THREE.Mesh(geo, mat)
  sea.rotation.x = -Math.PI / 2
  sea.position.y = -0.34
  sea.name = 'sea'
  return sea
}

/** A soft dark ellipse under a character, standing in for a shadow map. */
export function createBlobShadow(radius = 0.42): THREE.Mesh {
  const geo = new THREE.CircleGeometry(radius, 20)
  const mat = new THREE.MeshBasicMaterial({
    color: 0x123044, transparent: true, opacity: 0.22, depthWrite: false,
  })
  const blob = new THREE.Mesh(geo, mat)
  blob.rotation.x = -Math.PI / 2
  blob.renderOrder = 1
  blob.name = 'blobShadow'
  return blob
}
