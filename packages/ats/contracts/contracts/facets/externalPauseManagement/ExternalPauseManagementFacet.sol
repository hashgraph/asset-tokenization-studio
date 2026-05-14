// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalPauseManagement } from "./IExternalPauseManagement.sol";
import { ExternalPauseManagement } from "./ExternalPauseManagement.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _EXTERNAL_PAUSE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ExternalPauseManagementFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes external pause management operations — initialisation, batch
 *         updates, individual add/remove, membership checks, and pagination — as selectable proxy
 *         functions.
 * @dev Inherits `ExternalPauseManagement` for the business logic and implements
 *      `IStaticFunctionSelectors` for the Diamond resolver pattern. The resolver key
 *      `_EXTERNAL_PAUSE_RESOLVER_KEY` identifies this facet within the diamond proxy.
 */
contract ExternalPauseManagementFacet is ExternalPauseManagement, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_PAUSE_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeExternalPauses.selector,
                this.updateExternalPauses.selector,
                this.addExternalPause.selector,
                this.removeExternalPause.selector,
                this.isExternalPause.selector,
                this.getExternalPausesCount.selector,
                this.getExternalPausesMembers.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IExternalPauseManagement).interfaceId);
    }
}
