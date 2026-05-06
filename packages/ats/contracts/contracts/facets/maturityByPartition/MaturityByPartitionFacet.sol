// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturityByPartition } from "./IMaturityByPartition.sol";
import { MaturityByPartition } from "./MaturityByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _MATURITY_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title MaturityByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes single-partition bond maturity redemption through
 *         the `IMaturityByPartition` interface, registered under
 *         `_MATURITY_BY_PARTITION_RESOLVER_KEY`.
 * @dev Inherits redemption logic from `MaturityByPartition` and satisfies
 *      `IStaticFunctionSelectors` for Diamond proxy selector registration. Exposes one
 *      selector: `redeemAtMaturityByPartition` (0x8a647211).
 */
contract MaturityByPartitionFacet is MaturityByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _MATURITY_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.redeemAtMaturityByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IMaturityByPartition).interfaceId;
        }
    }
}
