// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedHoldByPartition, RESOLVER_KEY_PROTECTED_HOLD_BY_PARTITION } from "./IProtectedHoldByPartition.sol";
import { ProtectedHoldByPartition } from "./ProtectedHoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title ProtectedHoldByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that registers the `protectedCreateHoldByPartition` selector under
 *         `RESOLVER_KEY_PROTECTED_HOLD_BY_PARTITION` on the Diamond proxy.
 * @dev Composed via `ProtectedHoldByPartition` for behaviour and `IStaticFunctionSelectors` for
 *      selector advertisement. Exposes a single external selector.
 */
contract ProtectedHoldByPartitionFacet is ProtectedHoldByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_PROTECTED_HOLD_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeProtectedHoldByPartition.selector,
                this.protectedCreateHoldByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IProtectedHoldByPartition).interfaceId);
    }
}
