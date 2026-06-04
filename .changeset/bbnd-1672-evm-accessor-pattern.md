---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/asset-tokenization-sdk": major
"@hashgraph/asset-tokenization-dapp": major
---

refactor(contracts): replace the runtime TimeTravel storage-wrapper time-control with a compile-time, manifest-driven EvmAccessors library (BBND-1672).

- Production reads of block.timestamp, block.number, block.chainid, msg.sender and tx.origin inline the native opcode with no override machinery; test builds back them with a dedicated ERC-7201 override store driven by a test-only EvmAccessorsFacet.
- Breaking for deployment-script consumers: the useTimeTravel parameter is removed from all create\*Configuration functions and from the deploy workflows and CLI.
