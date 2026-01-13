<div align="center">

# Asset Tokenization Studio - SDK

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](../LICENSE)

</div>

### Table of Contents

- **[Description](#description)**<br>
- **[Installation](#installation)**<br>
- **[Build](#build)**<br>
- **[Test](#test)**<br>
- **[Input ports](#input-ports)**<br>
  - **[Network](#network)**<br>
  - **[Bond](#bond)**<br>
  - **[Equity](#equity)**<br>
  - **[Security](#security)**<br>
  - **[Role](#role)**<br>
  - **[Factory](#factory)**<br>
  - **[Event](#event)**<br>
- **[Use Cases](#use-cases)**<br>
  - **[Initialise the SDK](#initialise-the-sdk)**<br>
  - **[Connect an account to the SDK](#connect-an-account-to-the-sdk)**<br>
  - **[Deploy a new Bond](#deploy-a-new-bond)**<br>
  - **[Deploy a new Equity](#deploy-a-new-equity)**<br>
  - **[Retrieve Regulation Details from Factory](#retrieve-regulation-details-from-factory)**<br>
  - **[Manage an Asset](#manage-an-asset)**<br>

# Description

The SDK enables web applications (or any other client-facing application) to interact with the smart contracts deployed on Hedera. This package is part of the Asset Tokenization Studio monorepo.

## Workspace Context

This SDK is located at `packages/ats/sdk` within the monorepo and depends on the contracts package (`packages/ats/contracts`). The build process automatically handles these dependencies when using workspace commands.

# Installation

From the monorepo root:

```bash
npm ci                    # Install all workspace dependencies
npm run ats:sdk:build     # Build the SDK
```

For local development of the SDK only:

```bash
cd packages/ats/sdk
npm run build
```

# Build

Build the SDK using workspace commands from the root:

```bash
npm run ats:sdk:build
```

Or build all ATS components:

```bash
npm run ats:build
```

# Test

The SDK tests are located in the _**tests**_ folder at the root of the sdk module.

Before running the tests you will need to create an ".env" file following the ".env.sample" template.

Run SDK tests:

```bash
# From root
npm run ats:sdk:test

# Or locally
cd packages/ats/sdk
npm test
```

# Input Ports

## Network

### init

Initialises the SDK.

- Request
  - network : ‘testnet’, ‘mainnet’, …
  - mirrorNode: name and url of the mirror node the SDK will connect too.
  - rpcNode: name and url of the rpc node the SDK will connect too.
  - events: callbacks to the wallet events (walletInit, walletFound, …)
  - configuration: factory contract Hedera Id, resolver contract Hedera Id, common, equity and bond business logic keys the SDK will connect to. This data must be aligned with the selected “network”.
  - factories: list of factories and their respective environments in case the wallet allows for the network to be switched.
  - resolvers: list of resolvers and their respective environments in case the wallet allows for the network to be switched.

- Response
  - SupportedWallets: List of supported wallets.

### connect

Connects an account to the SDK.

- Request
  - account : connected account
  - network : ‘testnet’, ‘mainnet’, …
  - mirrorNode: name and url of the mirror node the SDK will connect too.
  - rpcNode: name and url of the rpc node the SDK will connect too.

- Response
  - InitializationData:
    - account: Account; Details of the connected account
    - pairing: string; Wallet pairing string
    - topic: string; Wallet’s connection topic

### disconnect

Disconnects an account from the SDK.

- Request

- Response : True (success), false (failed)

### setNetwork

Sets a new network into the SDK.

- Request
  - environment : network that we are connecting too
  - mirrorNode: name and url of the mirror node the SDK will connect too.
  - rpcNode: name and url of the rpc node the SDK will connect too.
  - consensusNodes : (optional) list of consensus node

- Response
  - NetworkResponse:
    - environment: network that we are connecting too
    - mirrorNode: name and url of the mirror node the SDK will connect too.
    - rpcNode: name and url of the rpc node the SDK will connect too.
    - consensusNodes : (optional) list of consensus node

### setConfig

Sets a new configuration into the SDK.

- Request
  - factoryAddress: new factory address.
  - resolverAddress: new resolver address.

- Response
  - ConfigResponse:
    - factoryAddress: new factory address.
    - resolverAddress: new resolver address.

## Bond

### create

- Request
  - diamondOwnerAccount: Hedera id of the account deploying the security
  - Currency: hexadecimal of the currency's 3 letter ISO code
  - numberOfUnits: maximum supply
  - nominalValue: only for information, represents the value of a single bond.
  - nominalValueDecimals: only for information, represents the decimals of the nominal Value.
  - startingDate: Bond's starting date in seconds
  - maturityDate: Bond's maturity date in seconds
  - regulationType:
    - 0 : no regulation
    - 1 : Reg S
    - 2 : Reg D
  - regulationSubType:
    - 0 : no sub regulation
    - 1 : 506 B
    - 2 : 506 C
  - isCountryControlListWhiteList :
    - True: list of "countries" are the not banned, all other countries are banned
    - False: list of "countries" are banned, all other countries are not banned.
  - countries: comma separated list of banned/not banned countries in 2-letters ISO format.
  - enableERC3643 (optional): boolean to enable ERC3643 compliance features
  - complianceModules (optional): array of compliance module addresses (requires enableERC3643)
  - identityRegistry (optional): identity registry contract address (requires enableERC3643)

- Response
  - SecurityViewModel:
    The returned information is identical to the provided one, except for this fields - type: string; “BOND” or “EQUITY” - totalSupply: string; Corresponds to the total supply, which is 0 right after the initial deployment. - maxSupply: string; Corresponds to the “numberOfUnits” - diamondAddress: string; Hedera id of the deployed smart contract representing the Asset - evmDiamondAddress: string; EVM address of the deployed smart contract representing the Asset - paused: boolean; True (the Asset is paused), False (the asset is not paused) - Regulation: RegulationViewModel; Details of the selected regulation during deployment (type, subType, dealSize, …)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### setCoupon

Creates a new coupon for the bond.

- Request
  - securityId: Hedera id of the diamond contract representing the asset.
  - rate: coupon percentage rate.
  - recordTimestamp: date (in seconds) at which token holders balances will be snapshotted.
  - executionTimestamp : date (in seconds) at which the coupon should be paid.

- Response
  - Payload: coupon Id
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

## Equity

### create

- Request
  - diamondOwnerAccount: Hedera id of the account deploying the security
  - votingRight: the equity grants voting rights to its holders.
  - informationRight: the equity grants information rights to its holders.
  - liquidationRight: the equity grants liquidation rights to its holders
  - subscriptionright: the equity grants subscription rights to its holders
  - conversionRight: the equity grants conversion rights to its holders
  - redemptionRight: the equity grants redemption rights to its holders
  - putRight: the equity grants put rights to its holders
  - dividendRight: the equity grants dividend rights to its holders
  - Currency: hexadecimal of the currency's 3 letter ISO code
  - numberOfShares: maximum supply
  - nominalValue: only for information, represents the value of a single equity.
  - nominalValueDecimals: only for information, represents the decimals of the nominal Value.
  - regulationType:
    - 0 : no regulation
    - 1 : Reg S
    - 2 : Reg D
  - regulationSubType:
    - 0 : no sub regulation
    - 1 : 506 B
    - 2 : 506 C
  - isCountryControlListWhiteList :
    - True: list of "countries" are the not banned, all other countries are banned
    - False: list of "countries" are banned, all other countries are not banned.
  - countries: comma separated list of banned/not banned countries in 2-letters ISO format.
  - enableERC3643 (optional): boolean to enable ERC3643 compliance features
  - complianceModules (optional): array of compliance module addresses (requires enableERC3643)
  - identityRegistry (optional): identity registry contract address (requires enableERC3643)

- Response
  - SecurityViewModel:
    The returned information is identical to the provided one, except for this fields - type: string; “BOND” or “EQUITY” - totalSupply: string; Corresponds to the total supply, which is 0 right after the initial deployment. - maxSupply: string; Corresponds to the “numberOfShares” - diamondAddress: string; Hedera id of the deployed smart contract representing the Asset - evmDiamondAddress: string; EVM address of the deployed smart contract representing the Asset - paused: boolean; True (the Asset is paused), False (the asset is not paused) - Regulation: RegulationViewModel; Details of the selected regulation during deployment (type, subType, dealSize, …)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### setDividends

Creates a new dividend for the equity.

- Request
  - securityId: Hedera id of the diamond contract representing the asset.
  - amountPerUnitOfSecurity: dividend amount per security.
  - recordTimestamp: date (in seconds) at which token holders balances will be snapshotted.
  - executionTimestamp : date (in seconds) at which the dividend should be paid.

- Response
  - Payload: dividend Id
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### setVotingRights

Creates a new voting right for the equity.

- Request
  - securityId: Hedera id of the diamond contract representing the asset.
  - recordTimestamp: date (in seconds) at which token holders balances will be snapshotted.
  - data : metadata associated to the voting rights.

- Response
  - Payload: voting right Id
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

## Security

### issue

Mints new assets to a given account

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: accounts hedera id
  - amount: amount to be minted with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### mint

Mints new tokens to a specified account. Requires the Agent role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: account's Hedera id
  - amount: amount to be minted with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

### burn

Burns tokens from a specified account. Requires the Agent role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: account's Hedera id (optional, defaults to sender)
  - amount: amount to be burned with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

### forcedTransfer

Forces a transfer between accounts, bypassing normal transfer restrictions. Requires the Agent role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - sourceId: source account's Hedera id
  - targetId: destination account's Hedera id
  - amount: amount to be transferred with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

### freezePartialTokens

Freezes a partial amount of tokens for a target account (ERC3643 freeze). Requires the Freeze Manager role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: account's Hedera id
  - amount: amount to be frozen with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

### unfreezePartialTokens

Unfreezes a partial amount of tokens for a target account. Requires the Freeze Manager role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: account's Hedera id
  - amount: amount to be unfrozen with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

### setAddressFrozen

Freezes or unfreezes an entire address. Requires the Freeze Manager role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: account's Hedera id
  - frozen: boolean (true to freeze, false to unfreeze)

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

### getFrozenPartialTokens

Returns the frozen token amount for a target account.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: account's Hedera id

- Response
  - Payload: BalanceViewModel

### Batch Operations

#### batchTransfer

Performs multiple transfers in a single transaction. Requires appropriate permissions.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - sourceIds: array of source account Hedera ids
  - targetIds: array of destination account Hedera ids
  - amounts: array of amounts to be transferred with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### batchMint

Mints tokens to multiple accounts in a single transaction. Requires the Agent role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetIds: array of account Hedera ids
  - amounts: array of amounts to be minted with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### batchBurn

Burns tokens from multiple accounts in a single transaction. Requires the Agent role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetIds: array of account Hedera ids
  - amounts: array of amounts to be burned with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### batchForcedTransfer

Forces multiple transfers in a single transaction. Requires the Agent role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - sourceIds: array of source account Hedera ids
  - targetIds: array of destination account Hedera ids
  - amounts: array of amounts to be transferred with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### batchFreezePartialTokens

Freezes partial amounts for multiple accounts. Requires the Freeze Manager role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetIds: array of account Hedera ids
  - amounts: array of amounts to be frozen with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### batchUnfreezePartialTokens

Unfreezes partial amounts for multiple accounts. Requires the Freeze Manager role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetIds: array of account Hedera ids
  - amounts: array of amounts to be unfrozen with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### batchSetAddressFrozen

Freezes or unfreezes multiple addresses. Requires the Freeze Manager role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetIds: array of account Hedera ids
  - frozen: array of booleans (true to freeze, false to unfreeze)

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

### ERC3643 Compliance Features

#### setCompliance

Sets the compliance module for a security. Requires the T-REX Owner role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - complianceAddress: address of the compliance module contract

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### compliance

Returns the configured compliance module address (if any) for a security.

- Request
  - securityId: Hedera id of the diamond contract representing the asset

- Response
  - Payload: string (compliance module address)

#### setIdentityRegistry

Sets the identity registry for a security. Requires the T-REX Owner role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - identityRegistryAddress: address of the identity registry contract

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### identityRegistry

Returns the configured identity registry address (if any) for a security.

- Request
  - securityId: Hedera id of the diamond contract representing the asset

- Response
  - Payload: string (identity registry address)

### Agent Management

#### addAgent

Adds an agent to the security token. Requires the T-REX Owner role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - agentAddress: address of the agent to add

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### removeAgent

Removes an agent from the security token. Requires the T-REX Owner role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - agentAddress: address of the agent to remove

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

### Token Metadata Management

#### setName

Updates the token name. Requires the T-REX Owner role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - name: new token name

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### setSymbol

Updates the token symbol. Requires the T-REX Owner role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - symbol: new token symbol

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### setOnchainID

Sets the on-chain identity for the token. Requires the T-REX Owner role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - onchainId: on-chain identity address

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

### Recovery Operations

#### recoveryAddress

Recovers tokens from a lost address to a recovery address. Requires the Agent role.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - lostAddress: address that lost access
  - recoveryAddress: address to receive the recovered tokens
  - investorOnchainId: on-chain identity of the investor

- Response
  - Payload: True (success), false (failed)
  - TransactionId: Id of the Hedera transaction

#### isAddressRecovered

Checks if an address has been recovered.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - address: address to check

- Response
  - Payload: boolean (true if recovered, false otherwise)

### redeem

Redeems assets

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - amount: amount to be redeemed with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### controllerRedeem

Redeems assets from a given account

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - sourceId: accounts hedera id
  - amount: amount to be redeemed with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### controllerTransfer

Transfer assets from a given account

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - sourceId: source accounts hedera id
  - targetId: destination accounts hedera id
  - amount: amount to be transfered with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### pause

Pauses the Security (can only be executed if the security is not paused)

- Request
  - securityId: Hedera id of the diamond contract representing the asset

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### unpause

Unpauses the Security (can only be executed if the security is paused)

- Request
  - securityId: Hedera id of the diamond contract representing the asset

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### addToControlList

Adds an account to the control list (either blacklist or whitelist depending on how the asset was configured during deployment)

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: accounts hedera id

- Response
  - Payload:True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### removeFromControlList

Removes an account from the control list (either blacklist or whitelist depending on how the asset was configured during deployment)

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: accounts hedera id
- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### transfer

Transfer fund to an account

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: accounts hedera id
  - amount: amount to be transferred with decimals included

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### transferAndLock

Transfer fund to an account and locks them for a given amount of time

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: accounts hedera id
  - amount: amount to be transferred with decimals included
  - expirationDate: date in seconds at which the funds can be released (lock expiration date)

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### setMaxSupply

Updates the max supply. Setting max supply to "0" means removing it (unllimited max supply).

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - maxSupply: new max supply

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### lock

Locks funds into an account for a certain period of time

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: accounts hedera id where funds will be locked
  - amount: amount to be locked with decimals included
  - expirationDate: date in seconds at which the funds can be released (lock expiration date)

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### release

Releases locked funds from an account

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: accounts hedera id where funds will be released
  - lockId: Id of the lock to be released

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### Hold

#### Create Hold by Partition

Creates a new hold for a specific partition by the token holder.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `escrow`: Address of the escrow account.
  - `amount`: Amount to be held.
  - `targetId`: Identifier of the target account.
  - `expirationDate`: Date when the hold expires.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Controller Create Hold by Partition

Similar to "Create Hold From by Partition", but can only be executed by accounts with the "Controller Role". Control list restrictions do not apply.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `escrow`: Address of the escrow account.
  - `amount`: Amount to be held.
  - `sourceId`: Identifier of the source account.
  - `targetId`: Identifier of the target account.
  - `expirationDate`: Date when the hold expires.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Create Hold From by Partition

Similar to "Create Hold by Partition", but can only be executed by an authorized ERC20 account on behalf of the token holder.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `escrow`: Address of the escrow account.
  - `amount`: Amount to be held.
  - `sourceId`: Identifier of the source account.
  - `targetId`: Identifier of the target account.
  - `expirationDate`: Date when the hold expires.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Protected Create Hold by Partition

Similar to "Create Hold by Partition", but can only be executed when partitions are protected. Only one of these two methods can be used depending on the partition protection status. Additional fields are required.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `escrow`: Address of the escrow account.
  - `amount`: Amount to be held.
  - `sourceId`: Identifier of the source account.
  - `targetId`: Identifier of the target account.
  - `expirationDate`: Date when the hold expires.
  - `deadline`: Deadline for the hold execution.
  - `nonce`: Unique identifier for the request.
  - `signature`: Digital signature verifying the request.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Reclaim Hold by Partition

Can be executed by anyone, but only after the expiration date. Transfers all remaining hold assets back to the original account.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `holdId`: Identifier of the hold.
  - `targetId`: Identifier of the target account.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Release Hold by Partition

Can only be executed by the escrow account. Transfers all or part of the held assets back to the original account.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `holdId`: Identifier of the hold.
  - `targetId`: Identifier of the target account.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

### Clearing

#### Clearing Create Hold by Partition

Creates a new clearing hold for a specific partition by the token holder.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `escrow`: Address of the escrow account.
  - `amount`: Amount to be held.
  - `targetId`: Identifier of the target account.
  - `clearingExpirationDate`: Date when the clearing expires.
  - `holdExpirationDate`: Date when the hold expires.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Clearing Create Hold From by Partition

Similar to "Clearing Create Hold by Partition", but can only be executed by an authorized ERC20 account on behalf of the token holder.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `escrow`: Address of the escrow account.
  - `amount`: Amount to be held.
  - `sourceId`: Identifier of the source account.
  - `targetId`: Identifier of the target account.
  - `clearingExpirationDate`: Date when the clearing expires.
  - `holdExpirationDate`: Date when the hold expires.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Protected Create Hold by Partition

Similar to "Clearing Create Hold by Partition", but can only be executed when partitions are protected. Only one of these two methods can be used depending on the partition protection status. Additional fields are required.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `escrow`: Address of the escrow account.
  - `amount`: Amount to be held.
  - `sourceId`: Identifier of the source account.
  - `targetId`: Identifier of the target account.
  - `clearingExpirationDate`: Date when the clearing expires.
  - `holdExpirationDate`: Date when the hold expires.
  - `deadline`: Deadline for the hold execution.
  - `nonce`: Unique identifier for the request.
  - `signature`: Digital signature verifying the request.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Clearing Transfer by Partition

Creates a new clearing transfer for a specific partition by the token holder.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `amount`: Amount to be held.
  - `targetId`: Identifier of the target account.
  - `expirationDate`: Date when the clearing expires.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Clearing Transfer From by Partition

Similar to "Clearing Transfer by Partition", but can only be executed by an authorized ERC20 account on behalf of the token holder.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `amount`: Amount to be held.
  - `sourceId`: Identifier of the source account.
  - `targetId`: Identifier of the target account.
  - `expirationDate`: Date when the clearing expires.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Protected Clearing Transfer by Partition

Similar to "Clearing Transfer by Partition", but can only be executed when partitions are protected. Only one of these two methods can be used depending on the partition protection status. Additional fields are required.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `amount`: Amount to be held.
  - `sourceId`: Identifier of the source account.
  - `targetId`: Identifier of the target account.
  - `expirationDate`: Date when the clearing expires.
  - `deadline`: Deadline for the hold execution.
  - `nonce`: Unique identifier for the request.
  - `signature`: Digital signature verifying the request.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Clearing Redeem by Partition

Creates a new clearing redeem for a specific partition by the token holder.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `amount`: Amount to be held.
  - `expirationDate`: Date when the clearing expires.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Clearing Redeem From by Partition

Similar to "Clearing Redeem by Partition", but can only be executed by an authorized ERC20 account on behalf of the token holder.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `sourceId`: Identifier of the source account.
  - `amount`: Amount to be held.
  - `expirationDate`: Date when the clearing expires.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Protected Clearing Redeem by Partition

Similar to "Clearing Redeem by Partition", but can only be executed when partitions are protected. Only one of these two methods can be used depending on the partition protection status. Additional fields are required.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `amount`: Amount to be held.
  - `sourceId`: Identifier of the source account.
  - `expirationDate`: Date when the clearing expires.
  - `deadline`: Deadline for the hold execution.
  - `nonce`: Unique identifier for the request.
  - `signature`: Digital signature verifying the request.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Approve Clearing Operation by Partition

Approve the execution of a clearing transaction. Depending on the operation type, a hold will be created or a transfer or redemption will be made.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `targetId`: Identifier of the target account.
  - `clearingId`: Identifier of the clearing.
  - `clearingOperationType`: Type of operation to perform.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Cancel Clearing Operation by Partition

Cancel the execution of a clearing operation. Transfers all assets back to the original account.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `targetId`: Identifier of the target account.
  - `clearingId`: Identifier of the clearing.
  - `clearingOperationType`: Type of operation to perform.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Reclaim Clearing Operation by Partition

Can be executed by anyone, but only after the expiration date. Transfers all assets back to the original account.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `partitionId`: Identifier of the token partition.
  - `targetId`: Identifier of the target account.
  - `clearingId`: Identifier of the clearing.
  - `clearingOperationType`: Type of operation to perform.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

### KYC

#### Grant KYC

Grant KYC from a target account.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `targetId`: Identifier of the target account.
  - `vcBase64`: Verifiable Credentials (VC) in base64 format
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Revoke KYC

Revoke KYC from a target account.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `targetId`: Identifier of the target account.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Activate Internal KYC

Activate internal KYC of a security.

- **Request**:
  - `securityId`: Identifier of the security token.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Deactivate KYC

Deactivate internal KYC of a security.

- **Request**:
  - `securityId`: Identifier of the security token.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

### SSI Management

#### Add Issuer

Add a new issuer (will fail if it already exists).

- **Request**:
  - `securityId`: Identifier of the security token.
  - `issuerId`: Identifier of the Issuer.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Remove Issuer

Remove an existing issuer.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `issuerId`: Identifier of the existing Issuer.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

#### Set Revocation Registry Address

Add revocation registry address.

- **Request**:
  - `securityId`: Identifier of the security token.
  - `revocationRegistryId`: Identifier of the Revocation Registry.
- **Response**:
  - `payload`: `true` (success) or `false` (failed).
  - `transactionId`: ID of the Hedera transaction, which can be used for tracking in any Hedera block explorer.

## Role

### applyRoles

Assigns a new set of roles for a given account

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: accounts hedera id
  - roles: list of roles.
  - actives: list of boolean indicating whether the correspond role (from the above mentioned role list) must be granted or revoked.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### grantRole

Grants a role to an account

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: accounts hedera id
  - role: role to be granted.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### revokeRole

Revokes a role from an account

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - targetId: accounts hedera id
  - role: role to be revoked.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

## External Pauses Management

### addExternalPause

Adds a new external pause address to a specific asset.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - externalPauseAddress: address of the external pause to be added.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### removeExternalPause

Removes an existing external pause address from a specific asset.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - externalPauseAddress: address of the external pause to be removed.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### updateExternalPauses

Updates the active status of multiple external pause addresses for a specific asset.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - externalPausesAddresses: List of external pause addresses.
  - actives: list of boolean indicating whether the correspond externalPause (from the above mentioned external pauses list) should be added or removed.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

## External Control Lists Management

### addExternalControlList

Adds a new external control list address to a specific asset.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - externalControlListAddress: address of the external control list to be added.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### removeExternalControlList

Removes an existing external control list address from a specific asset.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - externalControlListAddress: address of the external control list to be removed.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### updateExternalControlLists

Updates the active status of multiple external control list addresses for a specific asset.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - externalControlListsAddresses: List of external control list addresses.
  - actives: list of boolean indicating whether the correspond externalControlList (from the above mentioned external control list) should be added or removed.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

## External Kyc Lists Management

### addExternalKycList

Adds a new external kyc list address to a specific asset.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - externalKycListAddress: address of the external kyc list to be added.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### removeExternalKycList

Removes an existing external kyc list address from a specific asset.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - externalKycListAddress: address of the external kyc list to be removed.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

### updateExternalKycLists

Updates the active status of multiple external kyc list addresses for a specific asset.

- Request
  - securityId: Hedera id of the diamond contract representing the asset
  - externalKycListsAddresses: List of external kyc list addresses.
  - actives: list of boolean indicating whether the correspond externalKycList (from the above mentioned external kyc list) should be added or removed.

- Response
  - Payload: True (success), false (failed)
  - TransactionId:
    Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.

## Factory

### getRegulationDetails

Returns the details of a specific regulation and subregulation.

- Request
  - regulationType:
    - 0 : no regulation
    - 1 : Reg S
    - 2 : Reg D
  - regulationSubType:
    - 0 : no sub regulation
    - 1 : 506 B
    - 2 : 506 C

- Response
  - RegulationViewModel.
    - type: string;
    - subType: string;
    - dealSize: string;
    - accreditedInvestors: string;
    - maxNonAccreditedInvestors: number;
    - manualInvestorVerification: string;
    - internationalInvestors: string;
    - resaleHoldPeriod: string;

## Event

### register

Registers callbacks for the wallet events emitted by the SDK

- Request : callbacks to the wallet events (walletInit, walletFound, …)

- Response : -

# Use Cases

The first thing you have to do when using the SDK is to :

- initialize it
- connect an account

## Initialise the SDK

Use the **Network.init** method, with the following input data:

- **Network**:
  - _Testnet_: testnet
  - _Mainnet_: mainnet
- **Mirror Node**: mirror node url, for instance
  - _Testnet_: 'https://testnet.mirrornode.hedera.com/api/v1/'
  - _Mainnet_: 'https://mainnet.mirrornode.hedera.com/api/v1/'
- **Rpc Node**: rpc node url, for instance
  - _Testnet_: 'https://testnet.hashio.io/api'
  - _Mainnet_: 'https://mainnet.hashio.io/api'
- **Resolver**: resolver proxy smart contract address, for instance
  - _Testnet_: '0.0.6797832'
  - _Mainnet_: nothing deployed yet.
- **Factory**:
  - _Testnet_: '0.0.6797955'
  - _Mainnet_: nothing deployed yet.
- **Business Logic Keys Common**: Check the .env.sample from "web".
- **Business Logic Keys Equity**: Check the .env.sample from "web".
- **Business Logic Keys Bond**: Check the .env.sample from "web".

## Connect an account to the SDK

Use the **Network.connect** method, with the following input data:

- **Account**: at least the account Hedera’s id must be provided.
  **Network**:
  - _Testnet_: testnet
  - _Mainnet_: mainnet
- **Mirror Node**: mirror node url, for instance
  - _Testnet_: 'https://testnet.mirrornode.hedera.com/api/v1/'
  - _Mainnet_: 'https://mainnet.mirrornode.hedera.com/api/v1/'
- **Rpc Node**: rpc node url, for instance
  - _Testnet_: 'https://testnet.hashio.io/api'
  - _Mainnet_: 'https://mainnet.hashio.io/api'
- **Wallet**: only metamask is compatible right now

## Deploy a new Bond

Use the **Bond.Create** method.

## Deploy a new Equity

Use the **Equity.Create** method.

## Retrieve Regulation Details from Factory

Use the **Factory.getRegulationDetails** method.

## Manage an Asset

### Manage Asset Roles

- The account applying the roles must have the _“Admin Role”_
- Use the **Role.applyRoles** method

### Minting

- The account minting must have the _“Minter Role”_ (check Manage Asset Roles)
- Use the **Security.issue** method

### Transfer and lock

- The account transferring and locking the funds must have the _“Locker Role”_ (check Manage Asset Roles)
- Use the **Security.transferAndLock** method

### Add and Remove accounts from Control List

- The account applying the roles must have the _"Control list Role"_ (check Manage Asset Roles)
- Use the **Security.addToControlList** and **Security.removeFromControlList** methods

---

## 📚 Documentation

For more information about the project, see the [Documentation](https://hashgraph.github.io/asset-tokenization-studio/).
