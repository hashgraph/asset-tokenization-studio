// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { _SCHEDULED_COUPON_LISTING_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import {
    IScheduledCouponListing
} from "../../interfaces/scheduledTasks/scheduledCouponListing/IScheduledCouponListing.sol";
import { ScheduledCouponListing } from "./ScheduledCouponListing.sol";

contract ScheduledCouponListingFacet is ScheduledCouponListing, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_COUPON_LISTING_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.scheduledCouponListingCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getScheduledCouponListing.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IScheduledCouponListing).interfaceId;
    }
}
