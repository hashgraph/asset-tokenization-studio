# Checkpoints

_Asset Tokenization Studio Team_

> Checkpoints

Utility library for binary-search lookups over a sorted checkpoint array.

_Each checkpoint records a (timepoint, value) pair. `checkpointsLookup` finds the latest entry whose `from` field does not exceed the queried timepoint, using a hybrid square-root + binary-search strategy for gas efficiency on long arrays._
