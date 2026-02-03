// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingStorageWrapper2 } from "../clearing/ClearingStorageWrapper2.sol";
import {
    IAdjustBalancesStorageWrapper
} from "../../layer_2/interfaces/adjustBalances/IAdjustBalancesStorageWrapper.sol";
import { IClearing } from "../../layer_1/interfaces/clearing/IClearing.sol";

abstract contract AdjustBalancesStorageWrapper2 is IAdjustBalancesStorageWrapper, ClearingStorageWrapper2 {
    function _adjustBalances(uint256 _factor, uint8 _decimals) internal override {
        _updateDecimalsSnapshot();
        _updateAbafSnapshot();
        _updateAssetTotalSupplySnapshot();
        _adjustTotalSupply(_factor);
        _adjustDecimals(_decimals);
        _adjustMaxSupply(_factor);
        _updateAbaf(_factor);
        emit AdjustmentBalanceSet(_msgSender(), _factor, _decimals);
    }

    function _adjustTotalAndMaxSupplyForPartition(bytes32 _partition) internal override {
        uint256 abaf = _getAbaf();
        uint256 labaf = _getLabafByPartition(_partition);

        if (abaf == labaf) return;

        uint256 factor = _calculateFactor(abaf, labaf);

        _adjustTotalSupplyByPartition(_partition, factor);

        _adjustMaxSupplyByPartition(_partition, factor);

        _updateLabafByPartition(_partition);
    }

    function _getLabafByUserAndPartition(
        bytes32 _partition,
        address _account
    ) internal view override returns (uint256) {
        uint256 partitionsIndex = _erc1410BasicStorage().partitionToIndex[_account][_partition];

        if (partitionsIndex == 0) return 1;
        return _zeroToOne(_adjustBalancesStorage().labafUserPartition[_account][partitionsIndex - 1]);
    }

    function _getLabafByUserAndPartitionIndex(
        uint256 _partitionIndex,
        address _account
    ) internal view override returns (uint256) {
        if (_partitionIndex == 0) return 1;
        return _zeroToOne(_adjustBalancesStorage().labafUserPartition[_account][_partitionIndex - 1]);
    }
}
