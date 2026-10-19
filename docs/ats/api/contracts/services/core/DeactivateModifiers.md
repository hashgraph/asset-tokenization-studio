# DeactivateModifiers

_Asset Tokenization Studio Team_

> DeactivateModifiers

Reusable modifier mix-in that gates state-mutating flows on the token&#39;s activation status, blocking any operation once the token has been irreversibly deactivated.

_Inherited by facets and services that must reject calls after deactivation. Delegates the check to `DeactivateStorageWrapper.requireActivated`, which reads the diamond storage flag and reverts with `IDeactivate.Deactivated`. Marked `abstract` because it carries no standalone behaviour — it exists solely to be inherited._
