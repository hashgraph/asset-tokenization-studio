// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICorporateActions } from "./ICorporateActions.sol";
import { CorporateActions } from "./CorporateActions.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CORPORATE_ACTIONS_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract CorporateActionsFacet is CorporateActions, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CORPORATE_ACTIONS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateAction.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateActionCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateActionIds.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateActionCountByType.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateActionIdsByType.selector;
        staticFunctionSelectors_[selectorIndex++] = this.actionContentHashExists.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateActions.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateActionsByType.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ICorporateActions).interfaceId;
    }
}
