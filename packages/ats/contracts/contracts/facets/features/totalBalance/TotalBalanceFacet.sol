// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TotalBalance } from "./TotalBalance.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { ITotalBalance } from "../interfaces/ITotalBalance.sol";
import { _TOTAL_BALANCE_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract TotalBalanceFacet is TotalBalance, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.getTotalBalanceFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalBalanceForByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ITotalBalance).interfaceId;
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _TOTAL_BALANCE_RESOLVER_KEY;
    }
}
