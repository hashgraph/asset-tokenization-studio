// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "./IHoldTypes.sol";
import { IHoldRead } from "./IHoldRead.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { HoldStorageWrapper } from "../../../domain/asset/HoldStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

abstract contract HoldRead is IHoldRead {
    function getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        return
            HoldStorageWrapper.getHeldAmountForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }

    function getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 holdCount_) {
        return HoldStorageWrapper.getHoldCountForByPartition(_partition, _tokenHolder);
    }

    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory holdsId_) {
        return HoldStorageWrapper.getHoldsIdForByPartition(_partition, _tokenHolder, _pageIndex, _pageLength);
    }

    function getHoldForByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    )
        external
        view
        override
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartyType_
        )
    {
        return
            HoldStorageWrapper.getHoldForByPartitionAdjustedAt(
                _holdIdentifier,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }
}
