// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldIdentifier } from "../interfaces/hold/IHold.sol";
import { IHoldRead } from "../interfaces/hold/IHoldRead.sol";
import { ThirdPartyType } from "../../layer_0/common/types/ThirdPartyType.sol";
import { Internals } from "contracts/layer_0/Internals.sol";

abstract contract HoldRead is IHoldRead, Internals {
    function getHeldAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        return _getHeldAmountForAdjusted(_tokenHolder);
    }

    function getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        return _getHeldAmountForByPartitionAdjusted(_partition, _tokenHolder);
    }

    function getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 holdCount_) {
        return _getHoldCountForByPartition(_partition, _tokenHolder);
    }

    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory holdsId_) {
        return _getHoldsIdForByPartition(_partition, _tokenHolder, _pageIndex, _pageLength);
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
        return _getHoldForByPartitionAdjusted(_holdIdentifier);
    }

    function getHoldThirdParty(HoldIdentifier calldata _holdIdentifier) external view override returns (address) {
        return _getHoldThirdParty(_holdIdentifier);
    }
}
