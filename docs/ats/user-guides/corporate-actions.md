---
id: corporate-actions
title: Corporate Actions
sidebar_label: Corporate Actions
sidebar_position: 4
---

# Corporate Actions

Learn how to execute dividends, coupon payments, balance adjustments, and voting rights for security tokens.

## Corporate Actions for Equity Tokens

### Dividend Distributions

Distribute earnings to equity token holders.

#### Accessing Dividends

1. Navigate to your equity token from the dashboard
2. Select **Admin View (green)**
3. Click on **Corporate Actions** tab
4. Select **Dividends**

#### Viewing All Dividends

The dividends table displays:

| ID  | Record Date | Execution Date | Dividend Amount | Snapshot |
| --- | ----------- | -------------- | --------------- | -------- |
| 1   | 2024-12-20  | 2024-12-27     | $5.00           | View     |
| 2   | 2025-01-20  | 2025-01-27     | $5.50           | View     |

- **ID**: Unique dividend identifier
- **Record Date**: Snapshot date to determine eligible holders
- **Execution Date**: When dividend payment is distributed
- **Dividend Amount**: Amount per token
- **Snapshot**: View holders eligible for this dividend

#### Programming a New Dividend

1. Click **"New Dividend"** or **"Add Dividend"**
2. Fill in the dividend details:
   - **Dividend Amount**: Amount per token (e.g., `5.00`)
   - **Record Date**: Select date using date picker
   - **Execution Date**: Select date using date picker (must be after record date)
3. Click **"Create"** or **"Schedule Dividend"**
4. Approve the transaction in your wallet

**Important**: The execution date must be after the record date.

#### Viewing Dividend Details

Click on a specific dividend to view:

- Dividend parameters (amount, dates)
- Total dividend amount to distribute
- List of eligible holders and their dividend amounts
- Payment status
- **Dividend Amount Calculation** (numerator, denominator, record date reached status)

#### Cancelling a Dividend

You can cancel a scheduled dividend before its execution date:

1. Navigate to the dividend details view
2. Click **"Cancel"**
3. Approve the transaction in your wallet

Once cancelled, the dividend will be marked as disabled and will not be executed. Cancellation is irreversible.

> **Note**: Only dividends that have not yet been executed can be cancelled. Requires **CORPORATE_ACTION_ROLE** or **ISSUER_ROLE**.

#### Viewing Dividend Holders

Click **"Snapshot"** or **"View Holders"** to see:

- Account addresses of eligible holders
- Balance at record date
- Dividend amount each holder will receive
- Payment status
- **Token balance** at the time of the snapshot

### Balance Adjustments (Stock Splits)

Adjust token balances for all holders (e.g., 2-for-1 stock split or 1-for-2 reverse split).

#### Accessing Balance Adjustments

1. Navigate to your equity token
2. Select **Admin View (green)**
3. Go to **Corporate Actions** → **Balance Adjustments**

#### Programming a Balance Adjustment

1. Click **"New Balance Adjustment"**
2. Fill in the details:
   - **Execution Date**: Select date using date picker
   - **Factor**: Adjustment multiplier
     - For 2:1 split, enter `2`
     - For 1:2 reverse split, enter `0.5`
3. Click **"Schedule"**
4. Approve the transaction

**Example**: If a holder has 100 tokens and you apply a factor of `2`, they will have 200 tokens after execution.

> **⚠️ Important — Backend Balance Alignment:**
> When a balance adjustment execution date is reached, the on-chain view methods
> (`balanceOf`) will immediately reflect the adjusted amounts. However, no event is
> emitted until the next on-chain operation (e.g., a transfer or issue) is executed for
> that account. During this window, backend systems that track balances exclusively via
> events may show balances that do not match on-chain state. Backend systems should
> periodically reconcile with on-chain view methods around scheduled execution dates.

### Voting Rights

Program voting events for equity holders.

#### Accessing Voting Rights

1. Navigate to your equity token
2. Select **Admin View (green)**
3. Go to **Corporate Actions** → **Voting Rights**

#### Creating a Voting Event

1. Click **"New Voting Event"**
2. Fill in the details:
   - **Name**: Voting event name (e.g., "Annual Shareholder Meeting 2025")
   - **Execution Date**: Select voting date using date picker
3. Click **"Create"**
4. Approve the transaction

#### Cancelling a Voting Event

1. Navigate to the voting event details
2. Click **"Cancel"**
3. Approve the transaction in your wallet

#### Cancelling a Balance Adjustment

Scheduled balance adjustments can also be cancelled before their execution date:

1. Navigate to the balance adjustment details
2. Click **"Cancel"**
3. Approve the transaction in your wallet

#### Viewing Voting Events

The voting rights table displays scheduled voting events with their execution dates.

---

## Executing Coupon Payments

For bond tokens, execute periodic interest payments to bondholders.

### Accessing Coupons

1. Navigate to your bond token from the dashboard
2. Select **Admin View (green)**
3. Click on **Corporate Actions** tab
4. Select **Coupons**

### Viewing All Coupons

The coupons table displays:

| ID  | Record Date | Execution Date | Start Date | End Date   | Coupon Rate | Snapshot |
| --- | ----------- | -------------- | ---------- | ---------- | ----------- | -------- |
| 1   | 2024-12-15  | 2024-12-22     | 2024-09-15 | 2024-12-15 | 5.0%        | View     |
| 2   | 2025-03-15  | 2025-03-22     | 2024-12-15 | 2025-03-15 | 5.0%        | View     |

- **ID**: Unique coupon identifier
- **Record Date**: Snapshot date for eligible bondholders
- **Execution Date**: Payment distribution date
- **Start Date**: Beginning of the coupon accrual period
- **End Date**: End of the coupon accrual period
- **Coupon Rate**: Interest rate for the period
- **Snapshot**: View eligible bondholders

> **Note**: The coupon period is calculated as the difference between start and end dates. This allows precise interest calculations based on actual accrual periods.

### Programming a New Coupon

1. Click **"New Coupon"** or **"Add Coupon"**
2. Fill in the coupon details:
   - **Coupon Rate**: Interest rate (e.g., `5.0` for 5%)
   - **Start Date**: Beginning of the coupon accrual period
   - **End Date**: End of the coupon accrual period
   - **Record Date**: Snapshot date to determine eligible bondholders (typically same as end date)
   - **Execution Date**: When coupon payment is distributed (must be after record date)
3. Click **"Create"** or **"Schedule Coupon"**
4. Approve the transaction in your wallet

**Important**:

- The start date must be before the end date
- The execution date must be after the record date
- Coupon interest is calculated based on the period between start and end dates

### Viewing Coupon Details

Click on a specific coupon to view:

- Coupon parameters (rate, start date, end date, record date, execution date)
- Coupon accrual period (calculated from start and end dates)
- Total coupon amount to distribute
- List of eligible bondholders and their coupon amounts
- Payment status
- **Coupon Amount Calculation** (numerator, denominator, record date reached status)

### Cancelling a Coupon

You can cancel a scheduled coupon before its execution date:

1. Navigate to the coupon details view
2. Click **"Cancel"**
3. Approve the transaction in your wallet

Once cancelled, the coupon will be marked as disabled and will not be executed.

### Viewing Coupon Holders

Click **"Snapshot"** or **"View Holders"** to see:

- Account addresses of eligible bondholders
- Bond balance at record date
- Coupon amount each holder will receive
- Payment status
- **Token balance and decimals** at the time of the snapshot

---

## Payment Distribution

Corporate action payments can be distributed using:

- **Direct Transfer**: For small holder counts (< 100)
- **Mass Payout Integration**: For large holder counts (recommended for > 100 holders)
- **Batch Processing**: Automatic chunking for large distributions

For large-scale distributions, consider using the [Mass Payout system](/mass-payout/).

## Permissions Required

To execute corporate actions, you need:

- **CORPORATE_ACTION_ROLE** or **ISSUER_ROLE** for scheduling dividends, coupons, splits, and voting
- **PAYMENT_PROCESSOR_ROLE** for executing payments (if applicable)

See [Roles and Permissions](./roles-and-permissions.md) for more details.

---

## Cancelling Corporate Actions

Each corporate action type has two cancellation paths depending on when it is called relative to its execution date.

### Normal cancel — use before the execution date

Use this when the action has not yet been processed on-chain. It simply marks the action as disabled and prevents any further execution.

| Action type        | Function                               |
| ------------------ | -------------------------------------- |
| Balance Adjustment | `cancelScheduledBalanceAdjustment(id)` |
| Dividend           | `cancelDividend(id)`                   |
| Voting             | `cancelVoting(id)`                     |
| Coupon             | `cancelCoupon(id)`                     |
| Amortization       | `cancelAmortization(id)`               |

These functions enforce a date guard — they revert if the execution (or record) date has already passed.

---

## ⚠️ Emergency Force-Cancel Operations

:::danger THIS SYSTEM DOES NOT PERFORM ROLLBACKS

Force cancel sets a disabled flag. It does **not** undo any on-chain state that was already written. Balances, snapshots, and coupon listings that executed before the cancel are **permanent**. If you call force cancel after execution has already occurred, your token will be in an inconsistent state with no recovery path other than a full token migration.
:::

### What are force-cancel functions?

Every corporate action type has two cancellation functions. Use the normal one whenever possible — it enforces a date guard that protects consistency. The force-cancel variant bypasses that guard and is a last resort only.

| Action type        | Normal cancel — use before execution date | Force cancel — last resort, after execution date |
| ------------------ | ----------------------------------------- | ------------------------------------------------ |
| Balance Adjustment | `cancelScheduledBalanceAdjustment(id)`    | `forceCancelScheduledBalanceAdjustment(id)`      |
| Dividend           | `cancelDividend(id)`                      | `forceCancelDividend(id)`                        |
| Voting             | `cancelVoting(id)`                        | `forceCancelVoting(id)`                          |
| Coupon             | `cancelCoupon(id)`                        | `forceCancelCoupon(id)`                          |
| Amortization       | `cancelAmortization(id)`                  | `forceCancelAmortization(id)`                    |

The normal `cancel*` functions revert if the execution (or record) date has already passed. The `forceCancel*` variants bypass that check and cancel unconditionally.

### When to use them

These functions exist exclusively as a **last-resort recovery mechanism** for situations where a failing scheduled task has blocked the task queue. When a task fails, the entire transaction reverts and the queue stops processing. Because the execution date has already passed by the time the block is discovered, the standard `cancel*` functions will revert. Force cancel is the only way to unblock.

**Do not use them as a shortcut to cancel an action that could still be cancelled via the standard flow.**

### Why they are dangerous

Force cancel only sets a disabled flag on the corporate action — it does not roll back any on-chain state that was written before the failure. The consequences depend on the action type and the exact moment the call is made.

### Risks by action type

#### Balance Adjustment

A balance adjustment permanently rescales token balances, decimals, and supply as soon as it executes on-chain. There is no rollback mechanism.

- **Before execution date** — use normal cancel, nothing has executed, no risk.
- **After execution date, task blocked (not yet executed on-chain)** — force cancel unblocks the queue safely. Be aware that any external system reading the token in virtual / KPI mode may have already projected the adjusted balance. Cancelling will cause an abrupt discrepancy from their perspective.
- **After execution date, task already executed** — force cancel marks the action as cancelled but the balance adjustment has already taken effect. The rescaling of balances, total supply, max supply, and decimals cannot be undone. This creates an inconsistency between the on-chain "cancelled" status and the actual token state, which may cause confusion in future audits.

#### Dividend and Voting

Both actions take a snapshot at the record date. The snapshot ID is stored in the action result and persists even after cancellation.

- **Before record date** — use normal cancel, snapshot never fires.
- **After record date, task blocked** — force cancel unblocks the queue. Any external system that has already read the snapshot and begun processing payments or vote tallies off-chain must be notified of the cancellation.
- **After snapshot already taken** — the snapshot remains on-chain and its ID stays in the action results. Force cancel only prevents any further processing steps from running; it does not invalidate the snapshot itself.

#### Amortization

Same pattern as dividends — a snapshot is taken at the record date, and amortization also manages token holds. The risks are identical to the dividend case.

#### Coupon

The most complex case. A coupon generates two on-chain operations at different times: a **snapshot** (at the fixing date) and a **coupon listing** (which appends the coupon ID to the ordered payment list).

- **Before fixing date** — use normal cancel. Neither the snapshot nor the listing has fired.
- **Between fixing date and execution date (listing already fired)** — the coupon ID has been appended to the ordered list. This is irreversible — the list is append-only with no removal mechanism. Force cancel will prevent the execution step from running but the coupon remains permanently in the listing.
- **After execution date** — snapshot taken, coupon listed, and payments may already have been distributed externally. Force cancel marks the action as cancelled but none of these effects can be undone. Any external system that has already processed payments based on this coupon must be notified.

> **Summary**: force cancel is safe only when applied before the scheduled task has actually fired on-chain. Once a task has executed, the `isDisabled` flag becomes a historical marker — it prevents future steps from running but does not undo any state that was already written.

### Rules before you call a force-cancel

1. **Verify off-chain that the action was never executed.** Check event logs and backend records before sending the transaction.
2. **Use multisig approval.** The `ROLE_CORPORATE_ACTION_FORCE_CANCEL` must be held by a multisig in any production environment. A single EOA must never be able to execute these functions unilaterally.
3. **Document the operation.** Record the action ID, the reason, and the authorising signatures in your governance log before executing.
4. **Notify all relevant parties.** Inform holders, custodians, and payment processors that the action has been cancelled and will not be settled.

---

## Next Steps

- [Mass Payout Documentation](/mass-payout/) - Large-scale payment distribution
- [Token Operations](./token-operations.md) - Other token operations
- [Roles and Permissions](./roles-and-permissions.md) - Managing access control
