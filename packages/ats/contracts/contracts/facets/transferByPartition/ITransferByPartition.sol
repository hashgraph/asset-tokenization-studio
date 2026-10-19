// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "../commonTypes/IERC1410Types.sol";

/// @custom:hash resolverKey TransferByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_TRANSFER_BY_PARTITION = 0xfb16c0ead8e476dfd6f2201a386b6a761b76e01aa6e21786c2d90f10036197d9;

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
        bytes calldata _data
    ) external returns (bytes32);
}
