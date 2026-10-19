# AdjustBalancesStorageWrapper

_Asset Tokenization Studio Team_

> AdjustBalancesStorageWrapper

Storage accessor and balance-adjustment helper library for the ABAF / LABAF system.

_Centralises reads, writes and factor arithmetic for the asset-wide balance adjustment factor (`abaf`) and every per-holder, per-partition and per-position LABAF stored under the ERC-7201 namespace `security.token.standard.storage.AdjustBalances`. Mutators are consumed by sibling storage wrappers (locks, holds, freezes, clearings) and by facets that schedule balance adjustments; getters apply `zeroToOne` so callers never multiply by an uninitialised zero._
