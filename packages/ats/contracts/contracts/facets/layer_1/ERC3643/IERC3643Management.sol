// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "./IERC3643Types.sol";

interface IERC3643Management is IERC3643Types {
    /**
     * @dev Facet initializer
     *
     * Sets the compliance contract address
     */
    function initializeERC3643(address _compliance, address _identityRegistry) external;

    /**
     * @notice Marks the ERC3643Management facet as ready following a Diamond upgrade.
     * @dev Called during upgrade re-initialisation. No storage migration is performed;
     *      existing state carries over unchanged. Reverts if the facet was not previously
     *      registered at one of the accepted config versions, or is already marked ready at
     *      the current config version.
     * @param fromVersions Accepted previous config versions for this upgrade path.
     */
    function reinitializeERC3643(uint256[] calldata fromVersions) external;
}
