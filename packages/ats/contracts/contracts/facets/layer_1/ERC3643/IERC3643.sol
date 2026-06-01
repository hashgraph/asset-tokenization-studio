// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "./IERC3643Types.sol";

/**
 * @title IERC3643
 * @notice Canonical ERC-3643 (T-REX) standard interface; surfaces the shared ERC-3643 types,
 *         events and errors via `IERC3643Types`.
 * @dev Declares no functions by design: the ERC-3643 function surface lives on the
 *      per-capability facet interfaces (`IComplianceFacet`, `IIdentity`, `IFreeze`,
 *      `IERC3643Read`, ...). This named member is what `IAsset` inherits — and SDK/test
 *      tooling references — for the standard's events and errors, keeping `IAsset`'s
 *      inheritance list uniformly facet-interface-typed rather than inheriting a raw
 *      `*Types` interface. Concrete facets must NOT inherit it; each `is` only its own
 *      `IERC3643<Facet>` interface.
 */
// solhint-disable no-empty-blocks
interface IERC3643 is IERC3643Types {}
