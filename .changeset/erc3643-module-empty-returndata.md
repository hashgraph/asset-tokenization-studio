---
"@hashgraph/asset-tokenization-contracts": patch
---

Reject an ERC-3643 compliance or identity-registry module that answers a seam staticcall with
empty returndata. `ERC1594StorageWrapper` treated "no answer" as approval, so any address that
accepts a staticcall without reverting (an externally owned account, a contract with a silent
fallback, and on Hedera a system contract or a token's HIP-719 facade) silently disabled the seam
it was wired to while `canTransferByPartition` still reported success.
