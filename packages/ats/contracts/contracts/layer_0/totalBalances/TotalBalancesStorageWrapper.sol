// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { FixedRateStorageWrapper } from "../interestRates/fixedRate/FixedRateStorageWrapper.sol";

abstract contract TotalBalancesStorageWrapper is FixedRateStorageWrapper {
    function _getTotalBalance(address /*_tokenHolder*/) internal view override returns (uint256 totalBalance) {
        return 0;
    }

    function _getTotalBalanceForAdjustedAt(
        address /*_tokenHolder*/,
        uint256 /*_timestamp*/
    ) internal view override returns (uint256 totalBalance) {
        return 0;
    }

   
}
