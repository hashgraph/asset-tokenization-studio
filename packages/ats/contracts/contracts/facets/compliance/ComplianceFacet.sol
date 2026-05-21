// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IComplianceFacet } from "./IComplianceFacet.sol";
import { Compliance } from "./Compliance.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _COMPLIANCE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ComplianceFacet
 * @notice Diamond facet exposing transfer-eligibility checks and compliance contract management.
 * @dev Registers four selectors: canTransfer, canTransferFrom, setCompliance, and compliance.
 * Inherits business logic from the Compliance abstract contract.
 */
contract ComplianceFacet is Compliance, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COMPLIANCE_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeCompliance.selector,
                this.canTransfer.selector,
                this.canTransferFrom.selector,
                this.setCompliance.selector,
                this.compliance.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IComplianceFacet).interfaceId);
    }
}
