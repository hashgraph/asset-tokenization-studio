# LowLevelCall

_Asset Tokenization Studio Team_

> LowLevelCall

Utility library for safe low-level calls with structured error forwarding.

_Wraps `call` and `staticcall` with zero-address short-circuits and a custom error-selector revert path, avoiding bare `revert(0, 0)` on failure._
