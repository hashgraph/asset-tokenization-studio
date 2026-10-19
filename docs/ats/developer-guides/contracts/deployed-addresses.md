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

Source: `deployments/hedera-testnet/newBlr-2026-06-12T11-19-42-198.json` (the latest recorded testnet
deployment, **v8.0.0**) · Deployer: `0x5d0D8CE855670888044794Bf42Af7A8b9F666506`

| Contract               | Contract ID | EVM Address                                  | HashScan                                                 |
| ---------------------- | ----------- | -------------------------------------------- | -------------------------------------------------------- |
| ProxyAdmin             | 0.0.9212218 | `0x92664E864200b8fA891195CeEC93880F5Bfa6f22` | [view](https://hashscan.io/testnet/contract/0.0.9212218) |
| BLR Proxy              | 0.0.9212226 | `0xBA2D5FC2083A0b8f164c50e65d782087fBA18E0a` | [view](https://hashscan.io/testnet/contract/0.0.9212226) |
| BLR Implementation     | 0.0.9212222 | `0x86ba690fA76625162501EC1e773056870E56a06D` | [view](https://hashscan.io/testnet/contract/0.0.9212222) |
| Factory Proxy          | 0.0.9213391 | `0xd1F118A40f3b02883D35909eF2517e7EDd78379d` | [view](https://hashscan.io/testnet/contract/0.0.9213391) |
| Factory Implementation | 0.0.9212655 | `0xe6E7cd61CAB14d26b80B8181B26F45D181BF7504` | [view](https://hashscan.io/testnet/contract/0.0.9212655) |

The same file lists every facet address (with resolver keys) and the configuration versions created
in that deployment (Equity, the three Bond variants, Deposit token, Loan, and Loans portfolio). The
**BLR Proxy** address is the one you pass to the SDK and to the upgrade workflows (`BLR_ADDRESS`).

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
