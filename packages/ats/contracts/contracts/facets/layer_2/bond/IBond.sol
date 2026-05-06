// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondTypes } from "./IBondTypes.sol";
import { IBondManagement } from "./IBondManagement.sol";
import { IBondRead } from "./IBondRead.sol";
import { IPrincipal } from "../../principal/IPrincipal.sol";

/// @title IBond — off-chain umbrella for the Bond domain
/// @notice Aggregates IBondManagement + IBondRead + IPrincipal into a single TypeChain-friendly
///         handle for tests and SDK consumers.
/// @dev DO NOT inherit this interface from any facet contract. Each facet must `is` exactly
///      its per-facet interface (`IBondManagement`, `IBondRead`, or `IPrincipal`). This umbrella
///      contains no function declarations of its own.
interface IBond is IBondTypes, IBondManagement, IBondRead, IPrincipal {}
