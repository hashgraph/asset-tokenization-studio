// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICapByPartition } from "./ICapByPartition.sol";
import { CapByPartition } from "./CapByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CAP_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CapByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the per-partition maximum supply cap surface through the
 *         `ICapByPartition` interface, registered under `_CAP_BY_PARTITION_RESOLVER_KEY`.
 * @dev Inherits behaviour from `CapByPartition` and satisfies `IStaticFunctionSelectors` for
 *      Diamond proxy selector registration. Exposes two selectors:
 *      `setMaxSupplyByPartition`, `getMaxSupplyByPartition`.
 */
contract CapByPartitionFacet is CapByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CAP_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getMaxSupplyByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setMaxSupplyByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(ICapByPartition).interfaceId;
        }
    }
}
