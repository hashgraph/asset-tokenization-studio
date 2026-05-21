// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturityByPartition } from "./IMaturityByPartition.sol";
import { MaturityByPartition } from "./MaturityByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
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
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(this.initializeMaturityByPartition.selector, this.redeemAtMaturityByPartition.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IMaturityByPartition).interfaceId);
    }
}
