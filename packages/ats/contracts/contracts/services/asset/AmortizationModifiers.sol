// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import "../../domain/asset/amortization/AmortizationStorageWrapper.sol";
import { IAmortizationStorageWrapper } from "../../domain/asset/amortization/IAmortizationStorageWrapper.sol";

abstract contract AmortizationModifiers {
    modifier onlyNoActiveAmortizationHolds(uint256 _amortizationID) {
        AmortizationStorageWrapper.checkNoActiveAmortizationHolds(_amortizationID);
        _;
    }

    modifier onlyPositiveTokenAmount(uint256 _tokenAmount, uint256 _amortizationID) {
        AmortizationStorageWrapper.checkPositiveTokenAmount(_tokenAmount, _amortizationID);
        _;
    }
}
