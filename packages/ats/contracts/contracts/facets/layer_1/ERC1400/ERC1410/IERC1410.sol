// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "./IERC1410Types.sol";
import { IERC1410Management } from "./IERC1410Management.sol";
import { IERC1410TokenHolder } from "./IERC1410TokenHolder.sol";

/**
 * @title IERC1410
 * @author Asset Tokenization Studio Team
 * @notice Façade interface bundling the ERC-1410 management and token-holder surfaces consumed
 *         by callers that need to interact with both facets through a single contract handle.
 * @dev Aggregates `IERC1410Management` and `IERC1410TokenHolder` (plus the shared `IERC1410Types`
 *      definitions) so external callers — `Factory`, `LoansPortfolioStorageWrapper`, and the
 *      `IAsset` umbrella — can address an ERC-1410 token without juggling per-facet imports.
 *      Read-only partition discovery (`partitionsOf`, `isMultiPartition`) lives in `IPartitions`
 *      and is intentionally excluded; the operator surface lives in `IOperator` /
 *      `IOperatorByPartition`.
 *      DO NOT inherit this interface from a facet contract: forcing a single facet to implement
 *      every aggregated selector breaks the diamond's per-facet selector ownership.
 */
// solhint-disable no-empty-blocks
interface IERC1410 is IERC1410Types, IERC1410Management, IERC1410TokenHolder {}
