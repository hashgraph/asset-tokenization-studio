// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_MANAGEMENT_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";
import { ERC3643Management } from "./ERC3643Management.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IERC3643Management } from "../interfaces/ERC3643/IERC3643Management.sol";

contract ERC3643ManagementFacet is ERC3643Management, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_MANAGEMENT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](9);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.initialize_ERC3643.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.setName.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.setSymbol.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.setOnchainID.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.setIdentityRegistry.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.setCompliance.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.addAgent.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.removeAgent.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.recoveryAddress.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC3643Management).interfaceId;
    }
}
