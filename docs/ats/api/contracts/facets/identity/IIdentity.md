# IIdentity

_Asset Tokenization Studio Team_

> IIdentity

Interface exposing identity-registry and onchainID accessors plus their authorised setters, as required by the ERC-3643 surface.

_Pairs the read-only getters (`identityRegistry`, `onchainID`) with their owner-gated setters (`setIdentityRegistry`, `setOnchainID`). State-changing functions are expected to be restricted to `ROLE_TREX_OWNER` and to require the token to be unpaused; consumers should rely on the implementing facet for those guarantees._

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

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

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
