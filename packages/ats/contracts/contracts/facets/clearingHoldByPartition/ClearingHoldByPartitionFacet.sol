// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingHoldByPartition } from "./IClearingHoldByPartition.sol";
import { ClearingHoldByPartition } from "./ClearingHoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CLEARING_HOLDBYPARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ClearingHoldByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Facet exposing the unprotected clearing hold creation operations by partition.
 * @dev Registers `clearingCreateHoldByPartition`, `clearingCreateHoldFromByPartition`, and
 *      `getClearingCreateHoldForByPartition` into the diamond. The protected variant
 *      (`protectedClearingCreateHoldByPartition`) is handled by `ClearingHoldCreationFacet`.
 */
contract ClearingHoldByPartitionFacet is ClearingHoldByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_HOLDBYPARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 3;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.clearingCreateHoldByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.clearingCreateHoldFromByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getClearingCreateHoldForByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IClearingHoldByPartition).interfaceId;
        }
    }
}
