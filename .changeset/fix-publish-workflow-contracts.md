---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix CI/CD workflow bug where Contracts package was never published to npm due to duplicate SDK publish block. The second publish step now correctly publishes Contracts instead of publishing SDK twice.
