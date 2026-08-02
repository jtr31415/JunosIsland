/**
 * Types for the sign-off generator, so `tests/island/signed-off.test.ts` can
 * call the generator's OWN rule rather than restating it.
 *
 * Same shape and same reasoning as `tools/workbench/api.d.mts`: the tool is
 * plain JavaScript and stays that way, so this is deliberately thin — the
 * exported surface and nothing more. `signedOffFrom` takes `unknown` because it
 * is handed a file Joe hand-edits; validating rather than trusting is the whole
 * job of the function.
 */
export declare const SIGNED_OFF: string
export declare const AUDIT: string
export declare const MIRROR: string
export declare const SCHEMA_VERSION: number

export declare function signedOffFrom(audit: unknown): string[]
export declare function mirrorText(species: readonly string[]): string
export declare function regenerateSignoffs(root: string): {
  path: string
  species: string[]
  changed: boolean
}
