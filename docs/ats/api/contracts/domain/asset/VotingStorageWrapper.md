# VotingStorageWrapper

_Asset Tokenization Studio Team_

> VotingStorageWrapper

Library providing internal functions to manage voting rights corporate actions, including creation, cancellation, retrieval, and snapshot balance lookup.

_All functions are internal and designed to be called by facet contracts. Relies on CorporateActionsStorageWrapper, ScheduledTasksStorageWrapper, SnapshotsStorageWrapper, and TimeTravelStorageWrapper for storage and scheduling. Emits events from the IVoting interface. Reverts with IVoting errors on invalid operations._
