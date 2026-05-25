---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: scheduled tasks now fire at their exact timestamp instead of one block late.

Previously, `ScheduledTasksCommon::_triggerScheduledTasks` used a strict less-than comparison (`currentScheduledTask.scheduledTimestamp < _timestamp`), meaning a task scheduled for timestamp `T` would only fire when `block.timestamp > T`, not at `T` itself. For time-sensitive financial operations such as bond coupon payments this introduced a systematic one-block delay.

The fix changes the comparison to less-than-or-equal (`<=`) so tasks fire as soon as the block timestamp reaches their scheduled timestamp.
