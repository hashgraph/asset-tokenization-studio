// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";
import { BondUSAFixedRate } from "./BondUSAFixedRate.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IBond } from "../../../assetCapabilities/interfaces/bond/IBond.sol";
import { IBondUSA } from "../../interfaces/IBondUSA.sol";

contract BondUSAFixedRateFacet is BondUSAFixedRate, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_FIXED_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this._initialize_bondUSA.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setCoupon.selector;
        staticFunctionSelectors_[selectorIndex++] = this.updateMaturityDate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.redeemAtMaturityByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.fullRedeemAtMaturity.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](2);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IBond).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IBondUSA).interfaceId;
    }
}
