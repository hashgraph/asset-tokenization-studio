// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingHoldCreation } from "./IClearingHoldCreation.sol";
import { ClearingHoldCreation } from "./ClearingHoldCreation.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CLEARING_HOLDCREATION_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract ClearingHoldCreationFacet is ClearingHoldCreation, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_HOLDCREATION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 4;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.clearingCreateHoldByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.clearingCreateHoldFromByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.protectedClearingCreateHoldByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getClearingCreateHoldForByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IClearingHoldCreation).interfaceId;
        }
    }
}
