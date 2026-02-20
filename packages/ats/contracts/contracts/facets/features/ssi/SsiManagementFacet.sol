// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SsiManagement } from "./SsiManagement.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { ISsiManagement } from "../interfaces/ISsiManagement.sol";
import { _SSI_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract SsiManagementFacet is SsiManagement, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SSI_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.setRevocationRegistryAddress.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addIssuer.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeIssuer.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isIssuer.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRevocationRegistryAddress.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getIssuerListCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getIssuerListMembers.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ISsiManagement).interfaceId;
    }
}
