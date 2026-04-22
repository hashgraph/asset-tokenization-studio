// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IComplianceFacet } from "./IComplianceFacet.sol";
import { Compliance } from "./Compliance.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _COMPLIANCE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

contract ComplianceFacet is Compliance, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COMPLIANCE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 4;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.compliance.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setCompliance.selector;
            staticFunctionSelectors_[--selectorIndex] = this.canTransferFrom.selector;
            staticFunctionSelectors_[--selectorIndex] = this.canTransfer.selector;
        }
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IComplianceFacet).interfaceId;
    }
}
