// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC6372 } from "@openzeppelin/contracts/interfaces/IERC6372.sol";
import { IVotes } from "./IVotes.sol";

/**
 * @title IERC5805
 * @notice Combined interface for ERC-5805 (Voting with Clock) that merges ERC-6372 clock
 *         support with the standard IVotes delegation and query surface.
 * @dev This is an empty bridge interface. Implementations must satisfy both `IERC6372`
 *      (clock and clock mode) and `IVotes` (delegation, vote queries).
 * @author io.builders
 */
// solhint-disable no-empty-blocks
interface IERC5805 is IERC6372, IVotes {}
