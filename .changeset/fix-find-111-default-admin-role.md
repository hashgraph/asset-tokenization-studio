---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-111: grant DEFAULT_ADMIN_ROLE to \_tRexOwner in SecurityDeploymentLib.\_prepareRbacs.

`_prepareRbacs` only added `address(this)` (the `TREXFactoryAts` factory) as a `DEFAULT_ADMIN_ROLE` member. After deployment, `TREXBaseDeploymentLib::deployTREXSuite` calls `renounceRole(DEFAULT_ADMIN_ROLE)` on behalf of the factory, removing the sole holder. If the token owner did not explicitly include themselves in `DEFAULT_ADMIN_ROLE` during the initial RBAC setup, all admin-gated functions on the deployed token were permanently locked with no recovery path.

The fix adds `_tRexOwner` alongside `address(this)` in the `DEFAULT_ADMIN_ROLE` members array appended by `_prepareRbacs`. The factory continues to hold the role temporarily during deployment and renounces it afterwards, while the token owner retains permanent admin access regardless of whether they passed an explicit RBAC configuration.
