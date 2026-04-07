// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "./IClearingTypes.sol";
import { IClearingActions } from "./IClearingActions.sol";
import { IClearingHoldCreation } from "./IClearingHoldCreation.sol";
import { IClearingRead } from "./IClearingRead.sol";
import { IClearingRedeem } from "./IClearingRedeem.sol";
import { IClearingTransfer } from "./IClearingTransfer.sol";

/// @title IClearing — off-chain umbrella for the Clearing domain
/// @notice Aggregates IClearingActions + IClearingHoldCreation + IClearingRead + IClearingRedeem +
///         IClearingTransfer into a single TypeChain-friendly handle for tests and SDK consumers.
/// @dev DO NOT inherit this interface from any facet contract or any abstract base used by a facet.
///      Each facet's abstract base must `is` exactly its per-facet interface (`IClearingActions`,
///      `IClearingHoldCreation`, etc.). This umbrella contains no function declarations of its own.
interface IClearing is
    IClearingTypes,
    IClearingActions,
    IClearingHoldCreation,
    IClearingRead,
    IClearingRedeem,
    IClearingTransfer
{}
