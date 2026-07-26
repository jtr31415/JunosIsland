# Pet Island — Lighting & Atmosphere Brief

With flat-shaded low-poly assets, lighting is not polish — it is the renderer's
entire art direction. This document is the spec. Lighting values are **data**
(§5), never hardcoded. Companion to `pet-island-brief.md`; this file amends its
"no shadow maps" line (see §3).

---

## 1. Renderer foundation (non-negotiable, do first)

- `renderer.outputColorSpace = SRGBColorSpace`
- `renderer.toneMapping = ACESFilmicToneMapping`, `toneMappingExposure` from the
  active preset (baseline 1.1). This pair is the number-one fix for
  "washed-out compared to everyone's screenshots".
- `antialias: true`; clamp `setPixelRatio(Math.min(devicePixelRatio, 2))`.
- GLTF import pipeline: **clamp `metalness = 0`** on every imported material
  (flat-colour packs often arrive metallic and render black), roughness ≥ 0.9.
- No post-processing stack on tablet. No bloom. MSAA only.

## 2. The rig — exactly three lights

1. **HemisphereLight** (the workhorse — poor man's global illumination):
   sky colour pale cool blue, ground colour warm sand. This is what gives
   shadow sides *colour* instead of grey: upward faces cool, downward faces
   warm. The warm-key/cool-shadow contrast is 80% of "alive".
2. **One DirectionalLight sun**: warm gold, elevation ~35°, azimuth fixed to
   the style bible's single light direction. Never noon-overhead (flat,
   cafeteria). The only shadow caster if shadows are enabled.
3. **Optional rim fill**: cool pale blue, low intensity, opposite azimuth,
   casts nothing — peels silhouettes off the background.

**Forbidden:** `AmbientLight(0xffffff)`, point-light clusters, per-object
lights. This is an island, not a nightclub.

## 3. Grounding & depth

- **Blob shadows** under every pet and loose prop: soft radial-gradient
  sprite, scales down with hop height (airborne = smaller). Cheap, always on,
  and the thing that glues cubes to ground. Already animation doctrine.
- **Real shadow map — amendment:** the main brief's "no shadow maps" was a
  performance posture, not scripture. Permitted: **one** 1024px map,
  PCFSoft, tight orthographic frustum fitted to island bounds, sun-only.
  Gate on measured fps on the target tablet at M4; ship a settings toggle and
  degrade gracefully to blob-only.
- **Fog:** linear `scene.fog`, colour **identical to the sky horizon band**
  (single source of truth in the preset — matched fog reads as atmosphere,
  mismatched reads as a fire next door). Near/far tuned to island diameter.
- **Sky:** a gradient dome (inverted sphere with a two-stop vertex gradient or
  canvas texture), never a flat clear colour — the orbit camera makes sky a
  third of every frame.

## 4. Living light (the "alive" multiplier)

- **Time-of-day drift:** slow, subtle lerp of the active preset's warmth over
  real minutes; evening play sessions drift golden. **Never dim toward
  darkness** — guardrails forbid darkness-as-threat; dusk means gold, not
  gloom.
- **Biome/season tween:** when the dominant biome in frame changes or the
  calendar season turns, tween to that preset over 2–3s (numeric lerp;
  colours interpolated in linear space).
- **Water sparkle:** animated highlight band crawling across water hexes
  (UV-scrolled emissive mask or vertex shimmer).
- **Ambient particles per preset:** pollen / fireflies / snow via the ported
  particle engine; emitter params live in the preset.
- **Celebration bump:** +0.1 exposure for ~2s during hatch and move-in
  ceremonies. Juice, kept subtle.

## 5. Presets as data

One JSON per biome × season variant. Example:

```json
{
  "id": "meadow-day",
  "sky":  { "top": "#7ec8ff", "horizon": "#eaf6ff" },
  "sun":  { "color": "#ffe3b3", "intensity": 1.6, "elevation": 35, "azimuth": 40 },
  "hemi": { "sky": "#bfe3ff", "ground": "#ffd9a0", "intensity": 0.9 },
  "rim":  { "color": "#9fb8ff", "intensity": 0.25 },
  "fog":  { "near": 30, "far": 90 },
  "exposure": 1.1,
  "particles": "pollen"
}
```

- Fog colour is derived from `sky.horizon` — never duplicated.
- Single entry point: `applyPreset(idOrJson, tweenMs)`.
- **Debug panel** (lil-gui, dev flag only): binds live to the active preset,
  with a "copy JSON" button — tune like a cinematographer, paste like an
  engineer. Final tuning session happens **on the child's actual tablet
  screen**, not a desktop monitor.

## 6. Retrofit checklist (the build is mid-flight; refactor, don't restart)

1. Create a `lighting/` module owning: renderer config, the three lights, sky
   dome, fog, preset load/tween, debug panel. Everything else asks it;
   nothing else touches lights.
2. Grep and delete: every `AmbientLight`, stray `PointLight`, per-object
   light hack, scattered `toneMapping`/`outputColorSpace` assignments.
3. Move all existing hardcoded lighting numbers into `presets/meadow-day.json`
   as the baseline; commit `presets/*.json`.
4. Add the metalness clamp to the GLTF import path.
5. Replace flat `setClearColor` with the sky dome; wire fog to the preset.
6. Attach the blob-shadow component in the pet/prop spawners.
7. Acceptance: screenshots of meadow-day, ocean-cove and a dusk drift; visible
   warm-key/cool-shadow contrast; ≥55 fps on the target tablet with the shadow
   map on and off.

## 7. Sins (auto-reject in review)

Uniform white ambient light · noon-overhead sun · grey shadow sides · fog that
doesn't match the horizon · any bloom/post stack · pure black materials ·
lighting numbers hardcoded outside presets.
