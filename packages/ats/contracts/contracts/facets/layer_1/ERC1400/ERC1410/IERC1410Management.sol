// SPDX-License-Identifier: Apache-2.0

pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "./IERC1410Types.sol";

/// @custom:hash resolverKey Erc1410Management
bytes32 constant RESOLVER_KEY_ERC1410_MANAGEMENT = 0xb4096d676324d7f4d32415a0a0810544a5dc12d6559dee91fb3c4b77cdde3392;

/**
 * @title IERC1410Management
 * @dev Interface for the ERC1410Management contract. After the operator and protected
 *      partition splits, only initialisation remains here. Operator-by-partition
 *      operations live on `IOperatorByPartition`; protected-by-partition operations
 *      live on `IProtectedByPartition`.
 */
interface IERC1410Management is IERC1410Types {
    /**
     * @notice Emitted once when the ERC-1410 partition management is initialised on a token.
     * @dev Fires exclusively from `initializeERC1410` after the storage write succeeds.
     */
    event ERC1410Initialized(bool multiPartition);

    /// @notice One-time initialiser for ERC-1410 partition management.
    function initializeERC1410(bool _multiPartition) external;
}
