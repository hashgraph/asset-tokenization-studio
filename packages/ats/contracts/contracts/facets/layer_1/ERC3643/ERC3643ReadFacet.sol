// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Read } from "./IERC3643Read.sol";
import { ERC3643Read } from "./ERC3643Read.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC3643_READ_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract ERC3643ReadFacet is ERC3643Read, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_READ_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 4;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.isAddressRecovered.selector;
            staticFunctionSelectors_[--selectorIndex] = this.onchainID.selector;
            staticFunctionSelectors_[--selectorIndex] = this.identityRegistry.selector;
            staticFunctionSelectors_[--selectorIndex] = this.isAgent.selector;
        }
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC3643Read).interfaceId;
    }
}
