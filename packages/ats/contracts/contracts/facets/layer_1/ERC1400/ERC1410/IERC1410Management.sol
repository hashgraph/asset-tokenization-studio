// SPDX-License-Identifier: Apache-2.0

pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "./IERC1410Types.sol";

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
     * @dev Fires exclusively from `initialize_ERC1410` after the storage write succeeds.
     * @param operator The account that invoked initialisation (deployer or upgrade caller).
     */
    event ERC1410Initialized(address indexed operator);

    // Initialization function
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410(bool _multiPartition) external;
}
