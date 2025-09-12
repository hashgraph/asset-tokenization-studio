// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {Common} from '../common/Common.sol';
import {IClearingRead} from '../interfaces/clearing/IClearingRead.sol';

abstract contract ClearingRead is IClearingRead, Common {
    function getClearedAmountFor(
        address _tokenHolder
    ) external view returns (uint256 amount_) {
        return _getClearedAmountForAdjusted(_tokenHolder);
    }

    function getClearedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 amount_) {
        return
            _getClearedAmountForByPartitionAdjusted(_partition, _tokenHolder);
    }

    function getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOperationType
    ) external view override returns (uint256 clearingCount_) {
        return
            _getClearingCountForByPartition(
                _partition,
                _tokenHolder,
                _clearingOperationType
            );
    }

    function getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory clearingsId_) {
        return
            _getClearingsIdForByPartition(
                _partition,
                _tokenHolder,
                _clearingOperationType,
                _pageIndex,
                _pageLength
            );
    }

    function getClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOpeartionType,
        uint256 _clearingId
    ) external view override returns (address thirdParty_) {
        thirdParty_ = _getClearingThirdParty(
            _partition,
            _tokenHolder,
            _clearingOpeartionType,
            _clearingId
        );
    }
}
