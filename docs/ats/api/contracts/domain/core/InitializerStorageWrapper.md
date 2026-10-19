# InitializerStorageWrapper

_Asset Tokenization Studio Team_

> InitializerStorageWrapper

Library providing the storage operations and readiness checks consumed by the initializer facet and by every facet that needs to assert &quot;operational&quot; status before executing business logic.

_Pins `InitializerDataStorage` to a fixed slot via the ERC-2535 diamond-storage pattern, preventing layout collisions across facets. All functions are `internal`; callers are expected to be facets compiled into the same proxy. Status semantics are documented on `InitializerDataStorage`. The batched `setOperationalStatus` flow persists resume progress so that bounded-gas calls can complete validation of large facet lists across multiple transactions._
