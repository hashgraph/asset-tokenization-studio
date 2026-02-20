// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CorporateActions } from "./CorporateActions.sol";
import { ICorporateActions } from "../interfaces/ICorporateActions.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _CORPORATE_ACTIONS_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract CorporateActionsFacet is CorporateActions, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CORPORATE_ACTIONS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.addCorporateAction.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateAction.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateActionCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateActionIds.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateActionCountByType.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCorporateActionIdsByType.selector;
        staticFunctionSelectors_[selectorIndex++] = this.actionContentHashExists.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ICorporateActions).interfaceId;
    }
}
