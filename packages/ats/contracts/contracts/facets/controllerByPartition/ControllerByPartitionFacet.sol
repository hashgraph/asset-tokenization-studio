// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControllerByPartition } from "./IControllerByPartition.sol";
import { ControllerByPartition } from "./ControllerByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CONTROLLER_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ControllerByPartitionFacet
 * @notice Diamond facet that exposes controller-initiated forced transfer and redemption operations
 *         on a specific partition, registered under `_CONTROLLER_BY_PARTITION_RESOLVER_KEY`.
 * @dev Inherits behaviour from `ControllerByPartition` and satisfies `IStaticFunctionSelectors` for
 *      Diamond proxy selector registration. Exposes two selectors:
 *      `controllerTransferByPartition`, `controllerRedeemByPartition`.
 * @author Asset Tokenization Studio Team
 */
contract ControllerByPartitionFacet is ControllerByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CONTROLLER_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.controllerTransferByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.controllerRedeemByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IControllerByPartition).interfaceId;
        }
    }
}
