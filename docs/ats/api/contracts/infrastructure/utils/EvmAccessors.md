# EvmAccessors

_ATS Team_

> EvmAccessors

Library for EVM context accessors with test override support.

_Similar pattern to TimeTravelStorageWrapper but for msg.sender, tx.origin, and chainId. In production (non-Hardhat), the override slots are always 0 and native values are returned. Test facets can write to these slots during tests._
