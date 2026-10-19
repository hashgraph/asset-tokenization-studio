# ERC1410StorageWrapper

_Asset Tokenization Studio Team_

> ERC1410StorageWrapper

Internal library that mediates every read and write against the ERC-1410 partition storage.

_Centralises the partition lifecycle (issue, transfer, redeem), operator authorisation, snapshot hooks, balance-adjustment factor application and protected (signature-gated) variants. Higher facets and storage wrappers compose this library to keep partition accounting in lockstep with ERC-20 supply, ERC-3643 compliance callbacks and the snapshot/scheduled-tasks subsystems._
