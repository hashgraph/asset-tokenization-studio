// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedByPartition, RESOLVER_KEY_PROTECTED_BY_PARTITION } from "./IProtectedByPartition.sol";
import { ProtectedByPartition } from "./ProtectedByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title ProtectedByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that registers the protected partition-scoped transfer and
 *         redemption selectors under `RESOLVER_KEY_PROTECTED_BY_PARTITION` on the
 *         Diamond proxy.
 * @dev Composed via `ProtectedByPartition` for behaviour and `IStaticFunctionSelectors`
 *      for selector advertisement. Exposes two external selectors:
 *      - `protectedTransferFromByPartition`
 *      - `protectedRedeemFromByPartition`
 */
contract ProtectedByPartitionFacet is ProtectedByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_PROTECTED_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeProtectedByPartition.selector,
                this.protectedTransferFromByPartition.selector,
                this.protectedRedeemFromByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IProtectedByPartition).interfaceId);
    }
}
