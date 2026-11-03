# ERC20PermitStorageWrapper

_Asset Tokenization Studio Team_

> ERC20PermitStorageWrapper - ERC-20 Permit Storage Wrapper

Storage wrapper implementing EIP-2612 permit logic for gasless ERC-20 approvals on a security token.

_Validates EIP-712 signatures against the token&#39;s domain separator and delegates the resulting approval to `ERC20StorageWrapper.approve`. All functions are `internal` — the library is inlined at every call-site._
