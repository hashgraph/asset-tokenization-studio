# CustomDataStorageWrapper

_Asset Tokenization Studio Team_

> CustomDataStorageWrapper

Library providing diamond storage access and the read/write primitives used by the custom data facet to persist arbitrary key/value entries on a security token.

_Uses the ERC-2535 diamond storage pattern to isolate state under `STORAGE_LOCATION_CUSTOM_DATA`, preventing slot collisions with other facets. All entry points are `internal` so that callers (the `CustomData` facet) inline the logic rather than paying external-call overhead. Write semantics are full overwrite: each `setCustomData` call replaces the entire array stored under the key — there is no append or partial update._
