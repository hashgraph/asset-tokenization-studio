# LoansPortfolio

_Asset Tokenization Studio Team_

> LoansPortfolio

Abstract implementation of `ILoansPortfolio`.

_Delegates persistence to `LoansPortfolioStorageWrapper`; writers are gated by `ROLE_LOANS_PORTFOLIO_MANAGER` plus the global activation, pause, and zero-address invariants enforced via `Modifiers`._

## Methods

### addHoldingsAsset

```solidity
function addHoldingsAsset(ILoansPortfolio.HoldingsAsset _holdingsAsset) external nonpayable returns (bool success_)
```

#### Parameters

| Name            | Type                          | Description |
| --------------- | ----------------------------- | ----------- |
| \_holdingsAsset | ILoansPortfolio.HoldingsAsset | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

### getDefaultedLoansRatio

```solidity
function getDefaultedLoansRatio() external view returns (uint256 numerator_, uint256 denominator_)
```

Returns the defaulted-loans ratio as a numerator/denominator pair.

#### Returns

| Name          | Type    | Description                               |
| ------------- | ------- | ----------------------------------------- |
| numerator\_   | uint256 | Numerator of the defaulted-loans ratio.   |
| denominator\_ | uint256 | Denominator of the defaulted-loans ratio. |

### getGeographicalExposure

```solidity
function getGeographicalExposure() external view returns (struct ILoansPortfolio.GeographicalExposureData[] geographicalExposure_)
```

Returns the geographical exposure aggregated by country.

#### Returns

| Name                   | Type                                       | Description                                                                                        |
| ---------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| geographicalExposure\_ | ILoansPortfolio.GeographicalExposureData[] | Array of `(country, count)` tuples covering every country present in the portfolio&#39;s holdings. |

### getHoldingsAssetOwnership

```solidity
function getHoldingsAssetOwnership(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] assets_, uint256[] balances_)
```

Returns a paginated slice of holdings assets paired with the portfolio&#39;s current balance in each.

#### Parameters

| Name         | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.      |
| \_pageLength | uint256 | Number of entries per page. |

#### Returns

| Name       | Type      | Description                                                 |
| ---------- | --------- | ----------------------------------------------------------- |
| assets\_   | address[] | Slice of asset addresses for the requested page.            |
| balances\_ | uint256[] | Balances held by the portfolio for each entry in `assets_`. |

### getHoldingsAssets

```solidity
function getHoldingsAssets(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] assets_)
```

Returns a paginated slice of every registered holdings asset address.

#### Parameters

| Name         | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.      |
| \_pageLength | uint256 | Number of entries per page. |

#### Returns

| Name     | Type      | Description                                      |
| -------- | --------- | ------------------------------------------------ |
| assets\_ | address[] | Slice of asset addresses for the requested page. |

### getLoanHoldingsAssets

```solidity
function getLoanHoldingsAssets(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] assets_)
```

Returns a paginated slice of holdings assets whose type is `LOAN`.

#### Parameters

| Name         | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.      |
| \_pageLength | uint256 | Number of entries per page. |

#### Returns

| Name     | Type      | Description                                              |
| -------- | --------- | -------------------------------------------------------- |
| assets\_ | address[] | Slice of loan-holdings addresses for the requested page. |

### getLoansPortfolioData

```solidity
function getLoansPortfolioData() external view returns (struct ILoansPortfolio.LoansPortfolioDetailsData loansPortfolioData_)
```

Returns the portfolio-level configuration captured at initialisation.

#### Returns

| Name                 | Type                                      | Description                            |
| -------------------- | ----------------------------------------- | -------------------------------------- |
| loansPortfolioData\_ | ILoansPortfolio.LoansPortfolioDetailsData | The persisted portfolio configuration. |

### getNonPerformingLoansRatio

```solidity
function getNonPerformingLoansRatio() external view returns (uint256 numerator_, uint256 denominator_)
```

Returns the non-performing-loans ratio as a numerator/denominator pair.

#### Returns

| Name          | Type    | Description                                    |
| ------------- | ------- | ---------------------------------------------- |
| numerator\_   | uint256 | Numerator of the non-performing-loans ratio.   |
| denominator\_ | uint256 | Denominator of the non-performing-loans ratio. |

### getNumberDefaultedLoans

```solidity
function getNumberDefaultedLoans() external view returns (uint256 numberDefaultedLoans_)
```

Returns the count of loan holdings currently in default.

#### Returns

| Name                   | Type    | Description               |
| ---------------------- | ------- | ------------------------- |
| numberDefaultedLoans\_ | uint256 | Count of defaulted loans. |

### getNumberOfAssets

```solidity
function getNumberOfAssets() external view returns (uint256 numberOfAssets_)
```

Returns the total number of registered holdings assets.

#### Returns

| Name             | Type    | Description               |
| ---------------- | ------- | ------------------------- |
| numberOfAssets\_ | uint256 | Count of holdings assets. |

### getNumberOfCash

```solidity
function getNumberOfCash() external view returns (uint256 numberOfCash_)
```

Returns the count of holdings assets with type `CASH`.

#### Returns

| Name           | Type    | Description             |
| -------------- | ------- | ----------------------- |
| numberOfCash\_ | uint256 | Count of cash holdings. |

### getNumberOfLoans

```solidity
function getNumberOfLoans() external view returns (uint256 numberOfLoans_)
```

Returns the count of holdings assets with type `LOAN`.

#### Returns

| Name            | Type    | Description             |
| --------------- | ------- | ----------------------- |
| numberOfLoans\_ | uint256 | Count of loan holdings. |

### getNumberOfNonPerformingLoans

```solidity
function getNumberOfNonPerformingLoans() external view returns (uint256 numberOfNonPerformingLoans_)
```

Returns the count of loan holdings currently classified as non-performing.

#### Returns

| Name                         | Type    | Description                    |
| ---------------------------- | ------- | ------------------------------ |
| numberOfNonPerformingLoans\_ | uint256 | Count of non-performing loans. |

### getNumberOfPerformingLoans

```solidity
function getNumberOfPerformingLoans() external view returns (uint256 numberOfPerformingLoans_)
```

Returns the count of loan holdings currently classified as performing.

#### Returns

| Name                      | Type    | Description                |
| ------------------------- | ------- | -------------------------- |
| numberOfPerformingLoans\_ | uint256 | Count of performing loans. |

### getPerformingLoansRatio

```solidity
function getPerformingLoansRatio() external view returns (uint256 numerator_, uint256 denominator_)
```

Returns the performing-loans ratio as a numerator/denominator pair.

#### Returns

| Name          | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| numerator\_   | uint256 | Numerator of the performing-loans ratio.   |
| denominator\_ | uint256 | Denominator of the performing-loans ratio. |

### getSecuredLoansRatio

```solidity
function getSecuredLoansRatio() external view returns (uint256 numerator_, uint256 denominator_)
```

Returns the secured-loans ratio as a numerator/denominator pair.

_Pair semantics avoid loss-of-precision compared to a single fixed-point value._

#### Returns

| Name          | Type    | Description                             |
| ------------- | ------- | --------------------------------------- |
| numerator\_   | uint256 | Numerator of the secured-loans ratio.   |
| denominator\_ | uint256 | Denominator of the secured-loans ratio. |

### initializeLoansPortfolio

```solidity
function initializeLoansPortfolio(ILoansPortfolio.LoansPortfolioDetailsData _loansPortfolioData) external nonpayable
```

#### Parameters

| Name                 | Type                                      | Description |
| -------------------- | ----------------------------------------- | ----------- |
| \_loansPortfolioData | ILoansPortfolio.LoansPortfolioDetailsData | undefined   |

### loansPortfolioWithdraw

```solidity
function loansPortfolioWithdraw(address _assetAddress, address _to, uint256 _amount) external nonpayable returns (bool success_)
```

Withdraws an amount from a holdings asset to an external recipient.

#### Parameters

| Name           | Type    | Description                          |
| -------------- | ------- | ------------------------------------ |
| \_assetAddress | address | Holdings asset funds are drawn from. |
| \_to           | address | Recipient of the withdrawn amount.   |
| \_amount       | uint256 | Amount to withdraw.                  |

#### Returns

| Name      | Type | Description                         |
| --------- | ---- | ----------------------------------- |
| success\_ | bool | True when the withdrawal completed. |

### notifyLoanHoldingsAssetUpdate

```solidity
function notifyLoanHoldingsAssetUpdate(address _holdingsAssetAddress) external nonpayable returns (bool success_)
```

Broadcasts that the loan holdings asset&#39;s state has changed off-portfolio.

_Pure notification path — does not mutate the underlying loan; merely emits `LoanHoldingsAssetUpdated` so indexers refresh their view._

#### Parameters

| Name                   | Type    | Description                                          |
| ---------------------- | ------- | ---------------------------------------------------- |
| \_holdingsAssetAddress | address | Address of the loan holdings asset that was updated. |

#### Returns

| Name      | Type | Description                              |
| --------- | ---- | ---------------------------------------- |
| success\_ | bool | True when the notification was accepted. |

### removeHoldingsAsset

```solidity
function removeHoldingsAsset(ILoansPortfolio.HoldingsAsset _holdingsAsset) external nonpayable returns (bool success_)
```

#### Parameters

| Name            | Type                          | Description |
| --------------- | ----------------------------- | ----------- |
| \_holdingsAsset | ILoansPortfolio.HoldingsAsset | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

## Events

### HoldingsAssetAdded

```solidity
event HoldingsAssetAdded(ILoansPortfolio.HoldingsAsset holdingsAsset)
```

Emitted when a new holdings asset is added to the portfolio.

#### Parameters

| Name          | Type                          | Description                               |
| ------------- | ----------------------------- | ----------------------------------------- |
| holdingsAsset | ILoansPortfolio.HoldingsAsset | The asset descriptor that was registered. |

### HoldingsAssetRemoved

```solidity
event HoldingsAssetRemoved(ILoansPortfolio.HoldingsAsset holdingsAsset)
```

Emitted when an existing holdings asset is removed from the portfolio.

#### Parameters

| Name          | Type                          | Description                            |
| ------------- | ----------------------------- | -------------------------------------- |
| holdingsAsset | ILoansPortfolio.HoldingsAsset | The asset descriptor that was removed. |

### LoanHoldingsAssetUpdated

```solidity
event LoanHoldingsAssetUpdated(address loanHoldingsAsset)
```

Emitted when a registered loan holdings asset notifies a state update.

#### Parameters

| Name              | Type    | Description                                     |
| ----------------- | ------- | ----------------------------------------------- |
| loanHoldingsAsset | address | Address of the loan whose state was advertised. |

### LoansPortfolioInitialized

```solidity
event LoansPortfolioInitialized(ILoansPortfolio.LoansPortfolioDetailsData loansPortfolioData)
```

Emitted once when the LoansPortfolio capability is initialised on a token.

_Fires exclusively from `initializeLoansPortfolio` after the storage write succeeds._

#### Parameters

| Name               | Type                                      | Description                                             |
| ------------------ | ----------------------------------------- | ------------------------------------------------------- |
| loansPortfolioData | ILoansPortfolio.LoansPortfolioDetailsData | The portfolio configuration captured at initialisation. |

### LoansPortfolioWithdrawn

```solidity
event LoansPortfolioWithdrawn(address assetAddress, address to, uint256 amount)
```

Emitted when funds are withdrawn from a holdings asset to an external account.

#### Parameters

| Name         | Type    | Description                                          |
| ------------ | ------- | ---------------------------------------------------- |
| assetAddress | address | Address of the holdings asset funds were drawn from. |
| to           | address | Recipient of the withdrawn amount.                   |
| amount       | uint256 | Amount transferred to the recipient.                 |

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

### FacetPreviousVersionNotAccepted

```solidity
error FacetPreviousVersionNotAccepted(bytes32 facetId, uint256 lastVersion, uint256[] expectedVersions)
```

Raised when an initialiser requires the facet&#39;s previously registered version to match one of an expected set and the current `lastVersion` falls outside that set.

#### Parameters

| Name             | Type      | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| facetId          | bytes32   | Identifier of the facet being upgraded.      |
| lastVersion      | uint256   | Last version currently stored for the facet. |
| expectedVersions | uint256[] | List of acceptable predecessor versions.     |

### HoldingAssetNotFound

```solidity
error HoldingAssetNotFound(address assetAddress)
```

Thrown when looking up a holdings asset that has not been registered.

#### Parameters

| Name         | Type    | Description                              |
| ------------ | ------- | ---------------------------------------- |
| assetAddress | address | Address of the asset that was not found. |

### HoldingsAssetAlreadyExists

```solidity
error HoldingsAssetAlreadyExists(address assetAddress)
```

Thrown when adding a holdings asset that is already registered.

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| assetAddress | address | Address of the asset that is already present. |

### HoldingsAssetTypeNotSupported

```solidity
error HoldingsAssetTypeNotSupported(uint8 holdingsAssetType)
```

Thrown when a holdings asset declares a type outside the supported set.

#### Parameters

| Name              | Type  | Description                                             |
| ----------------- | ----- | ------------------------------------------------------- |
| holdingsAssetType | uint8 | The unsupported `HoldingsAssetType` value (as `uint8`). |

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### WrongCountryCode

```solidity
error WrongCountryCode(bytes4 _countryCode)
```

Thrown when a holdings asset references an unsupported country code.

#### Parameters

| Name          | Type   | Description                   |
| ------------- | ------ | ----------------------------- |
| \_countryCode | bytes4 | The unsupported country code. |

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._

### ZeroValue

```solidity
error ZeroValue()
```

Thrown when a zero token amount is supplied to an operation that requires a positive value.
