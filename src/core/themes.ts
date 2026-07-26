/** Theme palettes, verbatim from v0/junos-words.html:507-515. */

export type ThemeName =
  'ocean' | 'space' | 'unicorn' | 'garden' | 'halloween' | 'christmas' | 'summer'

export interface Theme {
  /** Element id of the theme's picker button in the 2D shell. */
  btn: string
  /** Emoji shown on the score bar. */
  score: string
  /** Three particle-burst colours. */
  burst: string[]
  /** Low and high tone for this theme's sound effects. */
  lo: number
  hi: number
}

export const THEMES: Record<ThemeName, Theme> = {
  ocean:     {btn:'btnOcean',  score:'🐚', burst:['#aef4ff','#ffffff','#7fd8ff'], lo:320, hi:880},
  space:     {btn:'btnSpace',  score:'⭐', burst:['#fff6a8','#ffffff','#c9a9ff'], lo:520, hi:1240},
  unicorn:   {btn:'btnUni',    score:'💖', burst:['#ffc2e0','#ffffff','#ffe08a'], lo:620, hi:1480},
  garden:    {btn:'btnGarden', score:'🌻', burst:['#d9f57e','#ffffff','#ffd166'], lo:420, hi:1000},
  halloween: {btn:'btnHall',   score:'🎃', burst:['#ffa94d','#ffffff','#b98cff'], lo:260, hi:700},
  christmas: {btn:'btnXmas',   score:'🎁', burst:['#ff6b6b','#ffffff','#7bd88f'], lo:660, hi:1560},
  summer:    {btn:'btnSummer', score:'🍦', burst:['#ffe08a','#ffffff','#6ad4f0'], lo:480, hi:1100}
};
