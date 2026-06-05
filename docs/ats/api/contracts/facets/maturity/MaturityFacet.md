# MaturityFacet

_Asset Tokenization Studio Team_

> MaturityFacet

Diamond facet that exposes token maturity initialisation, redemption, and maturity date management via `IMaturity`, registered under `RESOLVER_KEY_MATURITY`.

_Inherits maturity logic from `Maturity` and satisfies `IStaticFunctionSelectors` for Diamond proxy selector registration. Exposes four selectors: `initializeMaturity`, `fullRedeemAtMaturity`, `updateMaturityDate`, and `getMaturityDate`._

## Methods

### fullRedeemAtMaturity

```solidity
function fullRedeemAtMaturity(address _tokenHolder) external nonpayable
```

Redeems all token partitions held by a token holder at maturity.

_Caller must hold `ROLE_MATURITY_REDEEMER`. Contract must be unpaused and clearing must be disabled. `_tokenHolder` must be on the allowed list, hold granted KYC status, must not be recovered, and the current timestamp must be at or past the maturity date. Iterates every partition owned by `_tokenHolder` and redeems each balance in full. Reverts with an unexpected error if any partition balance is zero.Emits {RedeemedByPartition} for each redeemed partition via `ERC1410StorageWrapper.redeemByPartition`._

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_tokenHolder | address | Address of the token holder whose partitions are to be redeemed. |

### getMaturityDate

```solidity
function getMaturityDate() external view returns (uint256 maturityDate_)
```

Returns the current token maturity date.

_Reads directly from `MaturityDateStorageWrapper` storage slot. No access-control gate — maturity date is public information._

#### Returns

| Name           | Type    | Description                                                                                         |
| -------------- | ------- | --------------------------------------------------------------------------------------------------- |
| maturityDate\_ | uint256 | Current maturity timestamp (Unix epoch, in seconds). Returns zero if the date has not been set yet. |

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

### initializeMaturity

```solidity
function initializeMaturity(uint256 _maturityDate) external nonpayable
```

Sets the token maturity date exactly once during deployment.

_Called by the Factory immediately after the proxy is deployed. No role gate — the one-time guard is enforced by `onlyNotMaturityInitialized`, which reverts with `AlreadyInitialized` on any subsequent call. Persists the date via `MaturityDateStorageWrapper.initializeMaturity`.Emits {MaturityInitialized} with the contract address and the maturity date._

#### Parameters

| Name           | Type    | Description                                                                                                                  |
| -------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| \_maturityDate | uint256 | Maturity timestamp to set (Unix epoch, in seconds). Must be strictly greater than zero and in the future at deployment time. |

### updateMaturityDate

```solidity
function updateMaturityDate(uint256 _newMaturityDate) external nonpayable returns (bool success_)
```

Updates the token maturity date to a new timestamp.

_Caller must hold `ROLE_MATURITY_MANAGER`. Contract must be unpaused. `_newMaturityDate` must satisfy the validity constraint enforced by `onlyValidMaturityDate` — the new date must be strictly greater than the current maturity date. Persists the new date via `MaturityDateStorageWrapper.setMaturityDate`.Emits {MaturityDateUpdated} with the contract address, the new maturity date, and the previous maturity date._

#### Parameters

| Name              | Type    | Description                                             |
| ----------------- | ------- | ------------------------------------------------------- |
| \_newMaturityDate | uint256 | New maturity timestamp to set (Unix epoch, in seconds). |

#### Returns

| Name      | Type | Description                            |
| --------- | ---- | -------------------------------------- |
| success\_ | bool | Always `true` on successful execution. |

## Events

### MaturityDateUpdated

```solidity
event MaturityDateUpdated(address indexed tokenId, uint256 indexed maturityDate, uint256 indexed previousMaturityDate)
```

Emitted whenever the maturity date is updated via `updateMaturityDate`.

#### Parameters

| Name                           | Type    | Description                                        |
| ------------------------------ | ------- | -------------------------------------------------- |
| tokenId `indexed`              | address | Address of the token proxy whose date was updated. |
| maturityDate `indexed`         | uint256 | New maturity timestamp (Unix epoch, seconds).      |
| previousMaturityDate `indexed` | uint256 | Previous maturity timestamp that was replaced.     |

### MaturityInitialized

```solidity
event MaturityInitialized(uint256 indexed maturityDate)
```

Emitted once when the maturity date is set for the first time via `initializeMaturity`.

#### Parameters

| Name                   | Type    | Description                                       |
| ---------------------- | ------- | ------------------------------------------------- |
| maturityDate `indexed` | uint256 | Initial maturity timestamp (Unix epoch, seconds). |

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

### AccountIsBlocked

```solidity
error AccountIsBlocked(address account)
```

Reverts when an operation targets or is requested by a blocked account.

_The blocking policy is enforced by the domain that performs the check._

#### Parameters

| Name    | Type    | Description                                  |
| ------- | ------- | -------------------------------------------- |
| account | address | Account rejected by the blocking validation. |

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

### ClearingIsActivated

```solidity
error ClearingIsActivated()
```

Thrown when an administration action requires clearing to be inactive but it is currently enabled.

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

### InvalidKycStatus

```solidity
error InvalidKycStatus()
```

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### MaturityDateInvalid

```solidity
error MaturityDateInvalid()
```

### WalletRecovered

```solidity
error WalletRecovered()
```

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
