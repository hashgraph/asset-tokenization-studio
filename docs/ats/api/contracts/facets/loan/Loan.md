# Loan

_Asset Tokenization Studio Team_

> Loan

Abstract implementation of `ILoan`.

_Delegates all storage reads and writes to `LoanStorageWrapper`. Access guards are enforced via `Modifiers`; date validation uses `onlyValidTimestamp` and `validateDates`._

## Methods

### getLoanDetails

```solidity
function getLoanDetails() external view returns (struct ILoan.LoanDetailsData loanDetailsData_)
```

Returns the current loan details.

#### Returns

| Name              | Type                  | Description                                             |
| ----------------- | --------------------- | ------------------------------------------------------- |
| loanDetailsData\_ | ILoan.LoanDetailsData | The full loan descriptor currently stored on the token. |

### initializeLoan

```solidity
function initializeLoan(ILoan.LoanDetailsData _loanDetailsData) external nonpayable
```

#### Parameters

| Name              | Type                  | Description |
| ----------------- | --------------------- | ----------- |
| \_loanDetailsData | ILoan.LoanDetailsData | undefined   |

### setLoanDetails

```solidity
function setLoanDetails(ILoan.LoanDetailsData loanDetailsData_) external nonpayable
```

#### Parameters

| Name              | Type                  | Description |
| ----------------- | --------------------- | ----------- |
| loanDetailsData\_ | ILoan.LoanDetailsData | undefined   |

## Events

### LoanDetailsSet

```solidity
event LoanDetailsSet(ILoan.LoanDetailsData loanDetails)
```

Emitted when the loan details are updated by an authorised manager.

#### Parameters

| Name        | Type                  | Description                  |
| ----------- | --------------------- | ---------------------------- |
| loanDetails | ILoan.LoanDetailsData | The updated loan descriptor. |

### LoanInitialized

```solidity
event LoanInitialized(ILoan.LoanDetailsData loanDetailsData)
```

Emitted once when the Loan capability is initialised on a token.

_Fires exclusively from `initializeLoan` after the storage write succeeds._

#### Parameters

| Name            | Type                  | Description                                         |
| --------------- | --------------------- | --------------------------------------------------- |
| loanDetailsData | ILoan.LoanDetailsData | The full loan descriptor written at initialisation. |

## Errors

### AccessControlRequired

```solidity
error AccessControlRequired(bytes32 role, address sender)
```

_Emitted when a role check fails_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| role   | bytes32 | undefined   |
| sender | address | undefined   |

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

### InvalidTimestamp

```solidity
error InvalidTimestamp()
```

Reverts when a timestamp value is invalid.

_Used for shared timestamp validation that is not tied to expiration._

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### WrongDates

```solidity
error WrongDates(uint256 firstDate, uint256 secondDate)
```

Reverts when two date values fail their required ordering constraint.

_The expected relationship between both dates is defined by the caller&#39;s validation context._

#### Parameters

| Name       | Type    | Description                                         |
| ---------- | ------- | --------------------------------------------------- |
| firstDate  | uint256 | First date participating in the failed comparison.  |
| secondDate | uint256 | Second date participating in the failed comparison. |

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
