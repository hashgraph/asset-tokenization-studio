# SsiManagement

_Asset Tokenization Studio Team_

> SsiManagement

Abstract contract implementing Self-Sovereign Identity (SSI) management logic for a security token, including control of the trusted issuer list and the revocation registry address.

_Implements `ISsiManagement`. All persistent state is delegated to diamond storage via `SsiManagementStorageWrapper`. Every mutating function is gated by `ROLE_SSI_MANAGER` and the `onlyUnpaused` modifier inherited from `Modifiers`. Intended to be inherited exclusively by `SsiManagementFacet`._

## Methods

### addIssuer

```solidity
function addIssuer(address _issuer) external nonpayable returns (bool success_)
```

Adds an address to the trusted issuer list.

_Requires `ROLE_SSI_MANAGER` and the token to be unpaused. Reverts with `ListedIssuer` if the address is already listed, or with `ZeroAddressNotAllowed` if the address is zero. Emits `AddedToIssuerList`._

#### Parameters

| Name     | Type    | Description                   |
| -------- | ------- | ----------------------------- |
| \_issuer | address | Address of the issuer to add. |

#### Returns

| Name      | Type | Description                                |
| --------- | ---- | ------------------------------------------ |
| success\_ | bool | True if the issuer was added successfully. |

### getIssuerListCount

```solidity
function getIssuerListCount() external view returns (uint256 issuerListCount_)
```

Returns the total number of addresses in the trusted issuer list.

#### Returns

| Name              | Type    | Description                           |
| ----------------- | ------- | ------------------------------------- |
| issuerListCount\_ | uint256 | The current number of listed issuers. |

### getIssuerListMembers

```solidity
function getIssuerListMembers(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of the trusted issuer list.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the list length.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                       |
| --------- | --------- | ------------------------------------------------- |
| members\_ | address[] | Array of issuer addresses for the requested page. |

### getRevocationRegistryAddress

```solidity
function getRevocationRegistryAddress() external view returns (address revocationRegistryAddress_)
```

Returns the address of the current revocation registry contract.

#### Returns

| Name                        | Type    | Description                               |
| --------------------------- | ------- | ----------------------------------------- |
| revocationRegistryAddress\_ | address | The revocation registry contract address. |

### initializeSsiManagement

```solidity
function initializeSsiManagement() external nonpayable
```

Initialises the SSI management capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### isIssuer

```solidity
function isIssuer(address _issuer) external view returns (bool)
```

Checks whether an address is present in the trusted issuer list.

#### Parameters

| Name     | Type    | Description       |
| -------- | ------- | ----------------- |
| \_issuer | address | Address to check. |

#### Returns

| Name | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| \_0  | bool | True if the address is a listed issuer, false otherwise. |

### removeIssuer

```solidity
function removeIssuer(address _issuer) external nonpayable returns (bool success_)
```

Removes an address from the trusted issuer list.

_Requires `ROLE_SSI_MANAGER` and the token to be unpaused. Reverts with `UnlistedIssuer` if the address is not listed. Emits `RemovedFromIssuerList`._

#### Parameters

| Name     | Type    | Description                      |
| -------- | ------- | -------------------------------- |
| \_issuer | address | Address of the issuer to remove. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the issuer was removed successfully. |

### setRevocationRegistryAddress

```solidity
function setRevocationRegistryAddress(address _revocationRegistryAddress) external nonpayable returns (bool success_)
```

Sets the address of the revocation registry contract used for SSI credential validation.

_Requires `ROLE_SSI_MANAGER` and the token to be unpaused. Emits `RevocationRegistryUpdated`._

#### Parameters

| Name                        | Type    | Description                               |
| --------------------------- | ------- | ----------------------------------------- |
| \_revocationRegistryAddress | address | New revocation registry contract address. |

#### Returns

| Name      | Type | Description                                   |
| --------- | ---- | --------------------------------------------- |
| success\_ | bool | True if the address was updated successfully. |

## Events

### AddedToIssuerList

```solidity
event AddedToIssuerList(address indexed operator, address indexed issuer)
```

Emitted when an issuer is added to the trusted issuer list.

#### Parameters

| Name               | Type    | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the addition. |
| issuer `indexed`   | address | Address of the issuer that was added.             |

### RemovedFromIssuerList

```solidity
event RemovedFromIssuerList(address indexed operator, address indexed issuer)
```

Emitted when an issuer is removed from the trusted issuer list.

#### Parameters

| Name               | Type    | Description                                      |
| ------------------ | ------- | ------------------------------------------------ |
| operator `indexed` | address | Address of the caller who performed the removal. |
| issuer `indexed`   | address | Address of the issuer that was removed.          |

### RevocationRegistryUpdated

```solidity
event RevocationRegistryUpdated(address indexed oldRegistryAddress, address indexed newRegistryAddress)
```

Emitted when the revocation registry address is updated.

#### Parameters

| Name                         | Type    | Description                                    |
| ---------------------------- | ------- | ---------------------------------------------- |
| oldRegistryAddress `indexed` | address | Previous revocation registry contract address. |
| newRegistryAddress `indexed` | address | New revocation registry contract address.      |

### SsiManagementInitialized

```solidity
event SsiManagementInitialized()
```

Emitted once when the SSI management capability is initialised on a token.

_Fires exclusively from `initializeSsiManagement`._

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

### AccountIsNotIssuer

```solidity
error AccountIsNotIssuer(address issuer)
```

Thrown when an address is required to be a listed issuer but is not.

#### Parameters

| Name   | Type    | Description                                          |
| ------ | ------- | ---------------------------------------------------- |
| issuer | address | The address that failed the issuer membership check. |

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

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### ListedIssuer

```solidity
error ListedIssuer(address issuer)
```

Thrown when attempting to add an address already present in the issuer list.

#### Parameters

| Name   | Type    | Description                   |
| ------ | ------- | ----------------------------- |
| issuer | address | The duplicate issuer address. |

### UnlistedIssuer

```solidity
error UnlistedIssuer(address issuer)
```

Thrown when attempting to remove an address not present in the issuer list.

#### Parameters

| Name   | Type    | Description                  |
| ------ | ------- | ---------------------------- |
| issuer | address | The unlisted issuer address. |

### UnrecognizedResolverProxyVersion

```solidity
error UnrecognizedResolverProxyVersion(bytes8 _resolverProxyVersion)
```

Thrown when the provided proxy version does not match any BLR compatible standard.

#### Parameters

| Name                   | Type   | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| \_resolverProxyVersion | bytes8 | proxy version that is not compatible with the BLR. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
