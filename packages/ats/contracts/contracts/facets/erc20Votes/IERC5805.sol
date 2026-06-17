// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC6372 } from "@openzeppelin/contracts/interfaces/IERC6372.sol";
import { IVotes } from "./IVotes.sol";

/// @title IERC5805
/// @author Asset Tokenization Studio Team
/// @notice Combination interface that satisfies both ERC-6372 (clock mode for governance) and
///         ERC-Votes (delegation and voting-power tracking), as required by ERC-5805.
interface IERC5805 is IERC6372, IVotes {}
