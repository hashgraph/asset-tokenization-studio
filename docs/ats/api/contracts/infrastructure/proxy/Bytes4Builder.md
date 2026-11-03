# Bytes4Builder

_Asset Tokenization Studio Team_

> Bytes4Builder

Library of overloaded `build` helpers that allocate and populate a `bytes4[]         memory` array of fixed length, intended for use by `IStaticFunctionSelectors` implementations when reporting selectors or interface ids to the resolver.

_Solidity does not allow `[a, b, c]` (a fixed-size `bytesN[N] memory` literal) to be implicitly returned as a dynamic `bytes4[] memory`; these `internal pure` overloads provide the missing one-liner construction without the descending `--selectorIndex` boilerplate that facets otherwise carry. The compiler inlines each call, so the only runtime cost is argument marshalling onto the stack. Overloads are provided for 1 through 12 elements. Facets needing larger arrays should fall back to the manual descending-loop form rather than padding this library with ever-wider overloads — the readability win flattens once N grows past the cap._
