# IResolverProxy

_Asset Tokenization Studio Team_

> IResolverProxy

Interface for the Diamond resolver proxy, defining the RBAC configuration structure and the error thrown when an unknown function selector is called.

## Errors

### FunctionNotFound

```solidity
error FunctionNotFound(bytes4 _functionSelector)
```

Thrown when no function exists for function called.

#### Parameters

| Name               | Type   | Description                                                   |
| ------------------ | ------ | ------------------------------------------------------------- |
| \_functionSelector | bytes4 | The four-byte selector that could not be resolved to a facet. |

### UnrecognizedResolverProxyConfigurationVersion

```solidity
error UnrecognizedResolverProxyConfigurationVersion(uint256 _resolverProxyConfigurationVersion)
```

Thrown when the stored configuration carries an unrecognized version tag

#### Parameters

| Name                                | Type    | Description |
| ----------------------------------- | ------- | ----------- |
| \_resolverProxyConfigurationVersion | uint256 | undefined   |
