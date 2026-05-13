# Compliance Modifiers & Methods — Dependency Map

Below is the map of those modifiers / methods, where each lives, what it does, and what it delegates to. Items in the original list that do not exist in the codebase are flagged.

## Modifiers

All defined under `packages/ats/contracts/contracts/services/` — they are thin abstract-contract wrappers around library functions so facets can use `modifier` syntax.

### 1. `onlyCanTransferFromByPartition(from, to, partition, value)`

`packages/ats/contracts/contracts/services/asset/ComplianceModifiers.sol:32`
The "full" transfer gate. Calls `ERC1594StorageWrapper.checkCanTransferFromByPartition(...)` and **hardcodes** `_data = EMPTY_BYTES`, `_operatorData = EMPTY_BYTES`.

Internal checks (in order):

1. Clearing is not activated
2. `from` is not the zero address
3. `to` is not the zero address
4. Compute `checkSender = (from != msg.sender) && !sender has protected-partition role for partition`
5. If `checkSender`:
   1. Sender is not a recovered wallet
   2. Sender is allowed by the control list (internal + external)
   3. Sender passes the external compliance contract (`canTransfer(sender, 0, 0)`)
6. `from` is not a recovered wallet
7. `from` is allowed by the control list
8. `to` is not a recovered wallet
9. `to` is allowed by the control list
10. Transfer passes the external compliance contract (`canTransfer(from, to, value)`)
11. `from` has GRANTED KYC (internal + external/SSI)
12. `from` is verified in the identity registry
13. `to` has GRANTED KYC
14. `to` is verified in the identity registry
15. If `checkSender && !ERC1410.isAuthorized(partition, sender, from)`: sender's allowance on `from` ≥ `value`
16. `partition` is a valid partition for `from`
17. `from`'s adjusted partition balance ≥ `value`

### 2. `onlyCanRedeemFromByPartition(from, partition, value)`

`packages/ats/contracts/contracts/services/asset/ComplianceModifiers.sol:49`
The full redeem gate. Same as transfer but with `to = address(0)`; hardcodes `_data = EMPTY_BYTES`, `_operatorData = EMPTY_BYTES`.

Internal checks (in order):

1. Clearing is not activated
2. `from` is not the zero address (the `to` zero-check is intentionally skipped — redeem destination is zero)
3. Compute `checkSender` (same logic as transfer)
4. If `checkSender`:
   1. Sender is not a recovered wallet
   2. Sender is allowed by the control list
   3. Sender passes the external compliance contract
5. `from` is not a recovered wallet
6. `from` is allowed by the control list
7. Redeem passes the external compliance contract (`canTransfer(from, address(0), value)`)
8. `from` has GRANTED KYC
9. `from` is verified in the identity registry
10. If allowance check needed: sender's allowance on `from` ≥ `value`
11. `partition` is a valid partition for `from`
12. `from`'s adjusted partition balance ≥ `value`

### 3. `onlyCompliant(from, to, checkSender)`

`packages/ats/contracts/contracts/services/asset/ComplianceModifiers.sol:67`
Narrower slice: recovery + control list + compliance contract only. Calls `ERC1594StorageWrapper.checkCompliance(from, to, checkSender)`, which **hardcodes `value = 0`** and uses `msg.sender` as operator.

Internal checks (in order):

1. If `checkSender`:
   1. Sender is not a recovered wallet
   2. Sender is allowed by the control list
   3. Sender passes the external compliance contract
2. If `from != 0`:
   1. `from` is not a recovered wallet
   2. `from` is allowed by the control list
3. If `to != 0`:
   1. `to` is not a recovered wallet
   2. `to` is allowed by the control list
4. Transfer passes the external compliance contract (`canTransfer(from, to, 0)`)

### 4. `onlyUnrecoveredAddress(_account)`

`packages/ats/contracts/contracts/services/asset/ERC3643Modifiers.sol:74`

Internal checks:

1. `_account` is not flagged as recovered in ERC3643 storage

### 5. `onlyIdentifiedAddresses(_from, _to)`

`packages/ats/contracts/contracts/services/asset/ERC3643Modifiers.sol:129`
Calls `ERC1594StorageWrapper.checkIdentity(_from, _to)`.

Internal checks:

1. If `_from != 0`:
   1. `_from` has GRANTED KYC (internal + external/SSI)
   2. `_from` is verified in the identity registry
2. If `_to != 0`:
   1. `_to` has GRANTED KYC
   2. `_to` is verified in the identity registry

### 6. `onlyAddressNotZero(_address)`

`packages/ats/contracts/contracts/services/core/DefaultValuesModifiers.sol:26`

Internal checks:

1. `_address != address(0)`

### 7. `onlyListedAllowed(_account)`

`packages/ats/contracts/contracts/services/core/ControlListModifiers.sol:21`
Calls `ControlListStorageWrapper.checkControlList(_account)`.

Internal checks:

1. Internal control list allows the account (whitelist semantics: must be on list; blacklist semantics: must not be on list)
2. All registered external lists authorize the account

### 8. `onlyValidKycStatus(_kycStatus, _account)`

`packages/ats/contracts/contracts/services/core/KycModifiers.sol:31`
Calls `KycStorageWrapper.requireValidKycStatus(_kycStatus, _account)`.

Internal checks:

1. If internal KYC is activated: account's internal KYC status equals `_kycStatus`
   1. Account's KYC entry has not expired (`validTo ≥ now`)
   2. Account's KYC entry is already active (`validFrom ≤ now`)
   3. Account's KYC issuer is still a registered SSI issuer
   4. Account's KYC credential is not revoked (revocation list lookup)
2. All registered external KYC lists return `_kycStatus` for the account

---

## Methods (library functions the modifiers call)

### 1. `checkIdentity(from, to)`

`packages/ats/contracts/contracts/domain/asset/ERC1594StorageWrapper.sol:246`
Reverting wrapper around `_isIdentified(from, to)`. Zero addresses are skipped.
**Called by:** modifier `onlyIdentifiedAddresses`, and internally by `canTransferFromByPartition` / `canRedeemFromByPartition` (via `_isIdentified`).

Internal checks:

1. If `from != 0`:
   1. `from` has GRANTED KYC (internal + external/SSI)
   2. `from` is verified in the identity registry
2. If `to != 0`:
   1. `to` has GRANTED KYC
   2. `to` is verified in the identity registry

### 2. `checkCompliance(from, to, checkSender)`

`packages/ats/contracts/contracts/domain/asset/ERC1594StorageWrapper.sol:260`
Reverting wrapper around `_isCompliant(from, to, 0, msg.sender, checkSender)`. **Hardcodes `value = 0`** and operator to `msg.sender`.
**Called by:** modifier `onlyCompliant`.

Internal checks (in order):

1. If `checkSender`:
   1. Sender is not a recovered wallet
   2. Sender is allowed by the control list
   3. Sender passes the external compliance contract (`canTransfer(sender, 0, 0)`)
2. If `from != 0`:
   1. `from` is not a recovered wallet
   2. `from` is allowed by the control list
3. If `to != 0`:
   1. `to` is not a recovered wallet
   2. `to` is allowed by the control list
4. Transfer passes the external compliance contract (`canTransfer(from, to, 0)`)

### 3. `checkValidAddress(_addr)`

`packages/ats/contracts/contracts/domain/core/ExternalListManagementStorageWrapper.sol:138`
Functionally identical to the body of `onlyAddressNotZero`. Worth deduplicating.
**Called by:** other code inside the external-list management subsystem.

Internal checks:

1. `_addr != address(0)`

### 4. `requireUnrecoveredAddress(_account)`

`packages/ats/contracts/contracts/domain/core/ERC3643StorageWrapper.sol:235`
**Called by:** modifier `onlyUnrecoveredAddress`. The same check is performed inline inside `_validateAccountForTransfer` for every party in a transfer.

Internal checks:

1. `_account` is not flagged as recovered in ERC3643 storage

### 5. `canTransferFromByPartition(from, to, partition, value, _data, _operatorData)`

`packages/ats/contracts/contracts/domain/asset/ERC1594StorageWrapper.sol:208`
Non-reverting function — returns `(bool canTransfer, bytes1 statusCode, bytes32 reasonCode, bytes details)`.
**Note:** referred to as `canTransferFromByPartition` in the original list — the function is named `canTransferFromByPartition`; `canTransfer` is just the local return variable.
**Called by:** the reverting wrapper `checkCanTransferFromByPartition` (used by `onlyCanTransferFromByPartition`), plus `Compliance.canTransfer*` and `ComplianceByPartition`.

Internal checks (in order — short-circuits on first failure):

1. Clearing is not activated
2. `from` is not the zero address
3. `to` is not the zero address
4. Compute `checkSender`
5. If `checkSender`:
   1. Sender is not a recovered wallet
   2. Sender is allowed by the control list
   3. Sender passes the external compliance contract
6. `from` is not a recovered wallet
7. `from` is allowed by the control list
8. `to` is not a recovered wallet
9. `to` is allowed by the control list
10. Transfer passes the external compliance contract (`canTransfer(from, to, value)`)
11. `from` has GRANTED KYC
12. `from` is verified in the identity registry
13. `to` has GRANTED KYC
14. `to` is verified in the identity registry
15. If `checkSender && !ERC1410.isAuthorized(partition, sender, from)`: sender's allowance on `from` ≥ `value`
16. `partition` is a valid partition for `from`
17. `from`'s adjusted partition balance ≥ `value`

### 6. `canRedeemFromByPartition(from, partition, value, _data, _operatorData)`

`packages/ats/contracts/contracts/domain/asset/ERC1594StorageWrapper.sol:154`
Same pipeline as transfer with `to = address(0)`.
**Note:** named `canRedeemFromByPartition`, not `canRedeemFromByPartition`.
**Called by:** `checkCanRedeemFromByPartition` (used by `onlyCanRedeemFromByPartition`), plus `ComplianceByPartition`.

Internal checks (in order):

1. Clearing is not activated
2. `from` is not the zero address
3. Compute `checkSender`
4. If `checkSender`:
   1. Sender is not a recovered wallet
   2. Sender is allowed by the control list
   3. Sender passes the external compliance contract
5. `from` is not a recovered wallet
6. `from` is allowed by the control list
7. Redeem passes the external compliance contract (`canTransfer(from, address(0), value)`)
8. `from` has GRANTED KYC
9. `from` is verified in the identity registry
10. If allowance check needed: sender's allowance on `from` ≥ `value`
11. `partition` is a valid partition for `from`
12. `from`'s adjusted partition balance ≥ `value`

### 7. `checkControlList(_account)`

`packages/ats/contracts/contracts/domain/core/ControlListStorageWrapper.sol:50`
Reverting wrapper around `canAccess(_account)`.
**Called by:** modifier `onlyListedAllowed`. Also reached indirectly by `_validateAccountForTransfer` (inside `_isCompliant`), which calls `canAccess` directly.

Internal checks:

1. Internal control list allows the account (`isWhiteList == list.contains(account)` — whitelist: must be on list; blacklist: must not be on list)
2. All registered external lists authorize the account

---

## Dependency graph (who calls whom)

```
onlyCanTransferFromByPartition ──► ERC1594.checkCanTransferFromByPartition ──► canTransferFromByPartition
                                                                              ├─► _genericChecks
                                                                              ├─► _isCompliant ──► _validateAccountForTransfer ──► ERC3643.isRecovered
                                                                              │                                                 └─► ControlList.canAccess  (≡ checkControlList body)
                                                                              │                └─► _validateSenderCompliance / _validateTransferCompliance (staticcall compliance contract)
                                                                              ├─► _isIdentified  (≡ checkIdentity body) ──► KycStorageWrapper.verifyKycStatus + IdentityRegistry.isVerified
                                                                              └─► _businessLogicChecks (allowance + partition validity + partition balance)

onlyCanRedeemFromByPartition  ──► ERC1594.checkCanRedeemFromByPartition  ──► canRedeemFromByPartition  (same pipeline with to = address(0))

onlyCompliant                 ──► ERC1594.checkCompliance        ──► _isCompliant  (value hardcoded to 0)
onlyIdentifiedAddresses       ──► ERC1594.checkIdentity          ──► _isIdentified
onlyUnrecoveredAddress        ──► ERC3643.requireUnrecoveredAddress
onlyListedAllowed             ──► ControlList.checkControlList   ──► ControlList.canAccess
onlyAddressNotZero            ──► DefaultValueValidation.checkZeroAddress
onlyValidKycStatus            ──► Kyc.requireValidKycStatus
checkValidAddress (library)   ──► DefaultValueValidation.checkZeroAddress   (duplicate of onlyAddressNotZero body)
```

## Redundancies worth addressing

- `checkValidAddress` (in `ExternalListManagementStorageWrapper`) and `onlyAddressNotZero` are the same thing — both delegate to `DefaultValueValidation.checkZeroAddress`. Pick one.
- `checkIdentity` and `_isIdentified` are duplicated paths to the same logic; the modifier `onlyIdentifiedAddresses` and the inline call inside `canTransferFromByPartition` / `canRedeemFromByPartition` both walk it.
- `requireUnrecoveredAddress` is performed by `onlyUnrecoveredAddress`, AND inside `_validateAccountForTransfer` (via `isRecovered`) on every party. Any caller wrapped by `onlyCanTransferFromByPartition` / `onlyCanRedeemFromByPartition` doesn't need the standalone modifier.
- `onlyListedAllowed(account)` plus `onlyCanTransferFromByPartition` is double work for `from`/`to`/`sender` — those are already control-listed inside `_validateAccountForTransfer`.
- The two reverting wrappers (`checkCanTransferFromByPartition`, `checkCanRedeemFromByPartition`) and the non-reverting `canTransferFromByPartition` / `canRedeemFromByPartition` are 1:1 — the only difference is whether the failure path reverts or returns a status tuple.

## Items in the original list that don't exist

- `canTransferFromByPartition` / `canRedeemFromByPartition` — the public names are `canTransferFromByPartition` / `canRedeemFromByPartition`; only the _local return variables_ are called `canTransfer` / `canRedeemFrom`.

---

# 🛠 Refactor Suggestions — Reducing Modifiers & Methods

> Ordered by confidence. Nothing here has been edited in code — please double-check each before acting on them.

## High-confidence redundancies

### 1. Delete `checkValidAddress` outright

`ExternalListManagementStorageWrapper.checkValidAddress` is a one-line forwarder to `DefaultValueValidation.checkZeroAddress`. The modifier `onlyAddressNotZero` already exists for the same purpose. Three names, one behavior.

- **Action**: replace every call to `checkValidAddress` with either the `onlyAddressNotZero` modifier (where a modifier fits) or a direct call to `DefaultValueValidation.checkZeroAddress` (inside libraries/internals). Delete `checkValidAddress`.

### 2. Drop `onlyListedAllowed` from functions already protected by `onlyCanTransferFromByPartition` / `onlyCanRedeemFromByPartition` / `onlyCompliant`

`_validateAccountForTransfer` (run inside `_isCompliant`) already calls `ControlListStorageWrapper.canAccess` on `from`, `to`, and the operator. Adding `onlyListedAllowed(...)` on top is a strict duplicate.

- **Action**: grep facets for combinations like `onlyCanTransferFromByPartition(...) onlyListedAllowed(...)` and remove the latter.

### 3. Drop `onlyIdentifiedAddresses` from functions already protected by `onlyCanTransferFromByPartition` / `onlyCanRedeemFromByPartition`

`_isIdentified` runs inside `canTransferFromByPartition` / `canRedeemFromByPartition`, so it's already covered.

- Same caveat: only valid where the can\* modifier is also present.

### 4. Drop `onlyUnrecoveredAddress` from functions already protected by `onlyCompliant` / `onlyCanTransferFromByPartition` / `onlyCanRedeemFromByPartition`

`_validateAccountForTransfer` checks `ERC3643StorageWrapper.isRecovered` for the same parties.

- **Action**: keep `onlyUnrecoveredAddress` as a primitive (it's cheap and useful where a function deals with one address but doesn't otherwise touch compliance — e.g. cap/role-style operations). But remove it as a duplicate guard.

## Medium-confidence simplifications

### 5. Collapse `checkIdentity` and `_isIdentified` into one function

`checkIdentity` is just a revert-wrapper used by **one** caller (`onlyIdentifiedAddresses`). `_isIdentified` is the actual logic, used by the can\* pipeline.

- **Action**: keep `_isIdentified` (returning the tuple) and have the modifier inline the "if not ok, revert" — or rename `checkIdentity` to a single canonical entry. The current shape adds an indirection layer that exists only to host one line of revert glue.

### 6. Collapse `checkCompliance` similarly

Same pattern: `checkCompliance` only exists to wrap `_isCompliant` in a revert. Single caller (`onlyCompliant`). Same recommendation as above.

### 7. Reconsider whether `onlyCompliant` needs to exist

Its check set is a strict subset of `onlyCanTransferFromByPartition` (no zero-address, no identity, no allowance, no partition, value forced to 0). If facets only use it for "I need compliance but not a full transfer", confirm that. If usage is rare or only one site, inline it and drop the modifier + the `checkCompliance` wrapper.

- **Action**: grep facets for `onlyCompliant(` and audit each usage. If every site could just as well use `onlyCanTransferFromByPartition` (or doesn't actually need recovery+control-list+compliance-contract together), this modifier can disappear.

### 8. Consolidate the revert-wrapper / boolean-pair pattern across the codebase

There's a consistent pattern of paired functions:

| Boolean source               | Revert wrapper                    |
| ---------------------------- | --------------------------------- |
| `canAccess`                  | `checkControlList`                |
| `_isIdentified`              | `checkIdentity`                   |
| `_isCompliant`               | `checkCompliance`                 |
| `canTransferFromByPartition` | `checkCanTransferFromByPartition` |
| `canRedeemFromByPartition`   | `checkCanRedeemFromByPartition`   |
| `isRecovered`                | `requireUnrecoveredAddress`       |
| `verifyKycStatus`            | `requireValidKycStatus`           |

Most of these wrappers exist solely to translate a `bool` (or status tuple) into a revert. Consider a single shared helper — something like `LowLevelCall.revertWithData(selector, details)` is already used; the wrappers could be removed in favor of inline `if (!ok) revert(...)` patterns at the modifier sites. **However**: the wrapping is _consistent_, which has value. Only push this if you're already touching these files.

## Lower-confidence / structural ideas

### 9. `_data` and `_operatorData` parameters appear unused

In both `canTransferFromByPartition` and `canRedeemFromByPartition` the parameters are commented out (`bytes memory /*_data*/`) and every internal caller passes `EMPTY_BYTES`. They likely exist to match the ERC-1594/ERC-1410 public surface (the `Compliance` / `ComplianceByPartition` facets that expose these).

- **Check**: are the facet-level public functions actually invoked with non-empty bytes anywhere (clients, SDK)? If not — and if the ERC interface doesn't bind you — drop them from the internal library signatures and let only the public facet pass them through.
- This is the kind of thing an audit will flag as dead surface either way.

### 10. `_validateSenderCompliance` and `_validateTransferCompliance` are near-duplicates

Both build a `staticcall` to `ICompliance.canTransfer(...)` and decode the same way. The only difference is the args (`(sender, 0, 0)` vs `(from, to, value)`) and the error `details` payload.

- **Action**: collapse into one private helper `_callCanTransfer(address, address, uint256, bytes memory details)`; let callers pass the right args. Saves ~20 LOC and one branch.

### 11. `_isCompliant`'s loop over (sender, from, to) is open-coded

`_validateAccountForTransfer` is invoked three times with very similar setup. Consider a small loop or helper `_validateParticipants(address[] memory accounts)` for clarity — though the current shape isn't egregious. Cosmetic.

## A possible end-state

If items 1–6 are acted on, the final modifier set shrinks to roughly:

- `onlyCanTransferFromByPartition` — full transfer gate (unchanged)
- `onlyCanRedeemFromByPartition` — full redeem gate (unchanged)
- `onlyCompliant` _(if it survives the audit in #7)_
- `onlyUnrecoveredAddress` — kept as primitive, not used redundantly
- `onlyAddressNotZero` — kept as primitive
- `onlyListedAllowed` — kept as primitive
- `onlyIdentifiedAddresses` — kept as primitive
- `onlyValidKycStatus` — kept (distinct: takes a target status)

And the library methods to:

- `canTransferFromByPartition` / `checkCanTransferFromByPartition`
- `canRedeemFromByPartition` / `checkCanRedeemFromByPartition`
- `_isIdentified` (with `checkIdentity` either inlined or kept as the revert variant)
- `_isCompliant` (with `checkCompliance` either inlined or kept as the revert variant)
- `requireUnrecoveredAddress`
- `checkControlList` / `canAccess`
- `requireValidKycStatus` / `verifyKycStatus`

— with `checkValidAddress` deleted and dead double-guards removed at facet call sites.

## Verify before acting

1. Grep every facet for the modifier combos in #2–#4 — confirm the inner can\* really is present on each removal candidate.
2. Audit `onlyCompliant` usages (#7) — that's the only modifier whose value-add I can't fully justify from the library code alone.
3. Confirm `_data` / `_operatorData` aren't load-bearing for any SDK/client flow (#9).

---

# 🎯 Removable Modifier Instances (Audit Result for #2, #3, #4)

> Result of scanning every facet under `packages/ats/contracts/contracts/facets/` for functions that pair one of `onlyListedAllowed` / `onlyIdentifiedAddresses` / `onlyUnrecoveredAddress` with a covering modifier (`onlyCanTransferFromByPartition`, `onlyCanRedeemFromByPartition`, or `onlyCompliant`).
>
> A "covering modifier" must apply to the same address the secondary modifier checks. `onlyCompliant` does NOT cover identity (no KYC, no identity-registry verification), so it can never make `onlyIdentifiedAddresses` redundant.

## Truly redundant (safe to remove)

### `Transfer.transferFromWithData` — `packages/ats/contracts/contracts/facets/transfer/Transfer.sol:66`

Current modifier stack includes `onlyCanTransferFromByPartition(_from, _to, _DEFAULT_PARTITION, _value)`.

- **Remove `onlyUnrecoveredAddress(_from)`** — `_from` is always validated for recovery inside `_validateAccountForTransfer` (`_isCompliant`).
- **Remove `onlyUnrecoveredAddress(_to)`** — same reasoning for `_to`.
- ⚠️ **Keep `onlyUnrecoveredAddress(EvmAccessors.getMsgSender())`** — _not_ strictly redundant. The can* pipeline only validates the sender when `checkSender = (from != msg.sender) && !hasProtectedPartitionRole(sender, partition)` is true. Because this function is also guarded by `onlyUnProtectedPartitionsOrWildCardRole`, there is a path (sender holds the wildcard role and is acting on someone else's tokens) where the can* pipeline skips the sender check and this modifier is the _only_ place the sender's recovery state is verified. Removing it loosens that guarantee.

## No removable instances elsewhere

For every other function that uses one of the three secondary modifiers, **either**:

- (a) no covering modifier (`onlyCanTransferFromByPartition` / `onlyCanRedeemFromByPartition` / `onlyCompliant`) is present on the function, **or**
- (b) the secondary modifier is `onlyIdentifiedAddresses` paired with `onlyCompliant` — and `onlyCompliant` does not cover identity, so it is not subsumed.

### Functions in case (a) — no covering modifier, so secondary modifiers are load-bearing:

| File                                                               | Function                               | Secondary modifier(s) used (and address)                                                                                     |
| ------------------------------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `recovery/Recovery.sol:17`                                         | `recoveryAddress`                      | `onlyUnrecoveredAddress(_lostWallet)`                                                                                        |
| `clearingHoldByPartition/ClearingHoldByPartition.sol:25`           | `clearingCreateHoldByPartition`        | `onlyUnrecoveredAddress(msg.sender)`, `onlyUnrecoveredAddress(_hold.to)`                                                     |
| `lockByPartition/LockByPartition.sol:32`                           | `lockByPartition`                      | `onlyUnrecoveredAddress(_tokenHolder)`                                                                                       |
| `layer_1/lock/Lock.sol:34`                                         | `lock`                                 | `onlyUnrecoveredAddress(_tokenHolder)`                                                                                       |
| `maturityByPartition/MaturityByPartition.sol:27`                   | `redeemAtMaturityByPartition`          | `onlyUnrecoveredAddress(_tokenHolder)`, `onlyListedAllowed(_tokenHolder)`                                                    |
| `maturity/Maturity.sol:28`                                         | `fullRedeemAtMaturity`                 | `onlyUnrecoveredAddress(_tokenHolder)`, `onlyListedAllowed(_tokenHolder)`                                                    |
| `layer_1/ERC1400/ERC20Permit/ERC20Permit.sol:9`                    | `permit`                               | `onlyListedAllowed(owner)`, `onlyListedAllowed(spender)`, `onlyUnrecoveredAddress(owner)`, `onlyUnrecoveredAddress(spender)` |
| `holdByPartition/HoldByPartition.sol:23`                           | `createHoldByPartition`                | `onlyUnrecoveredAddress(msg.sender)`, `onlyUnrecoveredAddress(_hold.to)`                                                     |
| `clearingByPartition/ClearingByPartition.sol:24`                   | `approveClearingOperationByPartition`  | `onlyIdentifiedAddresses(_clearingOperationIdentifier.tokenHolder, address(0))`                                              |
| `clearingByPartition/ClearingByPartition.sol:79`                   | `reclaimClearingOperationByPartition`  | `onlyIdentifiedAddresses(_clearingOperationIdentifier.tokenHolder, address(0))`                                              |
| `clearingByPartition/ClearingByPartition.sol:103`                  | `clearingRedeemByPartition`            | `onlyUnrecoveredAddress(msg.sender)`                                                                                         |
| `clearingByPartition/ClearingByPartition.sol:128`                  | `clearingRedeemFromByPartition`        | `onlyUnrecoveredAddress(msg.sender)`, `onlyUnrecoveredAddress(_clearingOperationFrom.from)`                                  |
| `clearingByPartition/ClearingByPartition.sol:162`                  | `clearingTransferByPartition`          | `onlyUnrecoveredAddress(msg.sender)`, `onlyUnrecoveredAddress(_to)`                                                          |
| `clearingByPartition/ClearingByPartition.sol:191`                  | `clearingTransferFromByPartition`      | `onlyUnrecoveredAddress(msg.sender)`, `onlyUnrecoveredAddress(_to)`, `onlyUnrecoveredAddress(_clearingOperationFrom.from)`   |
| `protectedClearingByPartition/ProtectedClearingByPartition.sol:23` | `protectedClearingRedeemByPartition`   | `onlyUnrecoveredAddress(_protectedClearingOperation.from)`                                                                   |
| `protectedClearingByPartition/ProtectedClearingByPartition.sol:52` | `protectedClearingTransferByPartition` | `onlyUnrecoveredAddress(_protectedClearingOperation.from)`, `onlyUnrecoveredAddress(_to)`                                    |
| `operatorClearingByPartition/OperatorClearingByPartition.sol:18`   | `operatorClearingRedeemByPartition`    | `onlyUnrecoveredAddress(msg.sender)`, `onlyUnrecoveredAddress(_clearingOperationFrom.from)`                                  |
| `freeze/Freeze.sol:26`                                             | `setAddressFrozen`                     | `onlyUnrecoveredAddress(_userAddress)`                                                                                       |
| `freeze/Freeze.sol:42`                                             | `freezePartialTokens`                  | `onlyUnrecoveredAddress(_userAddress)`                                                                                       |
| `freeze/Freeze.sol:59`                                             | `unfreezePartialTokens`                | `onlyUnrecoveredAddress(_userAddress)`                                                                                       |
| `protectedHoldByPartition/ProtectedHoldByPartition.sol:23`         | `protectedCreateHoldByPartition`       | `onlyUnrecoveredAddress(_from)`, `onlyUnrecoveredAddress(_protectedHold.hold.to)`                                            |

### Functions in case (b) — `onlyIdentifiedAddresses` paired with `onlyCompliant` (identity is not subsumed):

| File                                             | Function                    | Identity modifier                                             |
| ------------------------------------------------ | --------------------------- | ------------------------------------------------------------- |
| `batchTransfer/BatchTransfer.sol:22`             | `batchTransfer`             | `onlyIdentifiedAddresses(msg.sender, address(0))`             |
| `mint/Mint.sol:29`                               | `issue`                     | `onlyIdentifiedAddresses(address(0), _tokenHolder)`           |
| `mint/Mint.sol:48`                               | `mint`                      | `onlyIdentifiedAddresses(address(0), _to)`                    |
| `mintByPartition/MintByPartition.sol:23`         | `issueByPartition`          | `onlyIdentifiedAddresses(address(0), _issueData.tokenHolder)` |
| `operator/Operator.sol:26`                       | `revokeOperator`            | `onlyIdentifiedAddresses(msg.sender, _operator)`              |
| `operatorByPartition/OperatorByPartition.sol:39` | `revokeOperatorByPartition` | `onlyIdentifiedAddresses(msg.sender, _operator)`              |
| `holdByPartition/HoldByPartition.sol:86`         | `executeHoldByPartition`    | `onlyIdentifiedAddresses(_holdIdentifier.tokenHolder, _to)`   |

> If the gap between `onlyCompliant` and the full transfer pipeline matters for these sites — i.e. they really do need identity but not balance/partition checks — leave them. If the analysis in #7 concludes `onlyCompliant` should be folded into the can\* pipeline, these sites would need rethinking together.

## Bottom line

Only **two** modifier instances are unambiguously safe to remove right now:

1. `Transfer.transferFromWithData` → `onlyUnrecoveredAddress(_from)`
2. `Transfer.transferFromWithData` → `onlyUnrecoveredAddress(_to)`

Everything else in the suggestions #2–#4 either (a) is the _only_ compliance guard on its function (no can\*/onlyCompliant present), or (b) covers a dimension (identity) that no companion modifier subsumes. The cleanup yield is much smaller than the original "drop the secondary modifiers" framing implied — most facets are not double-guarding.
