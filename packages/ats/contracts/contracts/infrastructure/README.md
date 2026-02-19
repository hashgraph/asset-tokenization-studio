# infrastructure/ — Diamond Pattern Core

Extractable as a standalone package. Zero domain imports.

- **diamond/** — BusinessLogicResolver + DiamondCutManager (facet registry)
- **proxy/** — ResolverProxy + DiamondCut/Loupe/Facet + LibResolverProxy
- **interfaces/** — Diamond interfaces (IBusinessLogicResolver, IDiamondLoupe, etc.)
- **lib/** — Generic Solidity utilities (pagination, data structures, low-level calls)
- **proxies/** — OpenZeppelin proxy import
