// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CouponStorageWrapperFixedInterestRate } from "./coupon/CouponStorageWrapper.sol";

// solhint-disable no-empty-blocks
abstract contract CommonFixedInterestRate is CouponStorageWrapperFixedInterestRate {}
