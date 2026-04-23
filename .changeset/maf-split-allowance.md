---
"@hashgraph/asset-tokenization-contracts": major
---

Refactor ERC20 allowance SC methods (`allowance`, `approve`, `increaseAllowance`, `decreaseAllowance`) into a new `AllowanceFacet`. The `Approval` event and the `InsufficientAllowance`, `SpenderWithZeroAddress`, `ZeroOwnerAddress` errors are relocated to `IAllowanceTypes`.
