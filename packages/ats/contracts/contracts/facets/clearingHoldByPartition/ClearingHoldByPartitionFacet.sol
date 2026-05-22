// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingHoldByPartition, RESOLVER_KEY_CLEARING_HOLDBYPARTITION } from "./IClearingHoldByPartition.sol";
import { ClearingHoldByPartition } from "./ClearingHoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title ClearingHoldByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Facet exposing the unprotected clearing hold creation operations by partition.
 * @dev Registers `clearingCreateHoldByPartition`, `clearingCreateHoldFromByPartition`, and
 *      `getClearingCreateHoldForByPartition` into the diamond. The protected variant
 *      (`protectedClearingCreateHoldByPartition`) is handled by `ProtectedClearingHoldByPartitionFacet`.
 */
contract ClearingHoldByPartitionFacet is ClearingHoldByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_CLEARING_HOLDBYPARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.getClearingCreateHoldForByPartition.selector,
                this.clearingCreateHoldFromByPartition.selector,
                this.clearingCreateHoldByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IClearingHoldByPartition).interfaceId);
    }
}
