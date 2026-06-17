# ResolverProxy

_Asset Tokenization Studio Team_

> Resolver Proxy

Delegates calls to facet implementations resolved from a versioned resolver configuration.

_Initialises resolver-proxy storage at deployment and dispatches unknown selectors through `delegatecall`. Facet resolution depends on the configured business-logic resolver, configuration identifier and version. Calls to unregistered selectors revert with `FunctionNotFound`._

## Errors

### FunctionNotFound

```solidity
error FunctionNotFound(bytes4 _functionSelector)
```

Thrown when no function exists for function called

#### Parameters

| Name               | Type   | Description |
| ------------------ | ------ | ----------- |
| \_functionSelector | bytes4 | undefined   |
