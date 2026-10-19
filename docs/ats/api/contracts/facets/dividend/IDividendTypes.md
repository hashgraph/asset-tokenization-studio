# IDividendTypes

_Asset Tokenization Studio Team_

> IDividendTypes

Shared type module for the dividend domain — every facet, library, and storage wrapper that handles dividends references its structs through this interface.

_Pure types tier: structs only. Domain events and errors live on the writer interface (`IDividend`) where they are emitted/reverted; placing them here would force read-only facets that inherit `IDividendTypes` to pick up symbols they never use, bloating their EIP-165 interfaceId. Inherited by `IDividend` (writer) and by any read facet that needs to expose a dividend struct in its function signatures._
