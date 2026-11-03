# ScheduledTasksLib

_Asset Tokenization Studio Team_

> ScheduledTasksLib

Storage helper library maintaining a timestamp-ordered queue of scheduled tasks.

_Operates against any `ScheduledTasksDataStorage` namespace; the queue invariant is that entries are sorted by `scheduledTimestamp` ascending, so the oldest due task sits at index 0 and the newest tail entry lives at `scheduledTaskCount - 1`._
