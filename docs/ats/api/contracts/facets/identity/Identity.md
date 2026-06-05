# Identity

_Asset Tokenization Studio Team_

> Identity

Abstract implementation of `IIdentity`, exposing identity-registry and onchainID accessors and their authorised setters.

_Stateless wrapper that delegates the actual reads/writes to {ERC3643StorageWrapper}. Setters are gated by `onlyUnpaused` and `onlyRole(ROLE_TREX_OWNER)`. Intended to be inherited by `IdentityFacet`._

## Methods

### identityRegistry

```solidity
function identityRegistry() external view returns (contract IIdentityRegistry)
```

Returns the address of the identity registry contract.

#### Returns

| Name | Type                       | Description                                           |
| ---- | -------------------------- | ----------------------------------------------------- |
| \_0  | contract IIdentityRegistry | The current identity registry as `IIdentityRegistry`. |

### initializeIdentity

```solidity
function initializeIdentity(address _identityRegistry) external nonpayable
```

Initialises the identity capability on the token and wires the identity registry.

_Wires the identity-registry address, marks the identity facet as ready, and emits `IdentityInitialized`. One-shot is enforced by `onlyFacetNotRegistered`._

#### Parameters

| Name               | Type    | Description                                               |
| ------------------ | ------- | --------------------------------------------------------- |
| \_identityRegistry | address | Address of the identity registry that vets token holders. |

### onchainID

```solidity
function onchainID() external view returns (address)
```

Returns the onchainID address associated with the token.

#### Returns

| Name | Type    | Description                    |
| ---- | ------- | ------------------------------ |
| \_0  | address | The current onchainID address. |

### setIdentityRegistry

```solidity
function setIdentityRegistry(address _identityRegistry) external nonpayable
```

Sets the identity registry contract address.

_Restricted to `ROLE_TREX_OWNER` and only callable when the token is not paused. Emits an `IdentityRegistryAdded` event from the underlying storage wrapper._

#### Parameters

| Name               | Type    | Description                                 |
| ------------------ | ------- | ------------------------------------------- |
| \_identityRegistry | address | The new identity registry contract address. |

### setOnchainID

```solidity
function setOnchainID(address _onchainID) external nonpayable
```

Sets the onchainID of the token to `_onchainID`.

_Restricted to `ROLE_TREX_OWNER` and only callable when the token is not paused. Emits an `UpdatedTokenInformation` event from the underlying storage wrapper._

#### Parameters

| Name        | Type    | Description                                            |
| ----------- | ------- | ------------------------------------------------------ |
| \_onchainID | address | The new onchainID address to associate with the token. |

## Events

### IdentityInitialized

```solidity
event IdentityInitialized(address identityRegistry)
```

Emitted once when the identity capability is initialised on a token.

_Fires exclusively from `initializeIdentity`._

#### Parameters

| Name             | Type    | Description                                            |
| ---------------- | ------- | ------------------------------------------------------ |
| identityRegistry | address | The identity-registry address wired at initialisation. |

### IdentityRegistryAdded

```solidity
event IdentityRegistryAdded(address indexed identityRegistry)
```

#### Parameters

| Name                       | Type    | Description |
| -------------------------- | ------- | ----------- |
| identityRegistry `indexed` | address | undefined   |

### UpdatedTokenInformation

```solidity
event UpdatedTokenInformation(string indexed newName, string indexed newSymbol, uint8 newDecimals, string newVersion, address indexed newOnchainID)
```

#### Parameters

| Name                   | Type    | Description |
| ---------------------- | ------- | ----------- |
| newName `indexed`      | string  | undefined   |
| newSymbol `indexed`    | string  | undefined   |
| newDecimals            | uint8   | undefined   |
| newVersion             | string  | undefined   |
| newOnchainID `indexed` | address | undefined   |

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

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).
