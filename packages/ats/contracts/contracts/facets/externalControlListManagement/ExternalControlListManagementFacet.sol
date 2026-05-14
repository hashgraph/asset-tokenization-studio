// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalControlListManagement } from "./IExternalControlListManagement.sol";
import { ExternalControlListManagement } from "./ExternalControlListManagement.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _EXTERNAL_CONTROL_LIST_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ExternalControlListManagementFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes external control list management operations —
 *         initialisation, batch updates, individual add/remove, membership checks, and pagination
 *         — as selectable proxy functions.
 * @dev Inherits `ExternalControlListManagement` for the business logic and implements
 *      `IStaticFunctionSelectors` for the Diamond resolver pattern. The resolver key
 *      `_EXTERNAL_CONTROL_LIST_RESOLVER_KEY` identifies this facet within the diamond proxy.
 */
contract ExternalControlListManagementFacet is ExternalControlListManagement, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_CONTROL_LIST_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeExternalControlLists.selector,
                this.updateExternalControlLists.selector,
                this.addExternalControlList.selector,
                this.removeExternalControlList.selector,
                this.isExternalControlList.selector,
                this.getExternalControlListsCount.selector,
                this.getExternalControlListsMembers.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IExternalControlListManagement).interfaceId);
    }
}
