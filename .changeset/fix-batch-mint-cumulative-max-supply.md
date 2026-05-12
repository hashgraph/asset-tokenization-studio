---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: `batchMint` now validates the cumulative total against `maxSupply` instead of each amount individually.

Previously, `requireWithinMaxSupply` was called once per recipient inside the validation loop. Because `_totalSupply` is not updated until the issuance pass, every individual check saw the same base supply and passed independently. An issuer could therefore submit a batch whose amounts were each below `maxSupply` but whose sum exceeded it, minting tokens beyond the cap.

The fix accumulates all amounts in the validation loop and performs a single `requireWithinMaxSupply(totalAmount, ...)` call after the loop completes, before any tokens are issued.
