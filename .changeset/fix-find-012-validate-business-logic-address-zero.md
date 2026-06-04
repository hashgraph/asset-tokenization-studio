---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-012: reject zero address in `BusinessLogicResolverWrapper._checkValidKeys`.

Added an explicit `address(0)` check inside `_checkValidKeys` alongside the existing zero-key guard. Without it, passing `address(0)` as a business logic address was only caught implicitly later in `_registerBusinessLogics`, when the external call to `IStaticFunctionSelectors(address(0)).getStaticResolverKey()` caused an ABI-decode revert after potentially paying for earlier `SSTORE`s in the same batch.

The new check reverts eagerly with `ZeroAddressNotValidForBusinessLogic` before any state mutation, keeping the validation `pure`, gas-efficient on the failure path, and consistent with the existing zero-key guard pattern.
