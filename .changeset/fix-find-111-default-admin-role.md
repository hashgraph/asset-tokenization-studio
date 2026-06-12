---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-111: grant `DEFAULT_ADMIN_ROLE` to `_tRexOwner` in `SecurityDeploymentLib._prepareRbacs`. It previously added only `address(this)` (the `TREXFactoryAts`) as admin, and since `deployTREXSuite` makes the factory renounce `DEFAULT_ADMIN_ROLE` after deployment, a token owner who didn't explicitly include themselves was left with all admin-gated functions permanently locked and no recovery path. The fix adds `_tRexOwner` alongside `address(this)` in the admin members array, so the owner retains permanent admin access while the factory still renounces its temporary role.
