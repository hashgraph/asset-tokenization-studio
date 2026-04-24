// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "./IHoldTypes.sol";
import { IHoldManagement } from "./IHoldManagement.sol";

/// @title IHold — off-chain umbrella for the Hold Management domain
/// @notice Aggregates IHoldManagement into a TypeChain-friendly handle for tests and SDK consumers.
/// @dev DO NOT inherit this interface from any facet contract. Each facet must `is` exactly its
///      per-facet interface. This umbrella contains no function declarations of its own.
interface IHold is IHoldTypes, IHoldManagement {}
