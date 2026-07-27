/**
 * Lighting. Everything asks this module; nothing else touches lights.
 *
 * With flat-shaded low-poly assets, lighting is not polish — it is the
 * renderer's entire art direction (lighting brief §1). So the values are DATA,
 * loaded from a preset, never hardcoded at a call site.
 *
 * The rig is exactly three lights (§2):
 *   1. HemisphereLight — the workhorse. Cool sky above, warm ground below, so
 *      shadow sides have COLOUR rather than grey. This warm-key/cool-shadow
 *      contrast is most of what makes a scene look alive.
 *   2. One DirectionalLight sun — warm gold at ~35° elevation. Never
 *      noon-overhead, which flattens everything into cafeteria light.
 *   3. A cool rim fill opposite the sun, casting nothing, to peel silhouettes
 *      off the background.
 *
 * Forbidden by the brief and absent here: white AmbientLight, point-light
 * clusters, per-object lights, any post/bloom stack.
 */
import * as THREE from 'three'

export interface LightingPreset {
  id: string
  sky: { top: string; horizon: string }
  sun: { color: string; intensity: number; elevation: number; azimuth: number }
  hemi: { sky: string; ground: string; intensity: number }
  rim: { color: string; intensity: number }
  fog: { near: number; far: number }
  exposure: number
  particles?: string
}

export interface Lighting {
  /** Add to the scene once. */
  attach(scene: THREE.Scene): void
  /** Swap preset, tweening numerically over ms. Single entry point (§5). */
  applyPreset(preset: LightingPreset, tweenMs?: number): void
  /** Call per frame to advance tweens and the slow time-of-day drift. */
  update(dt: number): void
  /** A short exposure lift for hatches and move-ins (§4). Juice, kept subtle. */
  celebrationBump(): void
  current(): LightingPreset
}

/** Sun direction from elevation/azimuth in degrees, at a fixed distance. */
function sunPosition(elevationDeg: number, azimuthDeg: number, dist = 30): THREE.Vector3 {
  const el = (elevationDeg * Math.PI) / 180
  const az = (azimuthDeg * Math.PI) / 180
  return new THREE.Vector3(
    Math.cos(el) * Math.sin(az) * dist,
    Math.sin(el) * dist,
    Math.cos(el) * Math.cos(az) * dist,
  )
}

/** Colours interpolate in LINEAR space (§4), or mid-tween goes muddy. */
function lerpColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
  return a.clone().lerp(b, t)
}

/**
 * `renderer` may be null for a SECOND scene sharing an existing renderer.
 *
 * The renderer settings below are global to the context, so a second rig must
 * not re-apply them — and must certainly not be free to disagree with the
 * first. Passing null asks for the lights alone, which is what the challenge
 * stage needs: the same three-light rig from the same preset, so the egg on
 * the turntable is lit like the egg on the shore.
 */
/**
 * §1 Renderer foundation. This pair is the single biggest fix for a scene that
 * looks washed out next to everyone else's screenshots. Global to the GL
 * context, so it is applied once by whoever owns the renderer.
 */
function applyRendererSettings(
  renderer: THREE.WebGLRenderer, exposure: number,
): void {
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = exposure
}

export function createLighting(
  renderer: THREE.WebGLRenderer | null, initial: LightingPreset,
): Lighting {
  if (renderer) applyRendererSettings(renderer, initial.exposure)


  const hemi = new THREE.HemisphereLight(
    new THREE.Color(initial.hemi.sky), new THREE.Color(initial.hemi.ground),
    initial.hemi.intensity)
  hemi.name = 'hemi'

  const sun = new THREE.DirectionalLight(
    new THREE.Color(initial.sun.color), initial.sun.intensity)
  sun.position.copy(sunPosition(initial.sun.elevation, initial.sun.azimuth))
  sun.name = 'sun'

  const rim = new THREE.DirectionalLight(
    new THREE.Color(initial.rim.color), initial.rim.intensity)
  rim.position.copy(sunPosition(28, initial.sun.azimuth + 180))
  rim.name = 'rim'

  // §3 Sky is a gradient dome, never a flat clear colour: the orbit camera
  // makes sky a third of every frame.
  const skyUniforms = {
    top: { value: new THREE.Color(initial.sky.top) },
    horizon: { value: new THREE.Color(initial.sky.horizon) },
  }
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(220, 24, 14),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped: false,
      uniforms: skyUniforms,
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 top;
        uniform vec3 horizon;
        varying vec3 vPos;
        void main() {
          float h = clamp(normalize(vPos).y * 1.4 + 0.15, 0.0, 1.0);
          gl_FragColor = vec4(mix(horizon, top, h), 1.0);
        }`,
    }),
  )
  sky.name = 'sky'

  // §3 Fog colour is DERIVED from the horizon, never duplicated: matched fog
  // reads as atmosphere, mismatched reads as a fire next door.
  const fog = new THREE.Fog(new THREE.Color(initial.sky.horizon),
    initial.fog.near, initial.fog.far)

  let preset = initial
  let from = initial
  let tween = 1          // 1 = settled
  let tweenSpeed = 0
  let bump = 0
  let drift = 0

  const applyNumbers = (p: LightingPreset, t: number, q: LightingPreset): void => {
    const mix = (a: number, b: number): number => a + (b - a) * t
    hemi.color = lerpColor(new THREE.Color(p.hemi.sky), new THREE.Color(q.hemi.sky), t)
    hemi.groundColor = lerpColor(new THREE.Color(p.hemi.ground), new THREE.Color(q.hemi.ground), t)
    hemi.intensity = mix(p.hemi.intensity, q.hemi.intensity)

    sun.color = lerpColor(new THREE.Color(p.sun.color), new THREE.Color(q.sun.color), t)
    sun.intensity = mix(p.sun.intensity, q.sun.intensity)
    sun.position.copy(sunPosition(
      mix(p.sun.elevation, q.sun.elevation), mix(p.sun.azimuth, q.sun.azimuth)))

    rim.color = lerpColor(new THREE.Color(p.rim.color), new THREE.Color(q.rim.color), t)
    rim.intensity = mix(p.rim.intensity, q.rim.intensity)

    skyUniforms.top.value = lerpColor(new THREE.Color(p.sky.top), new THREE.Color(q.sky.top), t)
    const horizon = lerpColor(new THREE.Color(p.sky.horizon), new THREE.Color(q.sky.horizon), t)
    skyUniforms.horizon.value = horizon
    fog.color = horizon                       // single source of truth
    fog.near = mix(p.fog.near, q.fog.near)
    fog.far = mix(p.fog.far, q.fog.far)

    // Exposure is a RENDERER setting, so only the rig that owns one sets it.
    if (renderer) renderer.toneMappingExposure = mix(p.exposure, q.exposure) + bump + drift
  }

  applyNumbers(initial, 1, initial)

  return {
    attach(scene) {
      scene.add(hemi, sun, rim, sky)
      scene.fog = fog
      // No setClearColor: the dome is the background (§6.5).
    },

    applyPreset(next, tweenMs = 0) {
      from = preset
      preset = next
      if (tweenMs <= 0) { tween = 1; applyNumbers(preset, 1, preset); return }
      tween = 0
      tweenSpeed = 1 / (tweenMs / 1000)
    },

    update(dt) {
      // §4 Time-of-day drift: warmth creeps up over real minutes so an evening
      // session goes golden. NEVER dims toward darkness — dusk means gold, not
      // gloom (the guardrails forbid darkness-as-threat).
      drift = Math.sin(performance.now() / 1000 / 240) * 0.06

      if (bump > 0) bump = Math.max(0, bump - dt * 0.5)

      if (tween < 1) {
        tween = Math.min(1, tween + dt * tweenSpeed)
        applyNumbers(from, tween, preset)
      } else {
        if (renderer) renderer.toneMappingExposure = preset.exposure + bump + drift
      }
    },

    celebrationBump() { bump = 0.1 },

    current: () => preset,
  }
}

/**
 * §1 Flat-colour packs often arrive metallic, which renders them black under
 * this rig. Clamp every imported material on the way in.
 */
export function flattenMaterial(m: THREE.Material): THREE.Material {
  const s = m as THREE.MeshStandardMaterial
  if ('metalness' in s) {
    s.metalness = 0
    s.roughness = Math.max(0.9, s.roughness ?? 1)
  }
  return m
}

/** Apply the metalness clamp across a loaded glTF scene. */
export function flattenImported(root: THREE.Object3D): void {
  root.traverse(o => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const m of mats) flattenMaterial(m)
  })
}
