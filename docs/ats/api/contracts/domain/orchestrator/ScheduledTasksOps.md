# ScheduledTasksOps

_Asset Tokenization Studio Team_

> ScheduledTasksOps - Orchestrator for scheduled-task triggering

Deployed once as a separate contract. Facets and storage wrappers call via DELEGATECALL, keeping their bytecode out of the 24 KB EIP-170 limit. The body of `ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks` (a fat loop) is inlined here exactly once.

_Replaces the legacy `ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks` self-CALL helper. The selector-based self-CALL added one diamond fallback dispatch per invocation (~2700 gas); DELEGATECALL via the orchestrator address is ~700 gas and bypasses the dispatch while preserving `msg.sender`._

## Errors

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### UnexpectedError

```solidity
error UnexpectedError(bytes4 _errorId)
```

Reverts when an unreachable validation state is detected.

_Replaces assertions for defensive handling of logically impossible states._

#### Parameters

| Name      | Type   | Description                                        |
| --------- | ------ | -------------------------------------------------- |
| \_errorId | bytes4 | Identifier of the unexpected validation condition. |
