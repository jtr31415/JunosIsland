/**
 * OUR names for the nameless pieces inside each pack body. GENERATED — do not
 * hand-edit; run `node tools/workbench/anatomy-names.mjs <census.json>`.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * A Kenney pet's `body` mesh is one mesh with one name, and it comes apart into
 * between four and twelve disjoint shells that the file never names. These are
 * what those shells were called by the agent that surveyed all 24 of them. They
 * are guesses about what a shape IS, made from its size and where it sits, and
 * the anatomy gallery prints them in a different colour with `our name:` in
 * front for exactly that reason.
 *
 * `tris` and `c` are not decoration. The viewer recomputes the split live from
 * the GLB and checks both against this table before it will show a name; if the
 * component count or a triangle count disagrees it labels the part
 * `unnamed component N` instead. A wrong name here is worse than no name.
 *
 * Ordered as `orderComponents` orders: triangles descending, then centroid x,
 * y, z descending.
 */

/** One component of one body: what it measures, and what we decided to call it. */
export interface NamedComponent {
  /** Triangles in the component, as counted by the position-welded split. */
  tris: number
  /** Vertices in the component, counted before welding. */
  verts: number
  /** Centroid in model units — the mean of its welded vertex positions. */
  c: readonly [number, number, number]
  /** OUR name. Nothing in the GLB says this. */
  name: string
}

export const COMPONENT_NAMES: Readonly<Record<string, readonly NamedComponent[]>> = {
  beaver: [
    { tris: 92, verts: 168, c: [0.4475, 1.1625, 0.2475], name: "ear-right" },
    { tris: 92, verts: 168, c: [-0.4525, 1.1625, 0.2475], name: "ear-left" },
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 28, verts: 24, c: [0.075856, 0.369011, 0.655686], name: "nose-tip" },
    { tris: 28, verts: 24, c: [-0.075856, 0.369011, 0.655686], name: "nose-tip" },
    { tris: 27, verts: 31, c: [0.240361, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240361, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 25, verts: 45, c: [0, 0.5595, 0.695656], name: "nose-tip" },
    { tris: 23, verts: 45, c: [0, 0.664284, 0.739403], name: "nose-tip" },
  ],
  bee: [
    { tris: 92, verts: 168, c: [0, 0.625, 0], name: "abdomen-segment (torso shell-ring)" },
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 48, verts: 108, c: [0.227581, 1.449356, 0.572515], name: "ear-right" },
    { tris: 48, verts: 108, c: [-0.227581, 1.449356, 0.572515], name: "ear-left" },
    { tris: 34, verts: 68, c: [0.227581, 1.325842, 0.468457], name: "ear-right" },
    { tris: 34, verts: 68, c: [-0.227581, 1.325842, 0.468457], name: "ear-left" },
    { tris: 27, verts: 31, c: [0.240361, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240361, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 12, verts: 14, c: [0, 0.517886, 0.635], name: "face-plate (flat cut-out sheet)" },
  ],
  bunny: [
    { tris: 60, verts: 132, c: [0.304074, 1.472634, 0.344956], name: "ear-right" },
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 60, verts: 132, c: [-0.304074, 1.472634, 0.344956], name: "ear-left" },
    { tris: 38, verts: 72, c: [0.194845, 1.165241, 0.367916], name: "front-of-face feature (tooth/tusk/cheek)-right" },
    { tris: 38, verts: 72, c: [0, 1.215364, 0.462423], name: "muzzle/snout" },
    { tris: 38, verts: 72, c: [-0.194845, 1.165241, 0.367916], name: "front-of-face feature (tooth/tusk/cheek)-left" },
    { tris: 28, verts: 48, c: [0, 0.49932, 0.65], name: "nose-tip" },
    { tris: 27, verts: 31, c: [0.240362, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240361, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 23, verts: 45, c: [0, 0.618698, 0.678217], name: "nose-tip" },
  ],
  cat: [
    { tris: 62, verts: 112, c: [0.336, 1.249417, 0.351559], name: "ear-right" },
    { tris: 62, verts: 112, c: [-0.336, 1.249417, 0.351559], name: "ear-left" },
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 34, verts: 38, c: [0.214232, 0.675964, 0.635], name: "eye card (flat cut-out)" },
    { tris: 34, verts: 38, c: [-0.214232, 0.675964, 0.635], name: "eye card (flat cut-out)" },
    { tris: 23, verts: 45, c: [0, 0.571698, 0.665863], name: "nose-tip" },
  ],
  caterpillar: [
    { tris: 84, verts: 154, c: [0, 0.883572, 0], name: "body-segment (torso shell-ring)" },
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 48, verts: 108, c: [0.2, 1.449356, 0.61143], name: "ear-right" },
    { tris: 48, verts: 108, c: [-0.2, 1.449356, 0.61143], name: "ear-left" },
    { tris: 34, verts: 68, c: [0.2, 1.325842, 0.507372], name: "ear-right" },
    { tris: 34, verts: 68, c: [-0.2, 1.325842, 0.507372], name: "ear-left" },
    { tris: 25, verts: 29, c: [0.216999, 0.753077, 0.635], name: "eye card (flat cut-out)" },
    { tris: 25, verts: 29, c: [-0.216999, 0.753077, 0.635], name: "eye card (flat cut-out)" },
    { tris: 16, verts: 22, c: [0.336877, 0.441474, 0.65], name: "front-of-face feature (tooth/tusk/cheek)-right" },
    { tris: 16, verts: 22, c: [-0.336877, 0.441474, 0.65], name: "front-of-face feature (tooth/tusk/cheek)-left" },
    { tris: 12, verts: 14, c: [0, 0.545425, 0.635], name: "face-plate (flat cut-out sheet)" },
  ],
  chick: [
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 38, verts: 72, c: [0.194845, 1.265241, 0.267916], name: "ear-right" },
    { tris: 38, verts: 72, c: [0, 1.317, 0.4], name: "head-tuft/crest (central, topmost)" },
    { tris: 38, verts: 72, c: [-0.194845, 1.265241, 0.267916], name: "ear-left" },
    { tris: 32, verts: 54, c: [0, 0.505999, 0.625], name: "beak" },
    { tris: 30, verts: 34, c: [0.217941, 0.7125, 0.635], name: "eye card (flat cut-out)" },
    { tris: 30, verts: 34, c: [-0.217941, 0.7125, 0.635], name: "eye card (flat cut-out)" },
  ],
  cow: [
    { tris: 180, verts: 112, c: [0, 0.926584, 0.314286], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 38, verts: 72, c: [0.205752, 1.246465, 0.42], name: "horn/ear-right" },
    { tris: 38, verts: 72, c: [-0.205752, 1.246465, 0.42], name: "horn/ear-left" },
    { tris: 27, verts: 31, c: [0.240362, 0.679625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240362, 0.679625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 10, verts: 12, c: [0.635, 0.8155, -0.18606], name: "flank-patch card (flat marking, one side only)" },
    { tris: 10, verts: 12, c: [0.635, 0.5125, 0.095994], name: "flank-patch card (flat marking, one side only)" },
    { tris: 2, verts: 4, c: [0.1, 0.5775, 0.835], name: "nostril card (flat)" },
    { tris: 2, verts: 4, c: [-0.1, 0.5775, 0.835], name: "nostril card (flat)" },
  ],
  crab: [
    { tris: 108, verts: 214, c: [0.927839, 0.756215, 0.170443], name: "claw-right" },
    { tris: 108, verts: 214, c: [-0.927839, 0.756215, 0.170443], name: "claw-left" },
    { tris: 92, verts: 168, c: [0, 0.365, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 32, verts: 52, c: [0.730477, 0.454905, 0.152379], name: "claw-right" },
    { tris: 32, verts: 52, c: [-0.730477, 0.454905, 0.152379], name: "claw-left" },
    { tris: 27, verts: 31, c: [0.240362, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240362, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 14, verts: 16, c: [0, 0.523921, 0.66988], name: "face-plate (flat cut-out sheet)" },
  ],
  deer: [
    { tris: 180, verts: 344, c: [0, 0.899875, 0.276744], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 93, verts: 183, c: [0.412712, 1.504546, 0.405035], name: "antler-right" },
    { tris: 93, verts: 183, c: [-0.412712, 1.504546, 0.405035], name: "antler-left" },
    { tris: 43, verts: 101, c: [0.302913, 1.573139, 0.452532], name: "antler-right" },
    { tris: 43, verts: 101, c: [-0.302913, 1.573139, 0.452532], name: "antler-left" },
    { tris: 27, verts: 31, c: [0.240361, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240361, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 26, verts: 50, c: [0, 0.672735, 0.884202], name: "nose-tip" },
    { tris: 22, verts: 40, c: [0, 0.560744, 0.763852], name: "nose" },
    { tris: 13, verts: 25, c: [0.139641, 1.380524, 0.359534], name: "antler-right" },
    { tris: 13, verts: 25, c: [-0.139641, 1.380524, 0.359534], name: "antler-left" },
  ],
  dog: [
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 46, verts: 82, c: [0, 0.500464, 0.82184], name: "nose-tip" },
    { tris: 36, verts: 60, c: [0.354957, 1.226137, 0.494335], name: "ear-right" },
    { tris: 36, verts: 60, c: [-0.354957, 1.226137, 0.494335], name: "ear-left" },
    { tris: 27, verts: 31, c: [0.240362, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240361, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 25, verts: 45, c: [0, 0.523611, 0.685], name: "nose" },
    { tris: 23, verts: 45, c: [0, 0.674628, 0.715862], name: "nose" },
    { tris: 14, verts: 16, c: [0, 0.573921, 0.735], name: "face-plate (flat cut-out sheet)" },
    { tris: 10, verts: 12, c: [0.635, 0.8155, -0.18606], name: "flank-patch card (flat marking, one side only)" },
    { tris: 10, verts: 12, c: [0.635, 0.5125, 0.095994], name: "flank-patch card (flat marking, one side only)" },
  ],
  elephant: [
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 58, verts: 100, c: [0.798019, 0.628125, 0.186634], name: "ear-right" },
    { tris: 58, verts: 100, c: [-0.798019, 0.628125, 0.186634], name: "ear-left" },
    { tris: 38, verts: 24, c: [0.309375, 0.375353, 0.698205], name: "front-of-face feature (tooth/tusk/cheek)-right" },
    { tris: 38, verts: 72, c: [0.194845, 1.031327, 0.491735], name: "ear-right" },
    { tris: 38, verts: 72, c: [0, 1.1295, 0.525], name: "head-tuft/crest (central, topmost)" },
    { tris: 38, verts: 72, c: [-0.194845, 1.031327, 0.491735], name: "ear-left" },
    { tris: 38, verts: 24, c: [-0.309375, 0.375353, 0.698205], name: "front-of-face feature (tooth/tusk/cheek)-left" },
    { tris: 27, verts: 31, c: [0.214362, 0.66695, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.214362, 0.66695, 0.635], name: "eye card (flat cut-out)" },
  ],
  fish: [
    { tris: 92, verts: 144, c: [0, 0.625, 0], name: "body-shell-overlay (torso shell-ring)" },
    { tris: 78, verts: 140, c: [-0.016071, 0.625, 0.011607], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 44, verts: 84, c: [0, 1.323816, 0.037562], name: "head-tuft/crest (central, topmost)" },
    { tris: 30, verts: 34, c: [0.217941, 0.7125, 0.635], name: "eye card (flat cut-out)" },
    { tris: 30, verts: 34, c: [-0.217941, 0.7125, 0.635], name: "eye card (flat cut-out)" },
    { tris: 12, verts: 14, c: [0, 0.483792, 0.635], name: "face-plate (flat cut-out sheet)" },
  ],
  fox: [
    { tris: 184, verts: 340, c: [0, 1.07785, 0.233968], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 34, verts: 41, c: [0, 0.597477, 0.758533], name: "nose" },
    { tris: 27, verts: 31, c: [0.240362, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240361, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 26, verts: 50, c: [0, 0.674766, 0.872369], name: "nose-tip" },
  ],
  giraffe: [
    { tris: 60, verts: 112, c: [0.576041, 1.023211, 0.45], name: "side-appendage (ear/arm/claw)-right" },
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 60, verts: 112, c: [-0.578519, 1.017229, 0.45], name: "side-appendage (ear/arm/claw)-left" },
    { tris: 48, verts: 108, c: [0.244411, 1.392444, 0.4], name: "ossicone-right" },
    { tris: 48, verts: 108, c: [-0.244411, 1.392444, 0.4], name: "ossicone-left" },
    { tris: 28, verts: 48, c: [0, 0.544462, 0.658], name: "nose-tip" },
    { tris: 27, verts: 31, c: [0.240362, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240362, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 22, verts: 40, c: [0.214647, 1.281363, 0.4], name: "ossicone-right" },
    { tris: 22, verts: 40, c: [-0.214647, 1.281363, 0.4], name: "ossicone-left" },
    { tris: 10, verts: 12, c: [0.635, 0.8155, -0.18606], name: "flank-patch card (flat marking, one side only)" },
    { tris: 10, verts: 12, c: [0.635, 0.5125, 0.095994], name: "flank-patch card (flat marking, one side only)" },
  ],
  hog: [
    { tris: 84, verts: 154, c: [0, 0.927229, 0.142917], name: "brow/forehead feature" },
    { tris: 84, verts: 154, c: [0, 0.927229, -0.252916], name: "brow/forehead feature" },
    { tris: 62, verts: 112, c: [0.321795, 1.196394, 0.403891], name: "ear-right" },
    { tris: 62, verts: 112, c: [-0.321795, 1.196394, 0.40389], name: "ear-left" },
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 44, verts: 80, c: [0, 0.63819, 0.755], name: "nose-tip" },
    { tris: 38, verts: 72, c: [0.318252, 0.522774, 0.701589], name: "front-of-face feature (tooth/tusk/cheek)-right" },
    { tris: 38, verts: 72, c: [-0.318252, 0.522774, 0.701589], name: "front-of-face feature (tooth/tusk/cheek)-left" },
    { tris: 27, verts: 31, c: [0.240362, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240362, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 2, verts: 4, c: [0.1, 0.6275, 0.835], name: "nostril card (flat)" },
    { tris: 2, verts: 4, c: [-0.1, 0.6275, 0.835], name: "nostril card (flat)" },
  ],
  koala: [
    { tris: 92, verts: 168, c: [0.6, 0.875706, 0.126002], name: "ear-right" },
    { tris: 92, verts: 168, c: [-0.6, 0.875706, 0.126002], name: "ear-left" },
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 44, verts: 80, c: [0, 0.548675, 0.6945], name: "nose-tip" },
    { tris: 38, verts: 72, c: [0.05148, 1.182008, 0.52349], name: "ear-right" },
    { tris: 38, verts: 72, c: [-0.116086, 1.10786, 0.474005], name: "ear-left" },
    { tris: 27, verts: 31, c: [0.240361, 0.699625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240361, 0.699625, 0.635], name: "eye card (flat cut-out)" },
  ],
  lion: [
    { tris: 124, verts: 224, c: [0, 0.725, 0.25], name: "mane (torso shell-ring)" },
    { tris: 92, verts: 168, c: [0.375, 1.155736, 0.4975], name: "ear-right" },
    { tris: 92, verts: 168, c: [-0.375, 1.155736, 0.4975], name: "ear-left" },
    { tris: 50, verts: 100, c: [0, 0.625, -0.115], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 29, verts: 59, c: [0, 0.683982, 0.734944], name: "nose-tip" },
    { tris: 28, verts: 48, c: [0, 0.5125, 0.675], name: "nose-tip" },
    { tris: 27, verts: 31, c: [0.240362, 0.779625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240362, 0.779625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 18, verts: 28, c: [0, 0.625, 0.5625], name: "muzzle/snout" },
    { tris: 14, verts: 16, c: [0, 0.548921, 0.735], name: "face-plate (flat cut-out sheet)" },
  ],
  monkey: [
    { tris: 114, verts: 198, c: [0, 0.644444, 0.157323], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 92, verts: 166, c: [0.621126, 0.688206, 0.140739], name: "arm-right" },
    { tris: 92, verts: 166, c: [-0.628875, 0.688206, 0.136265], name: "arm-left" },
    { tris: 46, verts: 82, c: [0, 0.426883, 0.647736], name: "nose-tip" },
    { tris: 38, verts: 72, c: [0.194845, 1.265241, 0.267916], name: "ear-right" },
    { tris: 38, verts: 72, c: [0, 1.317, 0.4], name: "head-tuft/crest (central, topmost)" },
    { tris: 38, verts: 72, c: [-0.194845, 1.265241, 0.267916], name: "ear-left" },
    { tris: 30, verts: 34, c: [0.217941, 0.7125, 0.635], name: "eye card (flat cut-out)" },
    { tris: 30, verts: 34, c: [-0.217941, 0.7125, 0.635], name: "eye card (flat cut-out)" },
    { tris: 12, verts: 14, c: [0, 0.4758, 0.635], name: "face-plate (flat cut-out sheet)" },
  ],
  panda: [
    { tris: 116, verts: 216, c: [0.4475, 1.1625, 0.366111], name: "ear-right" },
    { tris: 116, verts: 216, c: [-0.4525, 1.1625, 0.366111], name: "ear-left" },
    { tris: 92, verts: 48, c: [0, 0.625, -0.2725], name: "rump-shell (torso shell-ring)" },
    { tris: 72, verts: 112, c: [0, 0.575686, 0.053534], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 57, verts: 61, c: [0.248767, 0.750448, 0.635], name: "eye card (flat cut-out)" },
    { tris: 57, verts: 61, c: [-0.248767, 0.750448, 0.635], name: "eye card (flat cut-out)" },
    { tris: 25, verts: 18, c: [0, 0.53655, 0.68388], name: "nose-tip" },
    { tris: 23, verts: 45, c: [0, 0.632133, 0.778821], name: "nose-tip" },
  ],
  parrot: [
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 30, verts: 34, c: [0.217941, 0.7125, 0.635], name: "eye card (flat cut-out)" },
    { tris: 30, verts: 34, c: [-0.217941, 0.7125, 0.635], name: "eye card (flat cut-out)" },
    { tris: 28, verts: 48, c: [0, 0.504077, 0.700491], name: "beak" },
  ],
  penguin: [
    { tris: 80, verts: 130, c: [0, 0.710545, 0.041665], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 38, verts: 72, c: [0.194845, 1.265241, 0.267916], name: "ear-right" },
    { tris: 38, verts: 72, c: [0, 1.317, 0.4], name: "head-tuft/crest (central, topmost)" },
    { tris: 38, verts: 72, c: [-0.194845, 1.265241, 0.267916], name: "ear-left" },
    { tris: 32, verts: 54, c: [0, 0.505999, 0.625], name: "beak" },
    { tris: 30, verts: 34, c: [0.217941, 0.7125, 0.635], name: "eye card (flat cut-out)" },
    { tris: 30, verts: 34, c: [-0.217941, 0.7125, 0.635], name: "eye card (flat cut-out)" },
  ],
  pig: [
    { tris: 60, verts: 120, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 36, verts: 60, c: [0.354957, 1.226137, 0.494335], name: "ear-right" },
    { tris: 36, verts: 60, c: [-0.354957, 1.226137, 0.494335], name: "ear-left" },
    { tris: 27, verts: 31, c: [0.240362, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240362, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 2, verts: 4, c: [0.09, 0.6275, 0.835], name: "nostril card (flat)" },
    { tris: 2, verts: 4, c: [-0.09, 0.6275, 0.835], name: "nostril card (flat)" },
  ],
  polar: [
    { tris: 92, verts: 60, c: [0.4475, 1.1625, 0.268], name: "ear-right" },
    { tris: 92, verts: 60, c: [-0.4525, 1.1625, 0.268], name: "ear-left" },
    { tris: 60, verts: 32, c: [0, 0.625, 0], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 27, verts: 31, c: [0.240361, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240361, 0.729625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 25, verts: 18, c: [0, 0.523611, 0.717], name: "nose" },
    { tris: 23, verts: 45, c: [0, 0.627078, 0.8336], name: "nose-tip" },
  ],
  tiger: [
    { tris: 262, verts: 454, c: [0.000881, 0.82844, 0.039482], name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    { tris: 68, verts: 122, c: [0.380817, 1.222277, 0.363677], name: "ear-right" },
    { tris: 68, verts: 122, c: [-0.380817, 1.222277, 0.363677], name: "ear-left" },
    { tris: 34, verts: 58, c: [0.489878, 0.465712, 0.526691], name: "side-appendage (ear/arm/claw)-right" },
    { tris: 34, verts: 58, c: [-0.489878, 0.465712, 0.526691], name: "side-appendage (ear/arm/claw)-left" },
    { tris: 29, verts: 59, c: [0, 0.683982, 0.734944], name: "nose-tip" },
    { tris: 27, verts: 31, c: [0.240361, 0.779625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 27, verts: 31, c: [-0.240361, 0.779625, 0.635], name: "eye card (flat cut-out)" },
    { tris: 14, verts: 16, c: [0, 0.548921, 0.735], name: "face-plate (flat cut-out sheet)" },
  ],
}
