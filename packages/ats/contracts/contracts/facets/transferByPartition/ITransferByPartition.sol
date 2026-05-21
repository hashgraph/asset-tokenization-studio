// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "../layer_1/ERC1400/ERC1410/IERC1410Types.sol";

/// @title ITransferByPartition
/// @author Asset Tokenization Studio Team
/// @notice Interface for the TransferByPartition facet, exposing token-holder-initiated
///         partition transfers.
interface ITransferByPartition is IERC1410Types {
    /**
     * @notice Emitted once when the transfer-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeTransferByPartition`.
     */
    event TransferByPartitionInitialized();

    /**
     * @notice Initialises the transfer-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeTransferByPartition() external;

    /// @notice Transfers the ownership of tokens from a specified partition to another address.
    /// @dev Caller must be the token holder. Reverts in multi-partition mode unless the
    ///      partition is the default, and reverts when the partition is protected and the
    ///      caller lacks the required role.
    /// @param _partition The partition from which to transfer tokens.
    /// @param _basicTransferInfo Destination address and token amount.
    /// @param _data Additional data attached to the transfer.
    /// @return The partition to which the transferred tokens were allocated for the recipient.
    function transferByPartition(
        bytes32 _partition,
        BasicTransferInfo calldata _basicTransferInfo,
        bytes memory _data
    ) external returns (bytes32);
}
