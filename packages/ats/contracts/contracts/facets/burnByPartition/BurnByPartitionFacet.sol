// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBurnByPartition } from "./IBurnByPartition.sol";
import { BurnByPartition } from "./BurnByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _BURN_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BurnByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the ERC-1410 `redeemByPartition` operation, registered
 *         under `_BURN_BY_PARTITION_RESOLVER_KEY`.
 * @dev Inherits the redemption logic from `BurnByPartition` and satisfies the
 *      `IStaticFunctionSelectors` contract required by the Diamond proxy for static
 *      selector registration.
 *      Exposes one selector: `redeemByPartition`.
 *      No library links are required for deployment beyond TokenCoreOps.
 */
contract BurnByPartitionFacet is BurnByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BURN_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.redeemByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IBurnByPartition).interfaceId;
        }
    }
}
