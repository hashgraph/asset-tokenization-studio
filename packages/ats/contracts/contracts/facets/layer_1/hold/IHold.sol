// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "./IHoldTypes.sol";
import { IHoldManagement } from "./IHoldManagement.sol";
import { IHoldByPartition } from "../../holdByPartition/IHoldByPartition.sol";
import { IHoldFacet } from "../../hold/IHoldFacet.sol";

/// @title IHold — off-chain umbrella for the Hold domain
/// @notice Aggregates the per-facet Hold interfaces (IHoldFacet, IHoldManagement, IHoldByPartition)
///         into a single TypeChain-friendly handle for tests and SDK consumers.
/// @dev DO NOT inherit this interface from any facet contract. Each facet must `is` exactly its
///      per-facet interface (`IHoldFacet` / `IHoldManagement` / `IHoldByPartition`). This umbrella
///      contains no function declarations of its own — it is purely a composition. Future
///      deployments may omit one or more Hold facets; SDK code that uses this umbrella must
///      verify at runtime that the diamond exposes the function it intends to call.
interface IHold is IHoldTypes, IHoldFacet, IHoldManagement, IHoldByPartition {}
