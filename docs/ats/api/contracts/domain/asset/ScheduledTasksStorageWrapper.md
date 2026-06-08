# ScheduledTasksStorageWrapper

_Asset Tokenization Studio Team_

> Scheduled Tasks Storage Wrapper

Manages storage, execution and queries for time-based scheduled task queues.

_Uses dedicated unstructured storage slots per task type and delegates task execution through `ScheduledTasksDispatchOps` to isolate failures. Queues are expected to be ordered so that the next executable task is located at the top index._

## Errors

### WrongTimestamp

```solidity
error WrongTimestamp(uint256 timeStamp)
```

Reverts when a scheduled timestamp is not strictly in the future.

_The current timestamp is read through `EvmAccessors`._

#### Parameters

| Name      | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| timeStamp | uint256 | Timestamp rejected for scheduling. |
