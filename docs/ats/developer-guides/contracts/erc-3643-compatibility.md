---
id: erc-3643-compatibility
title: ERC-3643 Compatibility
sidebar_label: ERC-3643 compatibility
---

# ERC-3643 Compatibility

ATS provides **partial ERC-3643 (T-REX) compatibility** so that tooling built for the T-REX standard
can interoperate with ATS security tokens. This page lists the supported function surface.

:::note
ATS's primary standard is the **ERC-1400** family; ERC-3643 compatibility is layered on top via the
ERC-3643 facets. See [Overview → Standards](./overview.md#standards-implemented).
:::

## Supported functions

The following ERC-3643 functions are implemented:

### Views

| Function                                                                | Status |
| ----------------------------------------------------------------------- | ------ |
| `onchainID() external view returns (address)`                           | ✅     |
| `version() external view returns (string memory)`                       | ✅     |
| `identityRegistry() external view returns (IIdentityRegistry)`          | ✅     |
| `compliance() external view returns (ICompliance)`                      | ✅     |
| `paused() external view returns (bool)`                                 | ✅     |
| `isFrozen(address _userAddress) external view returns (bool)`           | ✅     |
| `getFrozenTokens(address _userAddress) external view returns (uint256)` | ✅     |

### Token & identity configuration

| Function                                         | Status |
| ------------------------------------------------ | ------ |
| `setName(string calldata _name)`                 | ✅     |
| `setSymbol(string calldata _symbol)`             | ✅     |
| `setOnchainID(address _onchainID)`               | ✅     |
| `setIdentityRegistry(address _identityRegistry)` | ✅     |
| `setCompliance(address _compliance)`             | ✅     |

### Operations

| Function                                                                                              | Status |
| ----------------------------------------------------------------------------------------------------- | ------ |
| `pause()` / `unpause()`                                                                               | ✅     |
| `setAddressFrozen(address _userAddress, bool _freeze)`                                                | ✅     |
| `freezePartialTokens(address _userAddress, uint256 _amount)`                                          | ✅     |
| `unfreezePartialTokens(address _userAddress, uint256 _amount)`                                        | ✅     |
| `forcedTransfer(address _from, address _to, uint256 _amount) returns (bool)`                          | ✅     |
| `mint(address _to, uint256 _amount)`                                                                  | ✅     |
| `burn(address _userAddress, uint256 _amount)`                                                         | ✅     |
| `recoveryAddress(address _lostWallet, address _newWallet, address _investorOnchainID) returns (bool)` | ✅     |

### Batch operations

| Function                                                                          | Status |
| --------------------------------------------------------------------------------- | ------ |
| `batchTransfer(address[] _toList, uint256[] _amounts)`                            | ✅     |
| `batchForcedTransfer(address[] _fromList, address[] _toList, uint256[] _amounts)` | ✅     |
| `batchMint(address[] _toList, uint256[] _amounts)`                                | ✅     |
| `batchBurn(address[] _userAddresses, uint256[] _amounts)`                         | ✅     |
| `batchSetAddressFrozen(address[] _userAddresses, bool[] _freeze)`                 | ✅     |
| `batchFreezePartialTokens(address[] _userAddresses, uint256[] _amounts)`          | ✅     |
| `batchUnfreezePartialTokens(address[] _userAddresses, uint256[] _amounts)`        | ✅     |

:::info Authoritative source
This matrix mirrors the compatibility table in the package
[`README.md`](https://github.com/hashgraph/asset-tokenization-studio/blob/main/packages/ats/contracts/README.md#erc-3643-compatibility).
If the two ever disagree, the README (and the ERC-3643 facet source) is authoritative.
:::

## Related pages

- [Overview](./overview.md) — the full set of standards ATS implements.
- [Architecture](./architecture.md) — how the ERC-3643 facets fit into the Diamond.
