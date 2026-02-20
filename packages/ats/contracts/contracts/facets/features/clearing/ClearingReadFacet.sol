// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingRead } from "./ClearingRead.sol";
import { IClearingRead } from "../interfaces/clearing/IClearingRead.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _CLEARING_READ_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract ClearingReadFacet is ClearingRead, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_READ_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.getClearedAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearedAmountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingCountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingsIdForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingThirdParty.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IClearingRead).interfaceId;
    }
}
