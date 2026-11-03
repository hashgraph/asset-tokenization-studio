---
id: scheduled-tasks-force-cancel
title: Scheduled Tasks & Force-Cancel
sidebar_label: Scheduled tasks & force-cancel
---

# Scheduled Tasks & Force-Cancel

Corporate actions in ATS (dividends, voting, coupons, amortization, balance adjustments) run through
a **scheduled-task queue**. This page explains how the queue behaves when a task fails and the
**high-risk** `forceCancel*` functions that exist to unblock it. Read it before operating any token
that schedules corporate actions.

:::danger This system does NOT perform rollbacks
`forceCancel*` sets a "disabled" flag. It does **not** undo on-chain state that was already written.
Balances, snapshots, and coupon listings produced before the cancel are **permanent**. Calling
force-cancel after execution has occurred leaves the token in an inconsistent state with no recovery
path other than a full token migration.
:::

## How the task queue works

Scheduled tasks execute in order. When a task fails, the entire triggering transaction reverts and
the queue **blocks** at that task. By the time a block is discovered, the task's execution date has
usually passed — and the normal `cancel*` functions enforce a date guard, so they **refuse to act**
(they revert) once the date has passed. `forceCancel*` bypasses that guard and is the only way to
unblock the queue.

**The right time to force-cancel is _before_ the blocked task has actually executed.** Once it has
run, force-cancel changes a status flag but cannot reverse what happened on-chain.

## Cancellation functions by action type

| Action type        | Normal cancel (before execution date)  | Force cancel (after date, queue blocked)    |
| ------------------ | -------------------------------------- | ------------------------------------------- |
| Balance adjustment | `cancelScheduledBalanceAdjustment(id)` | `forceCancelScheduledBalanceAdjustment(id)` |
| Dividend           | `cancelDividend(id)`                   | `forceCancelDividend(id)`                   |
| Voting             | `cancelVoting(id)`                     | `forceCancelVoting(id)`                     |
| Coupon             | `cancelCoupon(id)`                     | `forceCancelCoupon(id)`                     |
| Amortization       | `cancelAmortization(id)`               | `forceCancelAmortization(id)`               |

## What gets permanently written

Understanding what each action commits on-chain tells you whether a force-cancel is safe:

- **Balance adjustment** — on execution, balances, total supply, max supply, and decimals are
  rescaled **permanently**. Before execution → force-cancel is safe (but external systems in
  virtual/KPI mode may have already projected the adjusted balance). After execution → the rescaling
  stands and the "cancelled" status will contradict the token state.
- **Dividend / Voting** — a snapshot is taken at the record date; its ID is stored on-chain and is
  **not** cleared by cancellation. Before the snapshot → safe. After → the snapshot and ID remain;
  notify any external system that already read it.
- **Amortization** — same pattern as dividends, plus hold management. Same risks.
- **Coupon** — fires two operations: a snapshot at the fixing date, then a coupon **listing** (an
  append to an ordered payment list with **no removal mechanism**). Once listed, the coupon ID is
  permanently in the list; force-cancel stops the execution step but cannot remove the listing.

## Rules for safe use

1. **Prefer the regular `cancel*` functions.** They include the checks that keep state consistent.
2. **Grant the corporate-action force-cancel role (`ROLE_CORPORATE_ACTION_FORCE_CANCEL`) only to a multisig** — never a single EOA, in any
   production or pre-production environment. See [Roles & permissions](./roles-and-permissions.md).
3. **Document every use.** Record the action ID, the reason, and the authorising signatures in your
   governance log, and inform every external system that may rely on the action's data.

## Further reading

The in-repo notes
[`SCHEDULED_TASKS_ISSUES.md`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/SCHEDULED_TASKS_ISSUES.md)
track known edge cases and scenarios for the task queue.

## Related pages

- [Roles & permissions](./roles-and-permissions.md) — who may call force-cancel.
- [Core concepts](./core-concepts.md) — where corporate actions fit in the system.
