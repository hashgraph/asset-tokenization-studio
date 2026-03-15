// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingRead } from "./IClearingRead.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ClearingRead is IClearingRead, TimestampProvider {
    function getClearedAmountFor(address _tokenHolder) external view returns (uint256 amount_) {
        return ClearingStorageWrapper.getClearedAmountForAdjustedAt(_tokenHolder, _getBlockTimestamp());
    }

    function getClearedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 amount_) {
        return
            ClearingStorageWrapper.getClearedAmountForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _getBlockTimestamp()
            );
    }

    function getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOperationType
    ) external view override returns (uint256 clearingCount_) {
        return ClearingStorageWrapper.getClearingCountForByPartition(_partition, _tokenHolder, _clearingOperationType);
    }

    function getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory clearingsId_) {
        return
            ClearingStorageWrapper.getClearingsIdForByPartition(
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
        thirdParty_ = ClearingStorageWrapper.getClearingThirdParty(
            _partition,
            _tokenHolder,
            _clearingOpeartionType,
            _clearingId
        );
    }
}
