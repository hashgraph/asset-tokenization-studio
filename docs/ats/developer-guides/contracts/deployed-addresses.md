---
id: deployed-addresses
title: Deployed Addresses
sidebar_label: Deployed addresses
---

# Deployed Addresses

Reference addresses for the ATS infrastructure contracts, taken from the deployment records in
[`packages/ats/contracts/deployments/`](https://github.com/hashgraph/asset-tokenization-studio/tree/main/packages/ats/contracts/deployments).

:::warning Verify before you rely on these
These are the **latest addresses recorded in this repository**, not a guaranteed-current registry.
A deployment record reflects the contract version deployed at that time, which may differ from the
current code. Always confirm against the newest file in `deployments/<network>/` (or your own
deployment output) before using an address in production.
:::

## Hedera Testnet

Source: `deployments/hedera-testnet/newBlr-2026-02-05T12-21-16.json` · Deployer:
`0x48ca774F6942166bF37e178CCC1E861947eAD8C7`

| Contract               | Contract ID | EVM Address                                  | HashScan                                                 |
| ---------------------- | ----------- | -------------------------------------------- | -------------------------------------------------------- |
| ProxyAdmin             | 0.0.7782752 | `0x5309a85c1fac0344c82B4a71640b18028b2D9Ba8` | [view](https://hashscan.io/testnet/contract/0.0.7782752) |
| BLR Proxy              | 0.0.7782757 | `0x4363684B8a679EaBA17701F421Ddf71D6870A011` | [view](https://hashscan.io/testnet/contract/0.0.7782757) |
| BLR Implementation     | 0.0.7782756 | `0x29fEedc415d79D28b144fD6b4A5FbED6df6D32F4` | [view](https://hashscan.io/testnet/contract/0.0.7782756) |
| Factory Proxy          | 0.0.7838301 | `0xCEdDa6D199AEB2391739E39d014177beb5157FA0` | [view](https://hashscan.io/testnet/contract/0.0.7838301) |
| Factory Implementation | 0.0.7838300 | `0xcF594145cC6f831864Eec9fF56904cB5753eaD12` | [view](https://hashscan.io/testnet/contract/0.0.7838300) |

The same file lists every facet address (with resolver keys) and the configuration versions created
in that deployment (Equity and the Bond variants). The **BLR Proxy** address is the one you pass to
the SDK and to the upgrade workflows (`BLR_ADDRESS`).

## Hedera Mainnet

No mainnet deployment is recorded in this repository. For an official mainnet deployment, consult
the project's release notes, or deploy with the current code following [Deployment](./deployment.md).

## Finding addresses for any deployment

The deployment output files are the source of truth. To read the newest one for a network:

```bash
cd packages/ats/contracts

# Infrastructure addresses from the newest testnet deployment
cat "$(ls -t deployments/hedera-testnet/newBlr-*.json | head -1)" | jq '.infrastructure'

# A specific facet
jq '.facets[] | select(.name == "CapFacet")' \
  "$(ls -t deployments/hedera-testnet/newBlr-*.json | head -1)"
```

On-chain, the BLR proxy answers `getBusinessLogicCount()`, `getLatestVersion(key)`, and
`resolveLatestBusinessLogic(key)` (see [Managing the BLR](./managing-the-blr.md)).

## Related pages

- [Deployment](./deployment.md) — produce a fresh deployment and its address record.
- [Architecture](./architecture.md) — what each of these contracts does.
- [SDK integration](../sdk-integration.md) — wiring these addresses into application code.
