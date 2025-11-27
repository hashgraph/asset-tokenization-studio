// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_READ_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { IERC3643Read } from "../interfaces/ERC3643/IERC3643Read.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { ERC3643Read } from "./ERC3643Read.sol";

contract ERC3643ReadFacet is IStaticFunctionSelectors, ERC3643Read {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_READ_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](6);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.isAgent.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.identityRegistry.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.onchainID.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.compliance.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.isAddressRecovered.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.version.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC3643Read).interfaceId;
    }
}
