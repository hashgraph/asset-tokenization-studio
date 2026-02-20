// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledCouponListing } from "./ScheduledCouponListing.sol";
import {
    IScheduledCouponListing
} from "../../interfaces/scheduledTasks/scheduledCouponListing/IScheduledCouponListing.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _SCHEDULED_COUPON_LISTING_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";

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
        staticInterfaceIds_[0] = type(IScheduledCouponListing).interfaceId;
    }
}
