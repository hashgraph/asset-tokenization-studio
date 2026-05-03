// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IComplianceByPartition } from "./IComplianceByPartition.sol";
import { ComplianceByPartition } from "./ComplianceByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _COMPLIANCE_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ComplianceByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes partition-aware transfer-eligibility and redemption checks
 *         via `IComplianceByPartition`, registered under `_COMPLIANCE_BY_PARTITION_RESOLVER_KEY`.
 * @dev Consolidates `canTransferByPartition` and `canRedeemByPartition` previously hosted in
 *      `ERC1410ReadFacet`. Exposes 2 selectors: `canTransferByPartition`, `canRedeemByPartition`.
 */
contract ComplianceByPartitionFacet is ComplianceByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COMPLIANCE_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.canRedeemByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.canTransferByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IComplianceByPartition).interfaceId;
        }
    }
}
