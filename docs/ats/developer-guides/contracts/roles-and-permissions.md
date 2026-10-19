---
id: roles-and-permissions
title: Roles & Permissions
sidebar_label: Roles & permissions
---

# Roles & Permissions

The contract-level role model: the `bytes32` roles defined in the contracts, what they authorise,
and the production safety rules around the most powerful ones.

:::note
This is the **contract-level** RBAC reference. For the operational, product-side view of who can do
what in the app, see the user guide [Roles & permissions](../../user-guides/roles-and-permissions.md).
:::

## How roles work

Access control is role-based. Each role is a `bytes32` constant named `ROLE_<UPPER_SNAKE>` — a
`keccak256` hash of `asset.tokenization.standard.role.<PascalName>`, generated from a
`/// @custom:hash role <PascalName>` annotation (see [Hash code generation](./hash-codegen.md)) — defined in
[`constants/roles.sol`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/contracts/constants/roles.sol).
The one exception is `DEFAULT_ADMIN_ROLE = 0x00`, which keeps its OpenZeppelin-compatible value.
Roles are seeded at deployment through the `Rbac[]` array the Factory accepts, and managed afterwards
with the standard `grantRole` / `revokeRole` / `renounceRole` functions:

```solidity
struct Rbac {
  bytes32 role;
  address[] members;
} // IResolverProxy.Rbac
```

## `DEFAULT_ADMIN_ROLE` — handle with care

`DEFAULT_ADMIN_ROLE` (`0x00`) sits at the top of the role tree and can grant or revoke every other
role. Critically, it **also** authorises high-impact, **instant** Diamond operations on the proxy —
`updateResolver`, `updateConfig`, and `updateConfigVersion` — which take effect in a **single
transaction with no on-chain timelock and no user exit window**.

:::danger Admin must be a multisig
Because those operations are instant and irreversible, `DEFAULT_ADMIN_ROLE` **must** be held by a
multisig or governance contract in production — never an externally-owned account (EOA). The
multisig's own approval workflow is what supplies the delay, review, and accountability that the
contracts deliberately do not impose on-chain.
:::

## Operational roles

Day-to-day actions are gated by purpose-specific roles. The main ones, grouped by responsibility:

| Area                      | Roles (`ROLE_*`)                                                                                                         | Authorises                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Issuance / supply**     | Agent, Issuer, Cap                                                                                                       | Mint, burn, forced transfers; issuance; supply-cap management.                                                  |
| **Compliance & identity** | Kyc, KycManager, InternalKycManager, SsiManager, ControlList, ControlListManager                                         | KYC status, allow/deny lists, self-sovereign identity configuration.                                            |
| **Asset protection**      | FreezeManager, Locker, Pauser, PauseManager, Deactivate                                                                  | Freeze/unfreeze, lock tokens, pause/unpause, deactivate the token.                                              |
| **Clearing**              | Clearing, ClearingValidator                                                                                              | Clearing and settlement operations and their validation.                                                        |
| **Corporate actions**     | CorporateAction, CorporateActionForceCancel, Snapshot, AdjustmentBalance, Amortization                                   | Dividends, voting, coupons, snapshots, balance adjustments (and the high-risk force-cancel).                    |
| **Bond economics**        | MaturityManager, MaturityRedeemer, InterestRateManager, KpiManager, NominalValue, ProceedRecipientManager                | Maturity, redemption, interest / KPI rates, nominal value, proceeds.                                            |
| **Loans**                 | LoanManager, LoansPortfolioManager                                                                                       | Loan and loans-portfolio operations.                                                                            |
| **Documents & control**   | Documenter, Controller, ProtectedPartitions (+ Participant), CustomDataManager, WildCard, CreateConfiguration, TrexOwner | Documents, controller transfers, protected partitions, custom data, configuration creation, ERC-3643 ownership. |

The exact constants (`ROLE_AGENT`, `ROLE_KYC_MANAGER`, …) and their generated hashes live in
`constants/roles.sol` and are surfaced in the generated `scripts/domain/atsRoles.generated.ts`.

## High-risk: corporate-action force-cancel

A subset of corporate-action operations have **force-cancel** variants that bypass the normal date
guards. These can leave a token in an inconsistent state and are **not** reversible. The role that
authorises them (`ROLE_CORPORATE_ACTION_FORCE_CANCEL`) must be granted **only to a multisig**, never an EOA. See
[Scheduled tasks & force-cancel](./scheduled-tasks-force-cancel.md) for the full risk model.

## Best practices

- ✅ Hold `DEFAULT_ADMIN_ROLE` (and any force-cancel role) in a multisig/governance contract.
- ✅ Grant the **minimum** roles each operator needs; prefer narrow operational roles over admin.
- ✅ Record role grants/revocations in your governance log.
- ❌ Never assign admin or force-cancel roles to an EOA in production or pre-production.

## Related pages

- [Core concepts → Roles](./core-concepts.md#roles)
- [Scheduled tasks & force-cancel](./scheduled-tasks-force-cancel.md)
- [User guide: Roles & permissions](../../user-guides/roles-and-permissions.md)
