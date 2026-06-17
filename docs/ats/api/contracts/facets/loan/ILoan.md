# ILoan

_Asset Tokenization Studio Team_

> ILoan

Interface for managing on-chain loan metadata attached to a security token.

_Stores a rich set of loan attributes (structure, interest, risk, collateral, and performance) that describe the underlying credit instrument. State-changing functions require `ROLE_LOAN_MANAGER`; initialisation requires `DEFAULT_ADMIN_ROLE` and is callable only once._

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
