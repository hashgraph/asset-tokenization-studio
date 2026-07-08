# IOwnership

_Asset Tokenization Studio Team_

> IOwnership

Two-step ownership management interface scoped per diamond configuration.

_Each diamond `configId` carries its own owner and pending-owner slot. Ownership transfer follows the OpenZeppelin Ownable2Step pattern: the current owner nominates a successor via {transferOwnership}, and the nominee must call {acceptOwnership} to finalise the handover. This guards against transfers to addresses that cannot operate the configuration. Implementations are expected to gate the entrypoints behind the configuration owner / pending owner checks and the global pause switch._

## Methods

### acceptOwnership

```solidity
function acceptOwnership(bytes32 _configId) external nonpayable
```

Finalises an ownership handover initiated by the current owner.

_Step two of the two-step transfer. Promotes the pending owner to owner and clears the pending slot. Emits {OwnershipAccepted}._

#### Parameters

| Name       | Type    | Description                                             |
| ---------- | ------- | ------------------------------------------------------- |
| \_configId | bytes32 | Configuration whose pending handover is being accepted. |

### getOwner

```solidity
function getOwner(bytes32 _configId) external view returns (address owner_)
```

Returns the current owner of a configuration.

#### Parameters

| Name       | Type    | Description             |
| ---------- | ------- | ----------------------- |
| \_configId | bytes32 | Configuration to query. |

#### Returns

| Name    | Type    | Description                                                                                  |
| ------- | ------- | -------------------------------------------------------------------------------------------- |
| owner\_ | address | Address that currently owns `configId`, or the zero address when no owner has been recorded. |

### getPendingOwner

```solidity
function getPendingOwner(bytes32 _configId) external view returns (address pendingOwner_)
```

Returns the pending owner of a configuration, if any.

#### Parameters

| Name       | Type    | Description             |
| ---------- | ------- | ----------------------- |
| \_configId | bytes32 | Configuration to query. |

#### Returns

| Name           | Type    | Description                                                                                         |
| -------------- | ------- | --------------------------------------------------------------------------------------------------- |
| pendingOwner\_ | address | Address currently nominated to accept ownership, or the zero address when no transfer is in flight. |

### transferOwnership

```solidity
function transferOwnership(bytes32 _configId, address _newOwner) external nonpayable
```

Nominates `_newOwner` as the pending owner of `_configId`.

_Step one of the two-step transfer. The current owner remains in control until `_newOwner` accepts the handover via {acceptOwnership}. Calling this again before acceptance overwrites the prior nomination. Emits {OwnershipTransfered}._

#### Parameters

| Name       | Type    | Description                                         |
| ---------- | ------- | --------------------------------------------------- |
| \_configId | bytes32 | Configuration whose ownership is being handed over. |
| \_newOwner | address | Address to record as pending owner.                 |

## Events

### OwnershipAccepted

```solidity
event OwnershipAccepted(bytes32 indexed configId, address previousOwner, address newOwner)
```

Emitted when the pending owner finalises the ownership handover.

_Fired by {acceptOwnership} after the configuration owner has been updated and the pending owner slot cleared._

#### Parameters

| Name               | Type    | Description                                                     |
| ------------------ | ------- | --------------------------------------------------------------- |
| configId `indexed` | bytes32 | Configuration whose ownership has changed.                      |
| previousOwner      | address | Address that previously owned the configuration.                |
| newOwner           | address | Caller that accepted ownership and now holds the configuration. |

### OwnershipTransfered

```solidity
event OwnershipTransfered(bytes32 indexed configId, address owner, address pendingOwner)
```

Emitted when the current owner nominates a new owner for a configuration.

_Fired by {transferOwnership} before the handover is accepted; the existing owner remains in control until {acceptOwnership} is invoked by `newOwner`._

#### Parameters

| Name               | Type    | Description                                         |
| ------------------ | ------- | --------------------------------------------------- |
| configId `indexed` | bytes32 | Configuration whose ownership is being transferred. |
| owner              | address | Current owner that initiated the transfer.          |
| pendingOwner       | address | Address nominated as the pending owner.             |

## Errors

### NotOwner

```solidity
error NotOwner(bytes32 configId, address sender, address owner)
```

Raised when the caller is not the current owner of the configuration.

#### Parameters

| Name     | Type    | Description                                        |
| -------- | ------- | -------------------------------------------------- |
| configId | bytes32 | Configuration that was accessed.                   |
| sender   | address | Caller that attempted the owner-only action.       |
| owner    | address | Address currently holding ownership of `configId`. |

### NotPendingOwner

```solidity
error NotPendingOwner(bytes32 configId, address sender, address pendingOwner)
```

Raised when the caller is not the pending owner of the configuration.

#### Parameters

| Name         | Type    | Description                                                 |
| ------------ | ------- | ----------------------------------------------------------- |
| configId     | bytes32 | Configuration whose pending handover was targeted.          |
| sender       | address | Caller that attempted to accept ownership.                  |
| pendingOwner | address | Address currently nominated as pending owner of `configId`. |
