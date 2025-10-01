// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _FIXED_RATE_STORAGE_POSITION
} from '../../../layer_2/constants/storagePositions.sol';
import {
    KpiLinkedRateStorageWrapper
} from '../kpiLinkedRate/KpiLinkedRateStorageWrapper.sol';

contract FixedRateStorageWrapper is KpiLinkedRateStorageWrapper {
    struct FixedRateDataStorage {
        uint256 rate;
        uint8 decimals;
        bool initialized;
    }

    function _setRate(uint256 _newRate, uint8 _newRateDecimals) internal {
        FixedRateDataStorage storage fixedRateStorage = _fixedRateStorage();

        fixedRateStorage.rate = _newRate;
        fixedRateStorage.decimals = _newRateDecimals;
    }

    function _getRate() internal view returns (uint256 rate_, uint8 decimals_) {
        rate_ = _fixedRateStorage().rate;
        decimals_ = _fixedRateStorage().decimals;
    }

    function _fixedRateStorage()
        internal
        pure
        returns (FixedRateDataStorage storage fixedRateDataStorage_)
    {
        bytes32 position = _FIXED_RATE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            fixedRateDataStorage_.slot := position
        }
    }
}
