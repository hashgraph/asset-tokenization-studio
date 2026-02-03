// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { ITotalBalance } from "../interfaces/totalBalance/ITotalBalance.sol";
import { TotalBalance } from "./TotalBalance.sol";

abstract contract TotalBalanceFacetBase is TotalBalance, IStaticFunctionSelectors {
    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.getTotalBalanceFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalBalanceForByPartition.selector;
    }

    function getStaticInterfaceIds() external pure virtual override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ITotalBalance).interfaceId;
    }
}
