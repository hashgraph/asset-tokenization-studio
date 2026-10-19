# DeactivateStorageWrapper

_Asset Tokenization Studio Team_

> DeactivateStorageWrapper

Library providing read, write, and guard operations for the token deactivation flag using the ERC-2535 Diamond Storage Pattern.

_Resolves the storage struct from `STORAGE_LOCATION_DEACTIVATE` via inline assembly. State writes are intentionally one-way — there is no reactivation primitive. Use `DeactivateModifiers.onlyActivated` for guards instead of calling `requireActivated` directly, except where a modifier cannot be applied._
