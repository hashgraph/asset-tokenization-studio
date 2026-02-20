// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IERC3643Operations } from "./IERC3643Operations.sol";
import { IERC3643Management } from "./IERC3643Management.sol";
import { IERC3643Read } from "./IERC3643Read.sol";
import { IERC3643Batch } from "./IERC3643Batch.sol";

/**
 * @title IERC3643
 * @dev Unified interface for ERC3643 functionality combining all facets.
 * This interface provides external access to all ERC3643 functions through the Diamond pattern,
 * enabling interaction with all ERC3643 functions from external calls, tests, and SDK.
 * This interface is NOT meant to be inherited by any contract - it's only for external interaction.
 */
interface IERC3643 is IERC3643Operations, IERC3643Management, IERC3643Read, IERC3643Batch {
    /**
     *  @notice This event is emitted when the Compliance has been set for the token
     */
    event ComplianceAdded(address indexed compliance);

    /*
     *   @notice Thrown when unfreezing more than what is frozen
     */
    error InsufficientFrozenBalance(
        address user,
        uint256 requestedUnfreeze,
        uint256 availableFrozen,
        bytes32 partition
    );
}
