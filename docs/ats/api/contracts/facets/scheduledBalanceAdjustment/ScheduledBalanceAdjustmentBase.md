# ScheduledBalanceAdjustmentBase

_Asset Tokenization Studio Team_

> ScheduledBalanceAdjustmentBase

Pure business logic for the scheduled balance-adjustment lifecycle, shared by `ScheduledBalanceAdjustment` and its concrete facet.

_Coordinates `CorporateActionsStorageWrapper` and `ScheduledTasksStorageWrapper` without owning any storage slot of its own. Intended to be inherited by concrete facet contracts — not deployed standalone._
