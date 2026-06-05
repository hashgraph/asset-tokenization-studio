# IERC20Permit

_Tokeny Solutions_

> IERC20Permit

Defines the ERC-2612 permit interface for signature-based ERC20 approvals.

_Exposes initialisation and permit operations expected from an ERC20 permit facet. Implementations must enforce replay protection, deadline checks, and signer validity._

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

### ERC20PermitInitialized

```solidity
event ERC20PermitInitialized()
```

Emitted once when the ERC20 permit capability is initialised on a token.

_Fires exclusively from `initializeERC20Permit` after successful facet registration._

## Errors

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
