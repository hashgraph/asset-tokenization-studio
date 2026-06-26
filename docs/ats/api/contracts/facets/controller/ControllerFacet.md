# ControllerFacet

_Asset Tokenization Studio Team_

> ControllerFacet

Diamond facet exposing ERC-1644 forced-transfer operations and ERC-3643 agent management.

_Registers nine selectors: initializeController, isControllable, controllerTransfer, controllerRedeem, finalizeControllable, forcedTransfer, addAgent, removeAgent, and isAgent. Inherits all business logic from the Controller abstract contract._

## Methods

### addAgent

```solidity
function addAgent(address _agent) external nonpayable
```

Gives an account the agent role.Granting an agent role allows the account to perform multiple ERC-1400 actions.

_Can only be called by the role admin._

#### Parameters

| Name    | Type    | Description                           |
| ------- | ------- | ------------------------------------- |
| \_agent | address | Address to be granted the agent role. |

### controllerRedeem

```solidity
function controllerRedeem(address _tokenHolder, uint256 _value, bytes _data, bytes _operatorData) external nonpayable
```

This function allows an authorised address to redeem tokens for any token holder.

_This function can only be executed by the `controller` or `agent` address._

#### Parameters

| Name           | Type    | Description                                                  |
| -------------- | ------- | ------------------------------------------------------------ |
| \_tokenHolder  | address | The account whose tokens will be redeemed.                   |
| \_value        | uint256 | uint256 the amount of tokens need to be redeemed.            |
| \_data         | bytes   | data to validate the transfer                                |
| \_operatorData | bytes   | data attached to the transfer by controller to emit in event |

### controllerTransfer

```solidity
function controllerTransfer(address _from, address _to, uint256 _value, bytes _data, bytes _operatorData) external nonpayable
```

This function allows an authorised address to transfer tokens between any two token holders.

_This function can only be executed by the `controller` or `agent` address._

#### Parameters

| Name           | Type    | Description                                                  |
| -------------- | ------- | ------------------------------------------------------------ |
| \_from         | address | Address The address which you want to send tokens from       |
| \_to           | address | Address The address which you want to transfer to            |
| \_value        | uint256 | uint256 the amount of tokens to be transferred               |
| \_data         | bytes   | data to validate the transfer                                |
| \_operatorData | bytes   | data attached to the transfer by controller to emit in event |

### finalizeControllable

```solidity
function finalizeControllable() external nonpayable
```

It is used to end the controller feature from the token

_Emits {FinalizedControllerFeature}._

### forcedTransfer

```solidity
function forcedTransfer(address _from, address _to, uint256 _amount) external nonpayable returns (bool)
```

Performs a forced transfer of `_amount` tokens from `_from` to `_to`.

_This function should only be callable by an authorized entity. Returns `true` if the transfer was successful. Emits a ControllerTransfer event._

#### Parameters

| Name     | Type    | Description                              |
| -------- | ------- | ---------------------------------------- |
| \_from   | address | Address the tokens are transferred from. |
| \_to     | address | Address the tokens are transferred to.   |
| \_amount | uint256 | Amount of tokens to transfer.            |

#### Returns

| Name | Type | Description                          |
| ---- | ---- | ------------------------------------ |
| \_0  | bool | True if the transfer was successful. |

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

### initializeController

```solidity
function initializeController(bool _controllable) external nonpayable
```

One-time initialiser that sets whether the token is controllable.

_Initial configuration. Can only be called once._

#### Parameters

| Name           | Type | Description |
| -------------- | ---- | ----------- |
| \_controllable | bool | undefined   |

### isAgent

```solidity
function isAgent(address _agent) external view returns (bool)
```

Checks whether an account holds the agent role.

_Checks if an account has the agent role._

#### Parameters

| Name    | Type    | Description       |
| ------- | ------- | ----------------- |
| \_agent | address | Address to query. |

#### Returns

| Name | Type | Description                                             |
| ---- | ---- | ------------------------------------------------------- |
| \_0  | bool | True if `_agent` holds the agent role, false otherwise. |

### isControllable

```solidity
function isControllable() external view returns (bool)
```

In order to provide transparency over whether `controllerTransfer` / `controllerRedeem` are useable or not `isControllable` function will be used.

#### Returns

| Name | Type | Description                                                               |
| ---- | ---- | ------------------------------------------------------------------------- |
| \_0  | bool | bool `true` when controller address is non-zero otherwise return `false`. |

### removeAgent

```solidity
function removeAgent(address _agent) external nonpayable
```

Revokes the agent role from an account.

_Can only be called by the role admin._

#### Parameters

| Name    | Type    | Description                          |
| ------- | ------- | ------------------------------------ |
| \_agent | address | Address whose agent role is revoked. |

## Events

### AgentAdded

```solidity
event AgentAdded(address indexed agent)
```

Emitted when an agent is granted transfer-management permissions.

#### Parameters

| Name            | Type    | Description                       |
| --------------- | ------- | --------------------------------- |
| agent `indexed` | address | Address of the newly added agent. |

### AgentRemoved

```solidity
event AgentRemoved(address indexed agent)
```

Emitted when an agent&#39;s transfer-management permissions are revoked.

#### Parameters

| Name            | Type    | Description                   |
| --------------- | ------- | ----------------------------- |
| agent `indexed` | address | Address of the removed agent. |

### ComplianceAdded

```solidity
event ComplianceAdded(address indexed compliance)
```

Emitted when the compliance contract address is updated.

#### Parameters

| Name                 | Type    | Description                                     |
| -------------------- | ------- | ----------------------------------------------- |
| compliance `indexed` | address | Address of the newly wired compliance contract. |

### ControllerInitialized

```solidity
event ControllerInitialized(bool controllable)
```

Emitted when the controller feature is initialised for a token.

_Fired inside `initializeController` once the facet is marked ready._

#### Parameters

| Name         | Type | Description                                       |
| ------------ | ---- | ------------------------------------------------- |
| controllable | bool | Whether the token was configured as controllable. |

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

### ControllerTransfer

```solidity
event ControllerTransfer(address controller, address indexed from, address indexed to, uint256 value, bytes data, bytes operatorData)
```

Emitted when an authorised controller transfers tokens between two holders.

#### Parameters

| Name           | Type    | Description                                                     |
| -------------- | ------- | --------------------------------------------------------------- |
| controller     | address | The address of the controller that initiated the transfer.      |
| from `indexed` | address | The address tokens are transferred from.                        |
| to `indexed`   | address | The address tokens are transferred to.                          |
| value          | uint256 | The amount of tokens transferred.                               |
| data           | bytes   | Optional data attached to the transfer for validation.          |
| operatorData   | bytes   | Optional data attached by the controller for event attribution. |

### FinalizedControllerFeature

```solidity
event FinalizedControllerFeature(address operator)
```

Emitted when the controller feature is permanently disabled for a token.

#### Parameters

| Name     | Type    | Description                                          |
| -------- | ------- | ---------------------------------------------------- |
| operator | address | Address of the caller who finalised controllability. |

### IdentityRegistryAdded

```solidity
event IdentityRegistryAdded(address indexed identityRegistry)
```

Emitted when the identity registry contract address is updated.

#### Parameters

| Name                       | Type    | Description                                   |
| -------------------------- | ------- | --------------------------------------------- |
| identityRegistry `indexed` | address | Address of the newly wired identity registry. |

### RecoverySuccess

```solidity
event RecoverySuccess(address lostWallet, address newWallet, address investorOnchainID)
```

Emitted when a lost wallet is successfully recovered to a new address.

#### Parameters

| Name              | Type    | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| lostWallet        | address | Address of the wallet that was lost.               |
| newWallet         | address | Address of the replacement wallet.                 |
| investorOnchainID | address | OnchainID of the investor performing the recovery. |

### UpdatedTokenInformation

```solidity
event UpdatedTokenInformation(string indexed newName, string indexed newSymbol, uint8 newDecimals, string newVersion, address indexed newOnchainID)
```

Emitted when core token metadata is updated.

#### Parameters

| Name                   | Type    | Description                                      |
| ---------------------- | ------- | ------------------------------------------------ |
| newName `indexed`      | string  | New token name.                                  |
| newSymbol `indexed`    | string  | New token symbol.                                |
| newDecimals            | uint8   | New decimal precision.                           |
| newVersion             | string  | New token version string.                        |
| newOnchainID `indexed` | address | New onchainID address associated with the token. |

## Errors

### AccountAssignedToRole

```solidity
error AccountAssignedToRole(bytes32 role, address account)
```

Thrown when attempting to grant a role to an account that already holds it.

#### Parameters

| Name    | Type    | Description                               |
| ------- | ------- | ----------------------------------------- |
| role    | bytes32 | The role the account already holds.       |
| account | address | The account already assigned to the role. |

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

### AccountNotAssignedToRole

```solidity
error AccountNotAssignedToRole(bytes32 role, address account)
```

Thrown when attempting to revoke or renounce a role from an account that does not hold it.

#### Parameters

| Name    | Type    | Description                           |
| ------- | ------- | ------------------------------------- |
| role    | bytes32 | The role the account does not hold.   |
| account | address | The account not assigned to the role. |

### AddressNotVerified

```solidity
error AddressNotVerified()
```

Thrown when a transfer target address has not passed identity verification.

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

### CannotRecoverWallet

```solidity
error CannotRecoverWallet()
```

Thrown when wallet recovery preconditions are not met (e.g. identity mismatch).

### ComplianceCallFailed

```solidity
error ComplianceCallFailed()
```

Thrown when an external call to the compliance contract reverts or returns false.

### ComplianceNotAllowed

```solidity
error ComplianceNotAllowed()
```

Thrown when a transfer is blocked by the compliance module.

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

### IdentityRegistryCallFailed

```solidity
error IdentityRegistryCallFailed()
```

Thrown when an external call to the identity registry reverts or returns false.

### InputAmountsArrayLengthMismatch

```solidity
error InputAmountsArrayLengthMismatch()
```

Thrown when the lengths of two input amount arrays do not match.

### InputBoolArrayLengthMismatch

```solidity
error InputBoolArrayLengthMismatch()
```

Thrown when the lengths of two input boolean arrays do not match.

### InsufficientFrozenBalance

```solidity
error InsufficientFrozenBalance(address user, uint256 requestedUnfreeze, uint256 availableFrozen, bytes32 partition)
```

Thrown when an unfreeze request exceeds the address&#39;s available frozen balance.

#### Parameters

| Name              | Type    | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| user              | address | Address whose frozen balance was checked.          |
| requestedUnfreeze | uint256 | Amount the caller attempted to unfreeze.           |
| availableFrozen   | uint256 | Actual frozen balance available for unfreezing.    |
| partition         | bytes32 | Partition on which the frozen balance was checked. |

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
