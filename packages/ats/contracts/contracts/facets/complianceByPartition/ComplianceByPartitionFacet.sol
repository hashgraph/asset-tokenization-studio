// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IComplianceByPartition, RESOLVER_KEY_COMPLIANCE_BY_PARTITION } from "./IComplianceByPartition.sol";
import { ComplianceByPartition } from "./ComplianceByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title ComplianceByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes partition-aware transfer-eligibility and redemption checks
 *         via `IComplianceByPartition`, registered under `RESOLVER_KEY_COMPLIANCE_BY_PARTITION`.
 * @dev Exposes 2 selectors: `canTransferByPartition`, `canRedeemByPartition`.
 */
contract ComplianceByPartitionFacet is ComplianceByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_COMPLIANCE_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.canTransferByPartition.selector, this.canRedeemByPartition.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IComplianceByPartition).interfaceId);
    }
}
