# IController

> IController

Interface for the ControllerFacet, grouping all controller and agent management operations.

_Combines ERC-1644 forced-transfer / controllability lifecycle with ERC-3643 agent role management. Inherits `AgentAdded` and `AgentRemoved` events from `IERC3643Types`._

## Methods

### addAgent

```solidity
function addAgent(address _agent) external nonpayable
```

Gives an account the agent roleGranting an agent role allows the account to perform multiple ERC-1400 actions

_Can only be called by the role admin_

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_agent | address | undefined   |

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

_It only be called by the `owner/issuer` of the token_

### forcedTransfer

```solidity
function forcedTransfer(address _from, address _to, uint256 _amount) external nonpayable returns (bool)
```

_Performs a forced transfer of `_amount` tokens from `_from` to `_to`.This function should only be callable by an authorized entity. Returns `true` if the transfer was successful. Emits a ControllerTransfer event._

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_from   | address | undefined   |
| \_to     | address | undefined   |
| \_amount | uint256 | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### initializeController

```solidity
function initializeController(bool _isControllable) external nonpayable
```

_Initial configuration_

#### Parameters

| Name             | Type | Description                                     |
| ---------------- | ---- | ----------------------------------------------- |
| \_isControllable | bool | true is controllable, false is not controllable |

### isAgent

```solidity
function isAgent(address _agent) external view returns (bool)
```

_Checks if an account has the agent role_

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_agent | address | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

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

Revokes an account the agent role

_Can only be called by the role admin_

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_agent | address | undefined   |

## Events

### AgentAdded

```solidity
event AgentAdded(address indexed _agent)
```

Emitted when an agent is granted transfer-management permissions.

#### Parameters

| Name              | Type    | Description                       |
| ----------------- | ------- | --------------------------------- |
| \_agent `indexed` | address | Address of the newly added agent. |

### AgentRemoved

```solidity
event AgentRemoved(address indexed _agent)
```

Emitted when an agent&#39;s transfer-management permissions are revoked.

#### Parameters

| Name              | Type    | Description                   |
| ----------------- | ------- | ----------------------------- |
| \_agent `indexed` | address | Address of the removed agent. |

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

| Name         | Type | Description |
| ------------ | ---- | ----------- |
| controllable | bool | undefined   |

### ControllerRedemption

```solidity
event ControllerRedemption(address _controller, address indexed _tokenHolder, uint256 _value, bytes _data, bytes _operatorData)
```

Emitted when an authorised controller redeems (burns) tokens on behalf of a holder.

#### Parameters

| Name                    | Type    | Description                                                     |
| ----------------------- | ------- | --------------------------------------------------------------- |
| \_controller            | address | The address of the controller that initiated the redemption.    |
| \_tokenHolder `indexed` | address | The account whose tokens are redeemed.                          |
| \_value                 | uint256 | The amount of tokens redeemed.                                  |
| \_data                  | bytes   | Optional data attached to the redemption for validation.        |
| \_operatorData          | bytes   | Optional data attached by the controller for event attribution. |

### ControllerTransfer

```solidity
event ControllerTransfer(address _controller, address indexed _from, address indexed _to, uint256 _value, bytes _data, bytes _operatorData)
```

Emitted when an authorised controller transfers tokens between two holders.

#### Parameters

| Name             | Type    | Description                                                     |
| ---------------- | ------- | --------------------------------------------------------------- |
| \_controller     | address | The address of the controller that initiated the transfer.      |
| \_from `indexed` | address | The address tokens are transferred from.                        |
| \_to `indexed`   | address | The address tokens are transferred to.                          |
| \_value          | uint256 | The amount of tokens transferred.                               |
| \_data           | bytes   | Optional data attached to the transfer for validation.          |
| \_operatorData   | bytes   | Optional data attached by the controller for event attribution. |

### FinalizedControllerFeature

```solidity
event FinalizedControllerFeature(address operator)
```

Emitted when the controller feature is permanently disabled for a token.

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| operator | address | undefined   |

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
event RecoverySuccess(address _lostWallet, address _newWallet, address _investorOnchainID)
```

Emitted when a lost wallet is successfully recovered to a new address.

#### Parameters

| Name                | Type    | Description                                        |
| ------------------- | ------- | -------------------------------------------------- |
| \_lostWallet        | address | Address of the wallet that was lost.               |
| \_newWallet         | address | Address of the replacement wallet.                 |
| \_investorOnchainID | address | OnchainID of the investor performing the recovery. |

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

### AddressNotVerified

```solidity
error AddressNotVerified()
```

Thrown when a transfer target address has not passed identity verification.

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

### TokenIsNotControllable

```solidity
error TokenIsNotControllable()
```

Thrown when an operation requires the token to be controllable but it is not.

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
