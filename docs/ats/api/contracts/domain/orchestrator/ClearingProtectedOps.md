# ClearingProtectedOps

_Asset Tokenization Studio Team_

> ClearingProtectedOps

Library implementing the protected (EIP-712 signed) clearing operations.

_Deployed once and invoked via `delegatecall` from clearing facets. Every entry validates the nonce/deadline, verifies the off-chain signature against the protected-partitions registry, bumps the holder nonce, and dispatches into {ClearingOps} with the {ThirdPartyType.PROTECTED} dispatch tag. Extracted from {ClearingOps} to keep facet bytecode within EIP-170._

## Errors

### ExpiredDeadline

```solidity
error ExpiredDeadline(uint256 deadline)
```

Reverts when a signed payload is submitted after its deadline.

_The caller must provide and validate deadlines before accepting the signed operation._

#### Parameters

| Name     | Type    | Description                                     |
| -------- | ------- | ----------------------------------------------- |
| deadline | uint256 | Expired deadline carried by the signed payload. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.

### WrongNonce

```solidity
error WrongNonce(uint256 nonce, address account)
```

Reverts when a nonce does not match the expected value for an account.

_Protects signed operations against replay and out-of-order execution._

#### Parameters

| Name    | Type    | Description                                     |
| ------- | ------- | ----------------------------------------------- |
| nonce   | uint256 | Nonce supplied by the caller or signed payload. |
| account | address | Account for which the nonce validation failed.  |

### WrongSignature

```solidity
error WrongSignature()
```

Reverts when a signature fails verification.

_Applies to shared signature validation flows, including EIP-712 payloads and partition-based signatures._

### WrongSignatureLength

```solidity
error WrongSignatureLength()
```

Reverts when a signature payload has an invalid byte length.

_Used before signature recovery or verification to reject malformed input._
