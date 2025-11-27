---
"@hashgraph/asset-tokenization-contracts": minor
---

feat: export missing utilities and enhance deployment tracking

Export missing infrastructure and domain utilities from scripts index:

- Export Hedera utilities (`fetchHederaContractId`, `getMirrorNodeUrl`, `isHederaNetwork`) for mirror node integration
- Export deployment file utilities (`loadDeployment`, `findLatestDeployment`, `listDeploymentFiles`) for deployment management
- Export verification utilities (`verifyContract`, `verifyContractCode`, `verifyContractInterface`) for post-deployment validation
- Export selector utility (`getSelector`) for function selector generation
- Export transparent proxy deployment operation (`deployTransparentProxy`)
- Export bond token deployment from factory (`deployBondFromFactory`)

Enhance deployment workflows with better tracking:

- Add optional `existingBlrImplementation` parameter to track BLR implementation address when using existing BLR
- Replace ambiguous `contractId` field with explicit `implementationContractId` and `proxyContractId` fields for proxied contracts (BLR, Factory)
- Improve deployment documentation and upgrade history tracking
- Better integration with Hedera tooling requiring explicit contract IDs

These changes improve the public API consistency and provide better deployment documentation for downstream consumers like GBP.
