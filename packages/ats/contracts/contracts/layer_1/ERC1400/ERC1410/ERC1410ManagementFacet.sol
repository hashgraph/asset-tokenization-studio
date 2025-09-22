// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _ERC1410_MANAGEMENT_RESOLVER_KEY
} from '../../../layer_1/constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {
    IERC1410Management
} from '../../interfaces/ERC1400/IERC1410Management.sol';
import {ERC1410Management} from './ERC1410Management.sol';

/**
 * @title ERC1410ManagementFacet
 * @notice Facet implementing privileged ERC1410 operations including controller transfers, operator actions,
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
contract ERC1410ManagementFacet is IStaticFunctionSelectors, ERC1410Management {
    function getStaticResolverKey()
        external
        pure
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ERC1410_MANAGEMENT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](8);
        uint256 selectorIndex = 0;
        // Initialization function
        staticFunctionSelectors_[selectorIndex++] = this
            .initialize_ERC1410
            .selector;
        // Controller functions
        staticFunctionSelectors_[selectorIndex++] = this
            .controllerTransferByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .controllerRedeemByPartition
            .selector;
        // Operator functions
        staticFunctionSelectors_[selectorIndex++] = this
            .operatorTransferByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .operatorRedeemByPartition
            .selector;
        // Protected functions
        staticFunctionSelectors_[selectorIndex++] = this
            .protectedTransferFromByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .protectedRedeemFromByPartition
            .selector;
        // Issue function
        staticFunctionSelectors_[selectorIndex++] = this
            .issueByPartition
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410Management).interfaceId;
    }
}
