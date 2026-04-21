// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Management } from "./IERC3643Management.sol";
import { ERC3643Management } from "./ERC3643Management.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC3643_MANAGEMENT_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract ERC3643ManagementFacet is ERC3643Management, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_MANAGEMENT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](7);
        uint256 selectorIndex = staticFunctionSelectors_.length;
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.recoveryAddress.selector;
            staticFunctionSelectors_[--selectorIndex] = this.removeAgent.selector;
            staticFunctionSelectors_[--selectorIndex] = this.addAgent.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setCompliance.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setIdentityRegistry.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setOnchainID.selector;
            staticFunctionSelectors_[--selectorIndex] = this.initialize_ERC3643.selector;
        }
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC3643Management).interfaceId;
    }
}
