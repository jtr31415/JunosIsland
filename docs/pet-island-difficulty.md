# Pet Island — Adaptive Difficulty Spec (ability detection & escalation)

Governs how challenge *difficulty* (not length — the cost curves own length)
detects readiness and escalates. Principles, in order: **child-led** (big
shifts are offered, never imposed), **no ledge** (blends, not cliffs),
**incentivised bravery** (harder pays more, most at first), **invisible
failure** (de-escalation is silent; the child never sees stats or labels).
Written pre-status-update; reconcile against the field report when it lands.

---

## 1. Signals (from existing per-item records; no new telemetry)

- **Accuracy** `A`: EWMA (α = 0.15) of correct/incorrect over attempts at the
  current mix, per domain. Window ≈ last 20 attempts.
- **Fluency** `F`: share of *correct* answers whose latency beats the child's
  own rolling median latency for that item class (personal baseline — device
  lag and steady-but-slow temperaments are not penalised). Fast-wrong counts
  for nothing.
- **Consistency** `C`: zero frustration-rescues in the window AND the current
  mix held across ≥ 2 distinct calendar days (one hot afternoon is not
  consolidation).

**Readiness gate:** `A ≥ 0.90` AND `F ≥ 0.70` AND `C` true.
Signals update on every answer; the gate is *acted on* only at boundaries
(tile complete, egg hatched, session start). Never mid-flow.

## 2. Strata & the mix vector (no ledge, ever)

- Each domain defines ordered **strata** in data, e.g. maths:
  S0 add-within-5 · S1 add-within-10 · S2 add-to-20-no-bridge · S3 bridging ·
  S4 missing-number · (× tables later). Reading: word length / grapheme
  complexity / alien share / tricky share, same machinery.
- The generator draws from a **mix vector**, e.g. `{S1: .8, S2: .2}`.
  Escalation = shifting weight toward the next stratum in steps (§4); there
  is no moment where everything changes.

## 3. Probes (sampling the future)

- Once `A ≥ 0.80` at the current mix, **1 item in 10** is drawn one stratum
  above (jittered 8–12). Probes are visually identical to normal items —
  no label, no warning — and are exempt from the rescue-lock streak count.
- Probes pay the tricky premium on success (§5), cost nothing on failure,
  and their accuracy feeds readiness detection: probe performance is the
  strongest predictor that an offer will land well.

## 4. The offer (child-led escalation)

- **Trigger:** readiness gate true AND a completion high just occurred
  (tile bloomed / egg hatched) AND no offer in this session AND no decline
  within the last 2 sessions.
- **Fred:** "Those sums are easy-peasy for you! Want some trickier ones?
  Tricky sums fill things up faster!" Buttons: **"Yes! Tricky!"** /
  **"Not today"** — both cheerful; declining costs nothing and suppresses
  re-offers for 2 sessions.
- **Accept:** mix shifts +20 points toward S+1, honeymoon starts (§5).
- **Silent creep is forbidden** for the mix itself — only probes sample ahead
  without consent. Child-led means led by the child.
- **Reluctant-but-ready:** after 3 declines with sustained `A ≥ 0.95`
  including probes, the parent dashboard flags "ready but reluctant —
  consider encouragement". Parent modes (Auto / Hold / Manual) override all
  of this.

## 5. Incentives (bravery pays)

- Progress units: easy item = 2, tricky (S+1) item = 3.
- **Honeymoon:** for 2 sessions after accepting an offer, tricky items pay
  4 (double). Decays to the permanent 3.
- **Interaction guard:** during a honeymoon the tile/egg cost curves freeze
  at their current values — never squeeze length and difficulty at once.

## 6. Mercy (silent, automatic, cheerful)

- **Trigger:** 2 rescue events in one session at the current mix, OR
  `A < 0.70` sustained over a window.
- **Action:** mix shifts −10 points toward the easier stratum. No
  announcement, no changed tone, nothing visible — de-escalation announced
  is failure declared. The world simply gets a little kinder.
- Mercy never undoes more than one offer's worth of shift per session.

## 7. Timing summary

| Event | When |
|---|---|
| Signal update | every answer |
| Probe injection | 1 in 8–12 items, once A ≥ .80 |
| Readiness check | tile/egg completion, session start |
| Offer | at a completion high; max 1/session; respects declines |
| Mercy check | continuously; acts at next item generation |
| Honeymoon | 2 sessions from acceptance |

## 8. Dashboard surfacing (parent-only, PIN-gated)

Current mix per domain, offer/accept/decline history, honeymoon status,
mercy events (count, not drama), "ready but reluctant" flag, probe accuracy
vs base accuracy. The child sees none of it, ever — they see Fred asking a
fun question and tiles filling faster.

## 9. balance.json additions

```json
"difficulty": {
  "ewmaAlpha": 0.15, "window": 20,
  "gate": { "accuracy": 0.90, "fluentShare": 0.70, "minDays": 2 },
  "probe": { "minAccuracy": 0.80, "every": [8, 12] },
  "offer": { "shift": 0.20, "declineCooldownSessions": 2,
             "reluctantFlagDeclines": 3 },
  "pay":   { "easy": 2, "tricky": 3, "honeymoon": 4,
             "honeymoonSessions": 2 },
  "mercy": { "rescuesPerSession": 2, "accuracyFloor": 0.70, "shift": 0.10 }
}
```

## 10. Guardrails

No visible difficulty labels or levels; no failure language anywhere; probes
indistinguishable from normal items; mercy invisible; stats parent-only; the
offer moment is always a celebration context, never a remediation one.
