// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "./IStaticFunctionSelectors.sol";
import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";

interface IDiamondCut is IStaticFunctionSelectors {
    /**
     * @notice For the current BLR and configuration, update the used version
     */
    function updateConfigVersion(uint256 _newVersion) external;

    /**
     * @notice For the current BLR update its configuration
     **/
    function updateConfig(bytes32 _newConfigurationId, uint256 _newVersion) external;

    /**
     * @notice Updates the BLR to a new one
     */
    function updateResolver(
        IBusinessLogicResolver _newResolver,
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external;

    /**
     * @notice Returns the configuration used by the secuirity
     */
    function getConfigInfo() external view returns (address resolver_, bytes32 configurationId_, uint256 version_);
}
