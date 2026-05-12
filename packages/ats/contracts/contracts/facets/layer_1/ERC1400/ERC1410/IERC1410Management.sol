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
    // Initialization function
    function initializeERC1410(bool _multiPartition) external;

    /**
     * @notice Marks the ERC1410Management facet as ready following a Diamond upgrade.
     * @dev Called during upgrade re-initialisation. No storage migration is performed;
     *      existing state carries over unchanged. Reverts if the facet was not previously
     *      registered at one of the accepted config versions, or is already marked ready at
     *      the current config version.
     * @param fromVersions Accepted previous config versions for this upgrade path.
     */
    function reinitializeERC1410(uint256[] calldata fromVersions) external;
}
