// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { IERC1410Management } from "../../interfaces/ERC1400/IERC1410Management.sol";
import { ERC1410Management } from "./ERC1410Management.sol";

/**
 * @title ERC1410ManagementFacetBase
 * @notice Base facet implementing privileged ERC1410 operations including controller transfers, operator actions,
 *         and partition management
 * @dev This facet provides administrative functions for ERC1410 token management that require elevated permissions.
 * Only users with appropriate roles (controller, operator, or other privileged roles) can execute these functions.
 * Implements the diamond pattern for modular smart contract architecture.
 *
 * Key functionalities:
 * - Token initialization for ERC1410 compliance
 * - Controller-based transfers and redemptions by partition
 * - Operator-managed partition operations
 * - Protected partition transfers with enhanced security
 * - Partition-based token issuance
 *
 */
abstract contract ERC1410ManagementFacetBase is IStaticFunctionSelectors, ERC1410Management {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](7);
        uint256 selectorIndex = 0;
        // Initialization function
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ERC1410.selector;
        // Controller functions
        staticFunctionSelectors_[selectorIndex++] = this.controllerTransferByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.controllerRedeemByPartition.selector;
        // Operator functions
        staticFunctionSelectors_[selectorIndex++] = this.operatorTransferByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.operatorRedeemByPartition.selector;
        // Protected functions
        staticFunctionSelectors_[selectorIndex++] = this.protectedTransferFromByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectedRedeemFromByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410Management).interfaceId;
    }
}
