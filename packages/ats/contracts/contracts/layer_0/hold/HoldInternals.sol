// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingInternals } from "../clearing/ClearingInternals.sol";
import { Hold, HoldData, HoldIdentifier, OperationType, ProtectedHold } from "../../layer_1/interfaces/hold/IHold.sol";
import { ThirdPartyType } from "../common/types/ThirdPartyType.sol";

abstract contract HoldInternals is ClearingInternals {
    function _adjustHoldBalances(HoldIdentifier calldata _holdIdentifier, address _to) internal virtual;
    function _beforeExecuteHold(HoldIdentifier calldata _holdIdentifier, address _to) internal virtual;
    function _beforeHold(bytes32 _partition, address _tokenHolder) internal virtual;
    function _beforeReclaimHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _beforeReleaseHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _createHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal virtual returns (bool success_, uint256 holdId_);
    function _decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) internal virtual;
    function _decreaseHeldAmount(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal virtual returns (uint256 newHoldBalance_);
    function _executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) internal virtual returns (bool success_, bytes32 partition_);
    function _operateHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        OperationType _operation
    ) internal virtual returns (bool success_);
    function _protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal virtual returns (bool success_, uint256 holdId_);
    function _reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier
    ) internal virtual returns (bool success_, uint256 amount_);
    function _releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal virtual returns (bool success_);
    function _removeHold(HoldIdentifier calldata _holdIdentifier) internal virtual;
    function _removeLabafHold(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal virtual;
    function _setHeldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId,
        uint256 _labaf
    ) internal virtual;
    function _setTotalHeldLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _transferHold(HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) internal virtual;
    function _updateAccountHeldBalancesSnapshot(address account, bytes32 partition) internal virtual;
    function _updateHold(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _abaf) internal virtual;
    function _updateHoldAmountById(
        bytes32 _partition,
        uint256 _holdId,
        address _tokenHolder,
        uint256 _factor
    ) internal virtual;
    function _updateTotalHeldAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalHeldAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal virtual;
    function _updateTotalHold(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _checkCreateHoldSignature(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal view virtual;
    function _getHeldAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getHeldAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_);
    function _getHeldAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getHold(HoldIdentifier memory _holdIdentifier) internal view virtual returns (HoldData memory);
    function _getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _getHoldForByPartition(
        HoldIdentifier calldata _holdIdentifier
    )
        internal
        view
        virtual
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartType_
        );
    function _getHoldForByPartitionAdjustedAt(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _timestamp
    )
        internal
        view
        virtual
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartType_
        );
    function _getHoldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _holdId
    ) internal view virtual returns (uint256);
    function _getHoldThirdParty(
        HoldIdentifier calldata _holdIdentifier
    ) internal view virtual returns (address thirdParty_);
    function _getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory holdsId_);
    function _getTotalHeldLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalHeldLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
    function _isCreateHoldSignatureValid(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal view virtual returns (bool);
    function _isHoldExpired(Hold memory _hold) internal view virtual returns (bool);
    function _isHoldIdValid(HoldIdentifier memory _holdIdentifier) internal view virtual returns (bool);
    function _checkHoldAmount(uint256 _amount, HoldData memory holdData) internal pure virtual;
    function _isEscrow(Hold memory _hold, address _escrow) internal pure virtual returns (bool);
}
