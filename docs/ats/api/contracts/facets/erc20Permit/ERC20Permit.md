# ERC20Permit

_Asset Tokenization Studio Team_

> ERC20 Permit

Provides ERC-20 permit support for approval by off-chain signature.

_This facet registers itself during initialisation and delegates permit state changes to `ERC20PermitStorageWrapper`. Permit execution is restricted to operational, activated, unpaused, compliant, single-partition assets._

## Methods

### initializeERC20Permit

```solidity
function initializeERC20Permit() external nonpayable
```

Initialises the ERC20 permit capability on the token.

_Restricted to `DEFAULT_ADMIN_ROLE` by the implementation. Callable once and expected to revert with `FacetAlreadyRegistered` on subsequent calls. Emits `ERC20PermitInitialized` on success._

### permit

```solidity
function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external nonpayable
```

Approves a spender using an owner&#39;s off-chain ERC-2612 signature.

_Validates the deadline, owner nonce, EIP-712 digest, and recovered signer before updating allowance. Reverts with `ERC2612ExpiredSignature` or `ERC2612InvalidSigner` when validation fails._

#### Parameters

| Name     | Type    | Description                                     |
| -------- | ------- | ----------------------------------------------- |
| owner    | address | Token holder granting the allowance.            |
| spender  | address | Address authorised to spend `owner` tokens.     |
| value    | uint256 | Allowance amount approved for `spender`.        |
| deadline | uint256 | Last timestamp at which the signature is valid. |
| v        | uint8   | Recovery identifier of the ECDSA signature.     |
| r        | bytes32 | First 32-byte word of the ECDSA signature.      |
| s        | bytes32 | Second 32-byte word of the ECDSA signature.     |

## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value)
```

Emitted when `owner` authorises `spender` to spend up to `value` tokens on their behalf, whether via {IAllowance.approve}, {IAllowance.increaseAllowance} or {IAllowance.decreaseAllowance}.

_Mirrors the ERC-20 `Approval` event. `value` is the resulting, absolute allowance after the update — not the delta applied._

#### Parameters

| Name              | Type    | Description                                                        |
| ----------------- | ------- | ------------------------------------------------------------------ |
| owner `indexed`   | address | Address whose tokens may be spent.                                 |
| spender `indexed` | address | Address authorised to spend on `owner`&#39;s behalf.               |
| value             | uint256 | Allowance of `spender` over `owner`&#39;s tokens after the update. |

### ERC20PermitInitialized

```solidity
event ERC20PermitInitialized()
```

Emitted once when the ERC20 permit capability is initialised on a token.

_Fires exclusively from `initializeERC20Permit` after successful facet registration._

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
```

Emitted whenever tokens move between accounts, are minted, or are burned.

#### Parameters

| Name           | Type    | Description                                 |
| -------------- | ------- | ------------------------------------------- |
| from `indexed` | address | Source account (zero address on mint).      |
| to `indexed`   | address | Destination account (zero address on burn). |
| value          | uint256 | Amount of tokens transferred.               |

### TransferByPartition

```solidity
event TransferByPartition(bytes32 indexed _fromPartition, address _operator, address indexed _from, address indexed _to, uint256 _value, bytes _data, bytes _operatorData)
```

Emitted when tokens are transferred from one partition to another or within the same partition.

#### Parameters

| Name                      | Type    | Description                           |
| ------------------------- | ------- | ------------------------------------- |
| \_fromPartition `indexed` | bytes32 | Source partition.                     |
| \_operator                | address | Address that initiated the transfer.  |
| \_from `indexed`          | address | Token holder whose balance decreased. |
| \_to `indexed`            | address | Recipient whose balance increased.    |
| \_value                   | uint256 | Token quantity transferred.           |
| \_data                    | bytes   | Caller-supplied data.                 |
| \_operatorData            | bytes   | Operator-supplied data.               |

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

### ERC2612ExpiredSignature

```solidity
error ERC2612ExpiredSignature(uint256 deadline)
```

Raised when a permit signature is submitted after its expiry deadline.

_The permit must not mutate allowance state when the deadline has passed._

#### Parameters

| Name     | Type    | Description                                          |
| -------- | ------- | ---------------------------------------------------- |
| deadline | uint256 | Timestamp after which the permit is no longer valid. |

### ERC2612InvalidSigner

```solidity
error ERC2612InvalidSigner(address signer, address owner)
```

Raised when the recovered permit signer does not match the token owner.

_Protects approvals from invalid, malformed, or unauthorised signatures._

#### Parameters

| Name   | Type    | Description                                            |
| ------ | ------- | ------------------------------------------------------ |
| signer | address | Address recovered from the submitted permit signature. |
| owner  | address | Address expected to have authorised the permit.        |

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

### SpenderWithZeroAddress

```solidity
error SpenderWithZeroAddress()
```

Reverts when the zero address is supplied as `spender` in an allowance update.

### UnexpectedError

```solidity
error UnexpectedError(bytes4 _errorId)
```

Reverts when an unreachable validation state is detected.

_Replaces assertions for defensive handling of logically impossible states._

#### Parameters

| Name      | Type   | Description                                        |
| --------- | ------ | -------------------------------------------------- |
| \_errorId | bytes4 | Identifier of the unexpected validation condition. |

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
