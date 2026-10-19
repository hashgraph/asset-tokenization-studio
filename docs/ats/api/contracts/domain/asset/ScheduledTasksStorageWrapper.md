# ScheduledTasksStorageWrapper

_Asset Tokenization Studio Team_

> Scheduled Tasks Storage Wrapper

Manages storage, execution and queries for time-based scheduled task queues.

_Uses dedicated unstructured storage slots per task type and delegates task execution through `ScheduledTasksDispatchOps` to isolate failures. Queues are expected to be ordered so that the next executable task is located at the top index._
