/**
 * Fred's Lonely Rock — the opening (brief section 3), verbatim.
 *
 * Twenty seconds, tap-to-advance, fully TTS-voiced. Plays once per profile,
 * skippable, and replayable forever by tapping Fred ("tell me again?").
 *
 * The wording is load-bearing. These lines establish the STANDING WORLD-LAW
 * vocabulary the rest of the game reuses: eggs *hatch when read to*, pets
 * *come home* when their name is read, land is *counted up*. Rewording them
 * here quietly breaks the game's internal logic for the child, so the copy is
 * kept exactly as the brief specifies.
 */

export interface Beat {
  /** What Fred says. [NAME] is replaced with the child's name. */
  line: string
  /** What the world does as he says it. */
  cue?: 'egg-arrives' | 'point-egg' | 'first-read' | 'ask-land' | 'first-sum'
}

export const OPENING: Beat[] = [
  { line: 'Oh! Hello, [NAME].' },
  { line: "I'm Fred. It's just me on this little rock." },
  { line: "It's ever so quiet out here." },
  { line: 'Ooh! Look! An egg!', cue: 'egg-arrives' },
  {
    line: 'Eggs come from far across the sea… and they only hatch for someone who reads to them.',
    cue: 'point-egg',
  },
  { line: 'Will you read to it, [NAME]?', cue: 'first-read' },
  { line: 'You found its name! [PETNAME] has arrived.' },
  {
    line: 'Every friend you read home needs somewhere to live… can you count us up some land?',
    cue: 'ask-land',
  },
]

/** Spoken when an egg hatches, after the opening. Brief section 3. */
export const HATCH_LINES = [
  '[PETNAME] has arrived!',
  '[PETNAME] is here!',
]

export const fill = (s: string, name: string, petName = ''): string =>
  s.replace(/\[NAME\]/g, name).replace(/\[PETNAME\]/g, petName)
