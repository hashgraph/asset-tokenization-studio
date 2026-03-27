# IAsset Refactoring Context

## Goal

Refactor all integration test files in `layer_1` and `layer_2` to use a single `asset: IAsset` object instead of multiple per-facet typed objects.

## Step 1 (DONE)

Created `packages/ats/contracts/contracts/facets/IAsset.sol` — a unified Solidity interface inheriting from all facet interfaces. Typechain generates `IAsset` TypeScript type from it.

**Important exclusions from IAsset (irreconcilable conflicts):**

- `IKpiLinkedRate` — `getInterestRate()` returns a different `InterestRate` struct than `IFixedRate`
- `ISustainabilityPerformanceTargetRate` — same conflict

## Step 2 (IN PROGRESS)

Update test files to use `asset: IAsset` instead of per-facet variables.

### Transformation Pattern

```typescript
// BEFORE
import { type ResolverProxy, type SomeFacet, type OtherFacet } from "@contract-types";
let someFacet: SomeFacet;
let otherFacet: OtherFacet;
// in fixture:
someFacet = await ethers.getContractAt("SomeFacet", diamond.target);
otherFacet = await ethers.getContractAt("OtherFacet", diamond.target);
// usage:
await someFacet.someMethod();
await otherFacet.otherMethod();

// AFTER
import { type ResolverProxy, type IAsset } from "@contract-types";
let asset: IAsset;
// in fixture:
asset = await ethers.getContractAt("IAsset", diamond.target);
// usage:
await asset.someMethod();
await asset.otherMethod();
```

### Rules

1. Replace ALL facet variables that point to the diamond proxy with `asset: IAsset`
2. Use `asset.connect(signer)` instead of instantiating facets with a specific signer
3. Keep `DiamondFacet` / `DiamondCutFacet` — infrastructure, not in IAsset
4. Keep `MockedExternalPause`, `MockedT3RevocationRegistry`, `ComplianceMock`, etc. — mock contracts
5. Keep `MigrationFacetTest` — test-only contract
6. Keep `KpiLinkedRate` (IKpiLinkedRate) facet instances — excluded from IAsset
7. Keep `SustainabilityPerformanceTargetRate` (ISustainabilityPerformanceTargetRate) facet instances — excluded from IAsset
8. ABI-merging patterns (using `new ethers.Contract(address, combinedAbi)`) can be replaced with `asset`
9. `revertedWithCustomError(oldFacet, ...)` → `revertedWithCustomError(asset, ...)`
10. `.emit(oldFacet, ...)` → `.emit(asset, ...)`
11. `executeRbac(base.accessControlFacet, ...)` → `executeRbac(asset, ...)`
12. `grantRoleAndPauseToken(facet1, facet2, ...)` → `grantRoleAndPauseToken(asset, asset, ...)`

### Helper files already updated

- `test/fixtures/hardhatHelpers.ts` — `grantRoleAndPauseToken` params changed to `IAsset`
- `test/fixtures/tokens/common.fixture.ts` — `executeRbac` param changed to `IAsset`

## File Status

### DONE (26 files)

- [x] layer_1/accessControl/accessControl.test.ts
- [x] layer_1/bond/bond.test.ts
- [x] layer_1/bond/fixedRate/bondFixedRate.test.ts
- [x] layer_1/cap/cap.test.ts
- [x] layer_1/controlList/controlList.test.ts
- [x] layer_1/corporateActions/corporateActions.test.ts
- [x] layer_1/ERC1400/ERC1643/erc1643.test.ts
- [x] layer_1/ERC1400/ERC1644/erc1644.test.ts
- [x] layer_1/ERC1400/ERC20/erc20.test.ts
- [x] layer_1/ERC1400/ERC20Permit/erc20Permit.test.ts
- [x] layer_1/ERC1400/ERC20Votes/erc20Votes.test.ts
- [x] layer_1/ERC1400/ERC1594/erc1594.test.ts
- [x] layer_1/externalControlLists/externalControlList.test.ts
- [x] layer_1/externalKycLists/externalKycList.test.ts
- [x] layer_1/externalPauses/externalPause.test.ts
- [x] layer_1/interestRates/fixedRate/fixedRate.test.ts
- [x] layer_1/interestRates/kpiLinkedRate/kpiLinkedRate.test.ts (pauseFacet replaced; kpiLinkedRateFacet kept — excluded from IAsset)
- [x] layer_1/interestRates/sustainabilityPerformanceTargetRate/sustainabilityPerformanceTargetRate.test.ts (pauseFacet+proceedRecipientsFacet replaced; sustainabilityPerformanceTargetRateFacet kept — excluded)
- [x] layer_1/kpi/kpiLatest/kpiLatest.test.ts
- [x] layer_1/lock/lock.test.ts
- [x] layer_1/nonces/nonces.test.ts
- [x] layer_1/pause/pause.test.ts
- [x] layer_1/proceedRecipients/proceedRecipients.test.ts
- [x] layer_1/security/security.test.ts
- [x] layer_1/securityUSA/securityUSA.test.ts
- [x] layer_1/ssi/ssi.test.ts

### SKIPPED (1 file — empty)

- [x] layer_1/kyc/kyc.test.ts — file is empty, no changes needed

### IN PROGRESS (by background agents, session 3)

- [ ] layer_1/ERC1400/ERC1410/erc1410.test.ts (agent ab36949c7f65f85a3)
- [ ] layer_1/ERC3643/erc3643.test.ts (agent a48dd7db515c73805)
- [ ] layer_1/hold/hold.test.ts (agent a90110c65968792a6)
- [ ] layer_1/clearing/clearing.test.ts (agent a2cfdc98fbf43e383)
- [ ] layer_1/adjustBalances/adjustBalances.test.ts (agent a93959b58fa24cfdd)
- [ ] layer_1/snapshots/snapshots.test.ts (agent a93959b58fa24cfdd)
- [ ] layer_1/totalBalance/totalBalance.test.ts (agent a93959b58fa24cfdd)
- [ ] layer_1/coupon/coupon.test.ts (agent a1731470f6463ecd1)
- [ ] layer_1/equity/equity.test.ts (agent a1731470f6463ecd1)
- [ ] layer_1/bond/kpiLinkedRate/bondKpiLinkedRate.test.ts (agent a1731470f6463ecd1)
- [ ] layer_1/bond/sustainabilityPerformanceTargetRate/bondSustainabilityPerformanceTargetRate.test.ts (agent a1731470f6463ecd1)
- [ ] layer_1/scheduledTasks/scheduledBalanceAdjustments/scheduledBalanceAdjustments.test.ts (agent a7449380bca5b7518)
- [ ] layer_1/scheduledTasks/scheduledCouponListing/scheduledCouponListing.test.ts (agent a7449380bca5b7518)
- [ ] layer_1/scheduledTasks/scheduledSnapshots/scheduledSnapshots.test.ts (agent a7449380bca5b7518)
- [ ] layer_1/scheduledTasks/scheduledTasks/scheduledTasks.test.ts (agent a7449380bca5b7518)
- [ ] layer_1/proceedRecipients/fixingDateInterestRate/proceedRecipients.test.ts (agent a7449380bca5b7518)
- [ ] layer_1/transferAndLock/transferAndLock.test.ts (agent af01493b6fb44be9e)
- [ ] layer_1/protectedPartitions/protectedPartitions.test.ts (agent af01493b6fb44be9e)
- [ ] layer_2/nominalValue/nominalValueMigration.test.ts (agent af01493b6fb44be9e)
