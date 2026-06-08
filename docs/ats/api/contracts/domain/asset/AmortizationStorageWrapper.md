# AmortizationStorageWrapper

_Asset Tokenization Studio Team_

> AmortizationStorageWrapper

Library managing the full lifecycle of amortisation corporate actions: creation, hold placement and release, cancellation, and paginated holder queries.

_All state resides at `_AMORTIZATION_STORAGE_POSITION` via the diamond-storage pattern. Hold management writes directly to `HoldStorageWrapper` storage rather than going through the facet call surface, avoiding calldata-conversion overhead. Snapshot balances are used after the record date; live ERC1410 state is used before it._
