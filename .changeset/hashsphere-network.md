---
"@hashgraph/asset-tokenization-sdk": minor
---

Recognize a HashSphere network, so a wallet connected to a private HashSphere deployment resolves its configured factory, resolver, mirror node and JSON-RPC relay instead of being reported as an unrecognized network.

HashSphere chain ids differ per instance, so the id is read from `HASHSPHERE_CHAIN_ID` (or `REACT_APP_HASHSPHERE_CHAIN_ID` for the web app) rather than built in. The network is registered only when that variable holds a positive integer that no public Hedera network already uses; with it unset, `HederaNetworks` is unchanged.
