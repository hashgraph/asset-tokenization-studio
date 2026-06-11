# ResolverProxy

_Asset Tokenization Studio Team_

> ResolverProxy

Concrete EIP-2535 diamond proxy that routes every call to the facet address resolved by the Business Logic Resolver for the proxy&#39;s registered configuration and version.

_Inherits `ResolverProxyUnstructured` for ERC-7201 storage and initialisation helpers. Both `receive` and `fallback` are payable to support native-token transfers and arbitrary delegatecall dispatching respectively._

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
