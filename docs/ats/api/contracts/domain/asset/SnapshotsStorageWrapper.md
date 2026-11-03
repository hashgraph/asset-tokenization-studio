# SnapshotsStorageWrapper

_Asset Tokenization Studio Team_

> Snapshot storage and retrieval library

Provides internal functions to manage snapshot histories for balances, partitions, locked, held, frozen, and cleared state, as well as total supply and token holder data.

_All modifications to snapshot state should be performed via this library to ensure data consistency. The library relies on a single unstrucutred storage slot for the SnapshotStorage struct. Functions assume the current snapshot ID has been incremented before use. Reverts from ISnapshots are propagated on invalid snapshot IDs._
