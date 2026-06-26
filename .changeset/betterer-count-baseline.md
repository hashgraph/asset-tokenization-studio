---
"@hashgraph/asset-tokenization-contracts": patch
---

Record the solhint warning ratchet (`.betterer.results`) as per-file/per-rule counts instead of per-issue line and hash data, so the committed baseline changes only when a warning count changes and stops producing merge conflicts on unrelated edits. No functional, ABI or storage change.
