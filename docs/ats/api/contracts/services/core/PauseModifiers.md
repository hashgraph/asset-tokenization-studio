# PauseModifiers

_Asset Tokenization Studio Team_

> PauseModifiers

Abstract contract providing pause-state precondition modifiers for security-token facets.

_Each modifier delegates to a `check_`helper in`PauseStorageWrapper` and reverts on      violation. The combined pause state covers both the internal flag      (`PauseDataStorage.paused`) and any registered external `IExternalPause`contracts.     `onlyNotInternallyPaused` deliberately ignores external contracts so that a permanently paused external contract cannot deadlock management operations that remove it from the registry.\*
