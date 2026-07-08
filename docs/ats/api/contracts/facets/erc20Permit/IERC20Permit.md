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
function permit(address _owner, address _spender, uint256 _value, uint256 _deadline, uint8 _v, bytes32 _r, bytes32 _s) external nonpayable
```

Approves a spender using an owner&#39;s off-chain ERC-2612 signature.

_Validates the deadline, owner nonce, EIP-712 digest, and recovered signer before updating allowance. Reverts with `ERC2612ExpiredSignature` or `ERC2612InvalidSigner` when validation fails._

#### Parameters

| Name       | Type    | Description                                     |
| ---------- | ------- | ----------------------------------------------- |
| \_owner    | address | Token holder granting the allowance.            |
| \_spender  | address | Address authorised to spend `owner` tokens.     |
| \_value    | uint256 | Allowance amount approved for `spender`.        |
| \_deadline | uint256 | Last timestamp at which the signature is valid. |
| \_v        | uint8   | Recovery identifier of the ECDSA signature.     |
| \_r        | bytes32 | First 32-byte word of the ECDSA signature.      |
| \_s        | bytes32 | Second 32-byte word of the ECDSA signature.     |

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
