/**
 * Has this profile been shown Fred's opening?
 *
 * One boolean, and yet it had four owners in main.ts: the boot decided whether
 * to run the story from it, the name prompt read it, `persist()` wrote whatever
 * copy of it happened to be current, and the story itself set it — on ONE of
 * its exits. The other exits are the ordinary ones. Fred hands over to the child
 * at beat six and returns; she can back out of that round (leaving costs
 * nothing, brief §19); and a reload can land on any beat at all. Every one of
 * those left the flag false, so the profile was still "never seen" and the whole
 * twenty seconds played again on the next load, and the load after that.
 *
 * So the flag stops being a variable that four places must remember to set and
 * becomes a gate that records ITSELF, the moment the story starts.
 *
 * Starting is the right moment, not finishing. Brief §3 asks for an opening that
 * plays once per profile, is skippable, and is replayable deliberately — which
 * is a description of something that has PLAYED as soon as Fred begins talking.
 * Tying the record to the last line instead makes "she watched most of it and
 * then wandered off" indistinguishable from "she has never seen it", and the
 * game resolves that by showing it to her again, forever.
 *
 * The claim is synchronous and the write is what it returns, deliberately — the
 * same shape as the revision claim in `durable.put`, and for the same reason.
 * Anything that awaits before it has staked the claim has opened a window in
 * which a second start, or a reload, sees a profile that has not been shown the
 * story it is in the middle of showing.
 */

export interface OpeningGate {
  /** Has the story been shown to this profile? True the instant it starts. */
  seen(): boolean
  /**
   * The story is starting. Claim it now; the promise is the save landing.
   *
   * Idempotent, so the deliberate replay behind the grown-ups PIN costs no
   * second write. Callers may ignore the promise — the claim itself has already
   * happened by the time this returns — but a caller that wants to know the
   * record is on disk can await it.
   */
  begin(): Promise<void>
}

export function openingGate(seen: boolean, record: () => Promise<void>): OpeningGate {
  let shown = seen
  return {
    seen: () => shown,
    begin: () => {
      if (shown) return Promise.resolve()
      shown = true
      return record()
    },
  }
}
