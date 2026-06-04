---
"@hashgraph/asset-tokenization-sdk": minor
---

Added `deactivate` command and `isDeactivated` query to the SDK.

The `deactivate` command triggers the irreversible deactivation of a security token, requiring the caller to hold `DEACTIVATE_ROLE` and the token to be unpaused. The `isDeactivated` query reads the current deactivation state of a security. Both operations are exposed through the `Security` port via the new `SecurityInPortDeactivation` mixin.
