# ERC3643StorageWrapper

_Asset Tokenization Studio Team_

> ERC3643StorageWrapper

Library that encapsulates storage management and core operations for an ERC3643-compliant token, including freeze/unfreeze, agent management, compliance, identity registry, and wallet recovery.

_All state mutations are performed via the diamond storage pattern, using a dedicated struct stored at a fixed EIP-1967 slot. This library is intended to be consumed by an upstream facet or orchestrator._
