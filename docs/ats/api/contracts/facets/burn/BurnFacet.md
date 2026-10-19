# BurnFacet

_Asset Tokenization Studio Team_

> BurnFacet

Diamond facet exposing the ERC-1594 redemption and ERC-3643 burn surfaces, registered under `RESOLVER_KEY_BURN`.

_Inherits burn logic from `Burn` and satisfies the `IStaticFunctionSelectors` contract required by the Diamond proxy for selector registration. Exposes three selectors: `burn`, `redeem` and `redeemFrom`._

## Methods

### burn

```solidity
function burn(address _userAddress, uint256 _amount) external nonpayable
```

Burns `_amount` tokens from `_userAddress` on behalf of a controller or agent.

_Captures the operator via `EvmAccessors.getMsgSender()` instead of `msg.sender` to support meta-transaction contexts when emitting `ControllerRedemption`._

#### Parameters

| Name          | Type    | Description                                          |
| ------------- | ------- | ---------------------------------------------------- |
| \_userAddress | address | Address whose token balance is reduced.              |
| \_amount      | uint256 | Amount of tokens to burn, denominated in base units. |

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[])
```

Gets all function selectors of a facet

#### Returns

| Name | Type     | Description              |
| ---- | -------- | ------------------------ |
| \_0  | bytes4[] | Face functions selectors |

### getStaticInterfaceIds

```solidity
function getStaticInterfaceIds() external pure returns (bytes4[])
```

Gets all interfaces ids of a facet.

#### Returns

| Name | Type     | Description        |
| ---- | -------- | ------------------ |
| \_0  | bytes4[] | Face interface ids |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Gets the static resolver key

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |

### initializeBurn

```solidity
function initializeBurn() external nonpayable
```

Initialises the burn capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### redeem

```solidity
function redeem(uint256 _value, bytes _data) external nonpayable
```

Redeems `_value` tokens from the caller&#39;s own balance under ERC-1594 semantics.

#### Parameters

| Name    | Type    | Description                                                                    |
| ------- | ------- | ------------------------------------------------------------------------------ |
| \_value | uint256 | Amount of tokens to redeem, denominated in base units.                         |
| \_data  | bytes   | Arbitrary payload that implementations may use to authenticate the redemption. |

### redeemFrom

```solidity
function redeemFrom(address _tokenHolder, uint256 _value, bytes _data) external nonpayable
```

Redeems `_value` tokens from `_tokenHolder`&#39;s balance, analogous to `transferFrom`.

_Both `msg.sender` and `_tokenHolder` must not be recovered addresses._

#### Parameters

| Name          | Type    | Description                                                                    |
| ------------- | ------- | ------------------------------------------------------------------------------ |
| \_tokenHolder | address | Account whose tokens are redeemed.                                             |
| \_value       | uint256 | Amount of tokens to redeem, denominated in base units.                         |
| \_data        | bytes   | Arbitrary payload that implementations may use to authenticate the redemption. |

## Events

### BurnInitialized

```solidity
event BurnInitialized()
```

Emitted once when the burn capability is initialised on a token.

_Fires exclusively from `initializeBurn`._

### ControllerRedemption

```solidity
event ControllerRedemption(address controller, address indexed tokenHolder, uint256 value, bytes data, bytes operatorData)
```

Emitted when an authorised controller redeems (burns) tokens on behalf of a holder.

#### Parameters

| Name                  | Type    | Description                                                     |
| --------------------- | ------- | --------------------------------------------------------------- |
| controller            | address | The address of the controller that initiated the redemption.    |
| tokenHolder `indexed` | address | The account whose tokens are redeemed.                          |
| value                 | uint256 | The amount of tokens redeemed.                                  |
| data                  | bytes   | Optional data attached to the redemption for validation.        |
| operatorData          | bytes   | Optional data attached by the controller for event attribution. |

### Redeemed

```solidity
event Redeemed(address indexed operator, address indexed from, uint256 value, bytes data)
```

Emitted when tokens are redeemed from a holder&#39;s balance.

#### Parameters

| Name               | Type    | Description                                           |
| ------------------ | ------- | ----------------------------------------------------- |
| operator `indexed` | address | Account that executed the redemption.                 |
| from `indexed`     | address | Address from which tokens were burnt.                 |
| value              | uint256 | Amount of tokens redeemed, denominated in base units. |
| data               | bytes   | Arbitrary payload forwarded alongside the redemption. |

## Errors

### AccountHasNoRole

```solidity
error AccountHasNoRole(address account, bytes32 role)
```

Thrown when an account does not hold a required role.

#### Parameters

| Name    | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| account | address | The account that lacks the role. |
| role    | bytes32 | The role that is not held.       |

### AccountHasNoRoles

```solidity
error AccountHasNoRoles(address account, bytes32[] roles)
```

Thrown when an account does not hold any of the specified roles.

#### Parameters

| Name    | Type      | Description                       |
| ------- | --------- | --------------------------------- |
| account | address   | The account that lacks the roles. |
| roles   | bytes32[] | The roles that are not held.      |

### AssetNotOperational

```solidity
error AssetNotOperational(bytes32 configId, uint256 versionId)
```

Raised by `InitializerStorageWrapper.checkOperational` (and the related `isConfigVersionOperational` helper) when an operation is attempted on a configuration version that has not yet been marked operational.

#### Parameters

| Name      | Type    | Description                                                        |
| --------- | ------- | ------------------------------------------------------------------ |
| configId  | bytes32 | Resolver-proxy configuration whose operational status was checked. |
| versionId | uint256 | Configuration version whose operational status was checked.        |

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

### FacetAlreadyRegistered

```solidity
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion)
```

Raised when an initialiser tries to register a facet that already has a non-zero last registered version (i.e. the facet is being re-initialised on a fresh install).

#### Parameters

| Name        | Type    | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| facetId     | bytes32 | Identifier of the offending facet.                             |
| lastVersion | uint256 | Last version recorded for that facet at the time of the check. |

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

Thrown when a single-partition operation is attempted on a multi-partition token.

### PartitionsAreProtectedAndNoRole

```solidity
error PartitionsAreProtectedAndNoRole(address account, bytes32 role)
```

Reverts when a transfer is attempted while partitions are protected and the caller does not hold the required partition role.

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| account | address | The caller lacking the required role.            |
| role    | bytes32 | The role that would have been needed to proceed. |

### TokenIsNotControllable

```solidity
error TokenIsNotControllable()
```

Thrown when an operation requires the token to be controllable but it is not.

### UnrecognizedResolverProxyVersion

```solidity
error UnrecognizedResolverProxyVersion(bytes8 _resolverProxyVersion)
```

Thrown when the provided proxy version does not match any BLR compatible standard.

#### Parameters

| Name                   | Type   | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| \_resolverProxyVersion | bytes8 | proxy version that is not compatible with the BLR. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
