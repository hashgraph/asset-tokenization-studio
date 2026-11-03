# ERC20StorageWrapper

_Asset Tokenization Studio Team_

> ERC20StorageWrapper - ERC-20 Storage Wrapper

Storage wrapper for ERC-20 metadata, balance, and allowance data on a security token.

_Reads and writes the dedicated storage slot defined by `STORAGE_LOCATION_ERC20`. All functions are `internal` — the library is inlined at every call-site. External callers interact through the facet layer, never directly._
