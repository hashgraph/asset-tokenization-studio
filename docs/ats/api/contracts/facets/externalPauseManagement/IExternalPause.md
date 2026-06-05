# IExternalPause

> IExternalPause

Minimal interface for querying an external pause contract.

_Implemented by third-party pause controllers whose address is registered on the token. The token calls `isPaused` to check whether operations should be suspended before executing any state-changing function._

## Methods

### isPaused

```solidity
function isPaused() external view returns (bool)
```

Returns whether the external pause controller currently signals a paused state.

#### Returns

| Name | Type | Description                                                           |
| ---- | ---- | --------------------------------------------------------------------- |
| \_0  | bool | `true` if the token should treat itself as paused; `false` otherwise. |
