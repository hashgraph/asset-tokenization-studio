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
- **[Use Cases](#use-cases)**<br>
  - **[Initialise the SDK](#initialise-the-sdk)**<br>
  - **[Connect an account to the SDK](#connect-an-account-to-the-sdk)**<br>
  - **[Deploy a new Bond](#deploy-a-new-bond)**<br>
  - **[Deploy a new Equity](#deploy-a-new-equity)**<br>
  - **[Retrieve Regulation Details from Factory](#retrieve-regulation-details-from-factory)**<br>
  - **[Manage an Asset](#manage-an-asset)**<br>



# Description

The SDK enables the web (or any other client facing application) to interact with the smart contracts deployed on Hedera.

# Installation

Run the command :

```
npm ci
```

# Build

Run the command :

```
npm run build
```

# Test

The SDK tests are located in the *__tests__* folder at the root of the sdk module.

Before running the tests you will need to create an ".env" file following the ".env.sample" template.

Then to execute all the tests run this command from the *sdk* folder:

```
npm run test
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
   - businessLogicKeysCommon: list of common keys and their respective environments in case the wallet allows for the network to be switched.
   - businessLogicKeysEquity: list of equity keys and their respective environments in case the wallet allows for the network to be switched.
   - businessLogicKeysBond: list of bond keys and their respective environments in case the wallet allows for the network to be switched.

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

## Bond

### create

- Request
   - diamondOwnerAccount: Hedera id of the account deploying the security
   - Currency: hexadecimal of the currency’s 3 letter ISO code
   - numberOfUnits: maximum supply
   - nominalValue: only for information, represents the value of a single bond.
   - startingDate: Bond’s starting date in seconds
   - maturityDate: Bond’s maturity date in seconds
   - couponFrequency: seconds in between two consecutives coupon’s record date
   - couponRate: coupon interest rate in percentage. Only for information.
   - firstCouponDate: record date, in seconds, of the first coupon.
   - regulationType: 
      - 0 : no regulation
      - 1 : Reg S
      - 2 : Reg D
   - regulationSubType:
      - 0 : no sub regulation
      - 1 : 506 B
      - 2 : 506 C
   - isCountryControlListWhiteList : 
      - True: list of “countries” are the not banned, all other countries are banned
      - False: list of “countries” are banned, all other countries are not banned.
   - countries: comma separated list of banned/not banned countries in 2-letters ISO format.

- Response
  - SecurityViewModel:
The returned information is identical to the provided one, except for this fields
      - type: string; “BOND” or “EQUITY”
      - totalSupply: string; Corresponds to the total supply, which is 0 right after the initial deployment.
      - maxSupply: string; Corresponds to the “numberOfUnits”
      - diamondAddress: string; Hedera id of the deployed smart contract representing the Asset
      - evmDiamondAddress: string; EVM address of the deployed smart contract representing the Asset
      - paused: boolean; True (the Asset is paused), False (the asset is not paused)
      - Regulation: RegulationViewModel; Details of the selected regulation during deployment (type, subType, dealSize, …)
  - TransactionId: 
Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.


## Equity

### create

- Request
   - diamondOwnerAccount: Hedera id of the account deploying the security
   - votingRight: the equity grants voting rights to its holders.
   - informationRight: the equity grants information rights to its holders.
   - liquidationRight:  the equity grants liquidation rights to its holders
   - subscriptionright: the equity grants subscription rights to its holders
   - convertionRight: the equity grants convertion rights to its holders
   - redemptionRight: the equity grants redemption rights to its holders
   - putRight: the equity grants put rights to its holders
   - dividendRight: the equity grants dividend rights to its holders
   - Currency: hexadecimal of the currency’s 3 letter ISO code
   - numberOfShares: maximum supply
   - nominalValue: only for information, represents the value of a single equity.
   - regulationType: 
      - 0 : no regulation
      - 1 : Reg S
      - 2 : Reg D
   - regulationSubType:
      - 0 : no sub regulation
      - 1 : 506 B
      - 2 : 506 C
   - isCountryControlListWhiteList : 
      - True: list of “countries” are the not banned, all other countries are banned
      - False: list of “countries” are banned, all other countries are not banned.
   - countries: comma separated list of banned/not banned countries in 2-letters ISO format.

- Response
   - SecurityViewModel:
The returned information is identical to the provided one, except for this fields
      - type: string; “BOND” or “EQUITY”
      - totalSupply: string; Corresponds to the total supply, which is 0 right after the initial deployment.
      - maxSupply: string; Corresponds to the “numberOfShares”
      - diamondAddress: string; Hedera id of the deployed smart contract representing the Asset
      - evmDiamondAddress: string; EVM address of the deployed smart contract representing the Asset
      - paused: boolean; True (the Asset is paused), False (the asset is not paused)
      - Regulation: RegulationViewModel; Details of the selected regulation during deployment (type, subType, dealSize, …)
   - TransactionId: 
Id of the Hedera transaction. Can be used to track the transaction in any Hedera block explorer.


## Security

### issue

Mints new assets to a given account

- Request
   - securityId: Hedera id of the diamond contract representing the asset
   - targetId: accounts hedera id
amount: amount to be minted with decimals included

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
  - _Testnet_: '0.0.3532144'
  - _Mainnet_: nothing deployed yet.
- **Factory**:
  - _Testnet_:  '0.0.3532205'
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

- The account transferring and locking the funds must have the _“Locker Role”_  (check Manage Asset Roles)
- Use the **Security.transferAndLock** method 


### Add and Remove accounts from Control List

- The account applying the roles must have the _“Control list Role”_ (check Manage Asset Roles)
- Use the **Security.addToControlList** and **Security.removeFromControlList** methods 



