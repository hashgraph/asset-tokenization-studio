# DocumentationStorageWrapper

_Hashgraph Asset Tokenization_

> DocumentationStorageWrapper

Library providing diamond storage access and all read/write operations for the documentation domain.

_Uses the ERC-2535 diamond storage pattern to isolate state under `STORAGE_LOCATION_DOCUMENTATION`. The raw storage getter is `private` so that all storage access from external contracts is channelled through the library&#39;s typed API, preventing uncontrolled direct slot manipulation. All public-facing functions are `internal` so they inline into callers without an external call overhead._
