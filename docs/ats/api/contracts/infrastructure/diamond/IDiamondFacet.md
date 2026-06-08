# IDiamondFacet

> IDiamondFacet

Interface for the Diamond facet initialisation function.

_Separated from IDiamond (EIP-2535 standard) so the standard interface remains unmodified._

## Methods

### initializeDiamondCut

```solidity
function initializeDiamondCut() external nonpayable
```

Initialises the diamond facet and registers it in the initialiser registry.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### DiamondCutInitialized

```solidity
event DiamondCutInitialized()
```

Emitted once when the diamond facet is initialised.

_Fires exclusively from `initializeDiamondCut`._
