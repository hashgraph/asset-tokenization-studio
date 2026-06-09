---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate shared ERC-1410/ERC-3643 type files and external adapter interfaces out of `layer_1/` nesting as part of the POST-MAF layer-flattening effort.

What changes:

- `facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol` moved to `facets/commonTypes/`
- `facets/layer_1/ERC3643/IERC3643Types.sol` moved to `facets/commonTypes/`
- `facets/layer_1/ERC3643/ICompliance.sol` moved to `facets/compliance/externalInterfaces/`
- `facets/layer_1/ERC3643/IIdentityRegistry.sol` moved to `facets/identity/externalInterfaces/`
- Import paths updated in all callers: `ERC1410StorageWrapper.sol`, `ERC1594StorageWrapper.sol`,
  `ERC20StorageWrapper.sol`, `ERC3643StorageWrapper.sol`, `HoldStorageWrapper.sol`,
  `LockStorageWrapper.sol`, `AmortizationStorageWrapper.sol`, `LoansPortfolioStorageWrapper.sol`,
  `ClearingLifecycleOps.sol`, `ClearingOps.sol`, `TokenCoreOps.sol`, `IController.sol`,
  `Controller.sol`, `IControllerByPartition.sol`, `ControllerByPartition.sol`,
  `IMintByPartition.sol`, `MintByPartition.sol`, `IOperatorByPartition.sol`,
  `OperatorByPartition.sol`, `IRecovery.sol`, `ITransferByPartition.sol`,
  `TransferByPartition.sol`, `TransferAndLock.sol`, `TransferAndLockByPartition.sol`,
  `MockERC1410StorageWrapper.sol`

No ABI, selector, or storage layout changes.
