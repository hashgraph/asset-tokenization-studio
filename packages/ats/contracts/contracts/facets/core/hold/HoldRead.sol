// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldRead } from "../hold/IHoldRead.sol";
import { ThirdPartyType } from "../externalControlList/ThirdPartyType.sol";
import { LibHold } from "../../../domain/asset/LibHold.sol";
import { HoldOps } from "../../../domain/orchestrator/HoldOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract HoldRead is IHoldRead, TimestampProvider {
    function getHeldAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        return HoldOps.getHeldAmountForAdjustedAt(_tokenHolder, _getBlockTimestamp());
    }

    function getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        return HoldOps.getHeldAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _getBlockTimestamp());
    }

    function getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 holdCount_) {
        return LibHold.getHoldCountForByPartition(_partition, _tokenHolder);
    }

    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory holdsId_) {
        return LibHold.getHoldsIdForByPartition(_partition, _tokenHolder, _pageIndex, _pageLength);
    }

    function getHoldForByPartition(
        HoldIdentifier calldata _holdIdentifier
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
        return HoldOps.getHoldForByPartitionAdjustedAt(_holdIdentifier, _getBlockTimestamp());
    }

    function getHoldThirdParty(
        HoldIdentifier calldata _holdIdentifier
    ) external view override returns (address thirdParty_) {
        thirdParty_ = LibHold.getHoldThirdParty(_holdIdentifier);
    }
}
