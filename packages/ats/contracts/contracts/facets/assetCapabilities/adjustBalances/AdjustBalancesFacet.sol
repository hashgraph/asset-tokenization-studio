// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalances } from "./AdjustBalances.sol";
import { IAdjustBalances } from "../interfaces/adjustBalances/IAdjustBalances.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _BALANCE_ADJUSTMENTS_RESOLVER_KEY } from "../../../constants/resolverKeys/assets.sol";

contract AdjustBalancesFacet is AdjustBalances, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BALANCE_ADJUSTMENTS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[0] = this.adjustBalances.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IAdjustBalances).interfaceId;
    }
}
