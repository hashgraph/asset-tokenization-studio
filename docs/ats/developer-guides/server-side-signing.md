---
id: server-side-signing
title: Server-side signing with a private key
---
 

The ATS SDK signs through wallets (MetaMask, WalletConnect, DFNS, Fireblocks, AWS KMS). This guide covers the case with none of those: a server holding an ECDSA account key calls the bond contracts directly with the Hedera JS SDK, and uses `ethers` only for ABI encoding. Related: ATS issue #1397.

**Tested against the v8.0.0 testnet deployment** (factory `0.0.9213391`, resolver `0.0.9212226`, from `apps/ats/web/.env.example` at tag `v.8.0.0-ats`) with `@hashgraph/asset-tokenization-contracts@8.0.0`, `@hiero-ledger/sdk` 2.90 and `ethers` 6. Function signatures and the `deployBond` struct may differ in 9.0.0 and need updating.

## Setup

Use the ABIs from the contracts package that matches the deployment, not from `main`. The tested account keys were ECDSA, so the account's EVM address is the `msg.sender` that ATS role and allowlist checks see.

```ts
import { createRequire } from "node:module";
import { Client, AccountId, PrivateKey, ContractExecuteTransaction, ContractId } from "@hiero-ledger/sdk";
import { Interface, ZeroAddress, getBytes } from "ethers";

const abi = (p: string) => createRequire(import.meta.url)(`@hashgraph/asset-tokenization-contracts/artifacts/contracts/${p}`).abi;
const factory = new Interface(abi("factory/IFactory.sol/IFactory.json"));
const asset = new Interface(abi("facets/IAsset.sol/IAsset.json")); // every facet of a bond, behind one address

const client = Client.forTestnet().setOperator(AccountId.fromString("0.0.SIGNER"), PrivateKey.fromStringECDSA(process.env.KEY!));

async function send(contractId: string, iface: Interface, fn: string, args: unknown[], gas = 1_000_000) {
  const response = await new ContractExecuteTransaction()
    .setContractId(ContractId.fromString(contractId))
    .setGas(gas)
    .setFunctionParameters(getBytes(iface.encodeFunctionData(fn, args)))
    .execute(client);
  return response.getRecord(client); // throws on a failed receipt; the mirror node has the revert reason
}
```

Every call below is `send(BOND_ID, asset, signature, args)`. Pass the full signature when a name is overloaded, such as `"issue(address,uint256,bytes)"`.

UPPER_CASE names are placeholders.

## Deploy a bond

`IFactory.deployBond(bondData, regulationData)` takes nested structs. Look up each account's EVM address with `GET /api/v1/accounts/{id}` on the mirror node.

```ts
const record = await send("0.0.FACTORY", factory, "deployBond", [
  {
    security: {
      resolver: RESOLVER_EVM, maxSupply: 1000n,
      resolverProxyConfiguration: { key: "0x" + "0".repeat(63) + "2", version: 1 }, // the bond configuration
      erc20MetadataInfo: { name: "Bond", symbol: "BND", isin: "ZZ000TO2QUO9", decimals: 0 }, // 12 characters; the last must be a valid ISIN check digit
      rbacs: [{ role: ISSUER_ROLE, members: [ADMIN_EVM] }], // one entry per role; hashes are in contracts/constants/roles.sol
      externalPauses: [], externalControlLists: [], externalKycLists: [],
      compliance: ZeroAddress, identityRegistry: ZeroAddress,
      arePartitionsProtected: false, isMultiPartition: false, isControllable: true,
      isWhiteList: true, clearingActive: false, internalKycActivated: false, erc20VotesActivated: false,
    },
    bondDetails: { currency: "0x555344", nominalValue: 1000n, nominalValueDecimals: 0, startingDate: START, maturityDate: MATURITY },
    proceedRecipients: [], proceedRecipientsData: [],
  },
  { regulationType: 1, regulationSubType: 0, additionalSecurityData: { countriesControlListType: false, listOfCountries: "", info: "" } },
], 10_000_000);
const bondEvm = factory.decodeFunctionResult("deployBond", record.contractFunctionResult!.bytes)[0];
```

Then find the contract ID with `GET /api/v1/contracts/{bondEvm}`. `startingDate` and `maturityDate` are Unix seconds. The tested deploys used a starting date a minute ahead of the transaction. Give the signer every role it will use (`ISSUER`, `CONTROL_LIST`, `PAUSER`, `FREEZE_MANAGER`, `MATURITY_REDEEMER`) in `rbacs`. A missing role shows up later as a revert on the call that needs it.

## Operations

| Goal | Signature | Signer needs |
| --- | --- | --- |
| Allowlist an address | `addToControlList(address)` | `CONTROL_LIST` |
| Issue units | `issue(address,uint256,bytes)` with `"0x"` | `ISSUER`, and the recipient allowlisted |
| Transfer | `transfer(address,uint256)` | The sender's own key, and both sides allowlisted |
| Pause or unpause | `pause()` / `unpause()` | `PAUSER` |
| Freeze or unfreeze units | `freezePartialTokens(address,uint256)` / `unfreezePartialTokens(address,uint256)` | `FREEZE_MANAGER` |
| Burn a holder's units at maturity | `fullRedeemAtMaturity(address)` | `MATURITY_REDEEMER`, after the maturity date |

```ts
await send(BOND, asset, "addToControlList(address)", [holderEvm]);
await send(BOND, asset, "issue(address,uint256,bytes)", [holderEvm, 100n, "0x"]);
await send(BOND, asset, "fullRedeemAtMaturity(address)", [holderEvm]);
```

- **Transfers:** sign with the sender's key (a second `Client`). A transfer to an address that isn't allowlisted reverts with `AccountIsBlocked`.
- **Pause:** it blocks transfers for the whole bond, and ATS has no token-wide freeze.
- **Freeze:** frozen units leave `balanceOf`, so freezing more than the free balance reverts with `InsufficientBalance`.
- **`fullRedeemAtMaturity` only burns the holder's units.** It moves no payment token, so paying holders is a separate step (a token transfer, or a payout tool). Check the burn before you pay.

## Gas and fees

Set the gas limit explicitly: about 10,000,000 for `deployBond` and 1,000,000 for the calls above. Raise the transaction's max fee too, because the SDK default may not cover a deploy. A safe cap is `gasLimit × gas price`, with the price from `GET /api/v1/network/fees` (the `ContractCall` entry, in tinybar per gas), plus a margin. Testnet can return `INVALID_TRANSACTION_START` when a node's clock lags. Before retrying, check on the mirror node whether the earlier transaction ID succeeded; only send a new transaction if it didn't.

## Reading results and events

Simulate before you send: it is free and returns revert data.

```ts
const body = { block: "latest", from: ADMIN_EVM, to: bondEvm, gas: 1_000_000, estimate: false, data: asset.encodeFunctionData("balanceOf(address)", [holderEvm]) };
const res = await fetch("https://testnet.mirrornode.hedera.com/api/v1/contracts/call", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const { result } = await res.json(); // on a revert, _status.messages[0].data holds the error
asset.decodeFunctionResult("balanceOf(address)", result)[0];
asset.parseError(revertData)?.name; // e.g. "AccountIsBlocked"
```

- **Sent transactions:** `GET /api/v1/contracts/results/{transactionId}` returns `error_message` (feed it to `asset.parseError`) and `call_result`.
- **Events:** `GET /api/v1/contracts/{bondId}/results/logs?order=asc`. Decode with `asset.parseLog({ topics, data })`.
- **Timestamp filters:** a filter on logs spans at most 7 days, so for a longer bond page through the logs and filter in code.
- **Burns:** count `RedeemedByPartition`, not `Transfer(holder, 0x0)`. In v8 a freeze emits that same `Transfer`, so counting it reports frozen units as burned.
- **Lag:** the mirror node trails consensus by a few seconds, so poll a read until it shows the expected value.
