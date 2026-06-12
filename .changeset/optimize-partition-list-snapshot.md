---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-005: make the per-holder partition-list snapshot O(1) per mutation to close a partition-spam denial-of-service. Previously `SnapshotsStorageWrapper` copied a holder's entire partition array on each capture (one cold SSTORE per element), so an attacker could inflate a victim's list with 1-wei sends under fresh partition ids until any snapshotting operation exceeded the block gas limit and bricked their transfers and redemptions. The snapshot is now stored per array index (mirroring the security-holders pattern): mutations capture at most the length plus the two slots affected by a swap-and-pop, and `partitionsOfAtSnapshot` reconstructs the list in a `view`. Historical reads are unchanged; new tests cover the delete paths.
