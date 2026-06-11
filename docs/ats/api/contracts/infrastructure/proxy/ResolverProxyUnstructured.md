# ResolverProxyUnstructured

_Asset Tokenization Studio Team_

> ResolverProxyUnstructured

Abstract base for EIP-2535 diamond proxies that store their resolver, configuration id, and version in ERC-7201 unstructured storage slots rather than at fixed offsets.

_All resolver queries are forwarded to the `IBusinessLogicResolver` recorded in `ResolverProxyStorageWrapper`. Concrete proxies (`ResolverProxy`) and abstract facets (`DiamondCut`, `DiamondLoupe`) inherit this contract to share the same internal helpers._
