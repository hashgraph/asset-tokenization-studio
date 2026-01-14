// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { ISsiManagement } from "../interfaces/ssi/ISsiManagement.sol";
import { SsiManagement } from "./SsiManagement.sol";

abstract contract SsiManagementFacetBase is SsiManagement, IStaticFunctionSelectors {
    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
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

    function getStaticInterfaceIds() external pure virtual override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ISsiManagement).interfaceId;
    }
}
