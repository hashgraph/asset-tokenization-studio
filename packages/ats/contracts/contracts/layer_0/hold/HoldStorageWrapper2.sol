// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { _DEFAULT_PARTITION } from "../constants/values.sol";
import { ThirdPartyType } from "../common/types/ThirdPartyType.sol";
import { IERC3643Management } from "../../layer_1/interfaces/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../layer_1/interfaces/ERC3643/ICompliance.sol";
import {
    IHold,
    Hold,
    ProtectedHold,
    HoldIdentifier,
    HoldData,
    OperationType,
    HoldDataStorage
} from "../../layer_1/interfaces/hold/IHold.sol";
import { LowLevelCall } from "../common/libraries/LowLevelCall.sol";
import {
    ERC1410ProtectedPartitionsStorageWrapper
} from "../ERC1400/ERC1410/ERC1410ProtectedPartitionsStorageWrapper.sol";
import { checkNounceAndDeadline } from "../../layer_1/protectedPartitions/signatureVerification.sol";

abstract contract HoldStorageWrapper2 is ERC1410ProtectedPartitionsStorageWrapper {
    using EnumerableSet for EnumerableSet.UintSet;
    using LowLevelCall for address;

    function _createHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal override returns (bool success_, uint256 holdId_) {
        _triggerAndSyncAll(_partition, _from, address(0));

        uint256 abaf = _updateTotalHold(_partition, _from);

        _beforeHold(_partition, _from);
        _reduceBalanceByPartition(_from, _hold.amount, _partition);

        HoldDataStorage storage holdStorage = _holdStorage();

        holdId_ = ++holdStorage.nextHoldIdByAccountAndPartition[_from][_partition];

        HoldData memory hold = HoldData(holdId_, _hold, _operatorData, _thirdPartyType);
        _setHeldLabafById(_partition, _from, holdId_, abaf);

        holdStorage.holdsByAccountPartitionAndId[_from][_partition][holdId_] = hold;
        holdStorage.holdIdsByAccountAndPartition[_from][_partition].add(holdId_);
        holdStorage.totalHeldAmountByAccountAndPartition[_from][_partition] += _hold.amount;
        holdStorage.totalHeldAmountByAccount[_from] += _hold.amount;

        success_ = true;
    }

    function _decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) internal override {
        address thirdPartyAddress = _msgSender();
        _decreaseAllowedBalance(_from, thirdPartyAddress, _amount);
        _holdStorage().holdThirdPartyByAccountPartitionAndId[_from][_partition][_holdId] = thirdPartyAddress;
    }

    function _protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal override returns (bool success_, uint256 holdId_) {
        checkNounceAndDeadline(
            _protectedHold.nonce,
            _from,
            _getNounceFor(_from),
            _protectedHold.deadline,
            _blockTimestamp()
        );

        _checkCreateHoldSignature(_partition, _from, _protectedHold, _signature);

        _setNounce(_protectedHold.nonce, _from);

        return _createHoldByPartition(_partition, _from, _protectedHold.hold, "", ThirdPartyType.PROTECTED);
    }

    function _executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) internal override returns (bool success_) {
        _beforeExecuteHold(_holdIdentifier, _to);

        success_ = _operateHoldByPartition(_holdIdentifier, _to, _amount, OperationType.Execute);

        HoldData memory holdData = _getHold(_holdIdentifier);

        if (holdData.hold.amount == 0) {
            _removeLabafHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _holdIdentifier.holdId);
        }
    }

    function _releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal override returns (bool success_) {
        _beforeReleaseHold(_holdIdentifier);

        HoldData memory holdData = _getHold(_holdIdentifier);

        _restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, _amount);

        success_ = _operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            _amount,
            OperationType.Release
        );

        if (holdData.hold.amount == 0) {
            _removeLabafHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _holdIdentifier.holdId);
        }
    }

    function _reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier
    ) internal override returns (bool success_, uint256 amount_) {
        _beforeReclaimHold(_holdIdentifier);

        HoldData memory holdData = _getHold(_holdIdentifier);
        amount_ = holdData.hold.amount;

        _restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, amount_);

        success_ = _operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            amount_,
            OperationType.Reclaim
        );

        _removeLabafHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _holdIdentifier.holdId);
    }

    function _operateHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        OperationType _operation
    ) internal override returns (bool success_) {
        HoldData memory holdData = _getHold(_holdIdentifier);

        if (_operation == OperationType.Execute) {
            if (!_isAbleToAccess(_holdIdentifier.tokenHolder)) {
                revert AccountIsBlocked(_holdIdentifier.tokenHolder);
            }

            if (holdData.hold.to != address(0) && _to != holdData.hold.to) {
                revert IHold.InvalidDestinationAddress(holdData.hold.to, _to);
            }
        }
        if (_operation != OperationType.Reclaim) {
            if (_isHoldExpired(holdData.hold)) revert IHold.HoldExpirationReached();
            if (!_isEscrow(holdData.hold, _msgSender())) revert IHold.IsNotEscrow();
        } else if (_operation == OperationType.Reclaim && !_isHoldExpired(holdData.hold)) {
            revert IHold.HoldExpirationNotReached();
        }

        _checkHoldAmount(_amount, holdData);

        _transferHold(_holdIdentifier, _to, _amount);

        success_ = true;
    }

    function _transferHold(HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) internal override {
        if (_decreaseHeldAmount(_holdIdentifier, _amount) == 0) {
            _removeHold(_holdIdentifier);
        }
        if (_validPartitionForReceiver(_holdIdentifier.partition, _to)) {
            _increaseBalanceByPartition(_to, _amount, _holdIdentifier.partition);
            if (_holdIdentifier.tokenHolder != _to && _holdIdentifier.partition == _DEFAULT_PARTITION) {
                (_erc3643Storage().compliance).functionCall(
                    abi.encodeWithSelector(ICompliance.transferred.selector, _holdIdentifier.tokenHolder, _to, _amount),
                    IERC3643Management.ComplianceCallFailed.selector
                );
            }
            return;
        }
        _addPartitionTo(_amount, _to, _holdIdentifier.partition);
        if (_holdIdentifier.tokenHolder != _to && _holdIdentifier.partition == _DEFAULT_PARTITION) {
            (_erc3643Storage().compliance).functionCall(
                abi.encodeWithSelector(ICompliance.transferred.selector, _holdIdentifier.tokenHolder, _to, _amount),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }
    }

    function _decreaseHeldAmount(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal override returns (uint256 newHoldBalance_) {
        HoldDataStorage storage holdStorage = _holdStorage();

        holdStorage.totalHeldAmountByAccount[_holdIdentifier.tokenHolder] -= _amount;
        holdStorage.totalHeldAmountByAccountAndPartition[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ] -= _amount;
        holdStorage
        .holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][_holdIdentifier.holdId]
            .hold
            .amount -= _amount;

        newHoldBalance_ = holdStorage
        .holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][_holdIdentifier.holdId]
            .hold
            .amount;
    }

    function _removeHold(HoldIdentifier calldata _holdIdentifier) internal override {
        HoldDataStorage storage holdStorage = _holdStorage();

        holdStorage.holdIdsByAccountAndPartition[_holdIdentifier.tokenHolder][_holdIdentifier.partition].remove(
            _holdIdentifier.holdId
        );

        delete holdStorage.holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
            _holdIdentifier.holdId
        ];

        delete holdStorage.holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];

        _removeLabafHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _holdIdentifier.holdId);
    }

    function _updateTotalHold(bytes32 _partition, address _tokenHolder) internal override returns (uint256 abaf_) {
        abaf_ = _getAbaf();

        uint256 labaf = _getTotalHeldLabaf(_tokenHolder);
        uint256 labafByPartition = _getTotalHeldLabafByPartition(_partition, _tokenHolder);

        if (abaf_ != labaf) {
            uint256 factor = _calculateFactor(abaf_, labaf);

            _updateTotalHeldAmountAndLabaf(_tokenHolder, factor, abaf_);
        }

        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = _calculateFactor(abaf_, labafByPartition);

            _updateTotalHeldAmountAndLabafByPartition(_partition, _tokenHolder, factorByPartition, abaf_);
        }
    }

    function _updateTotalHeldAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal override {
        if (_factor == 1) return;

        _holdStorage().totalHeldAmountByAccount[_tokenHolder] *= _factor;
        _setTotalHeldLabaf(_tokenHolder, _abaf);
    }

    function _updateTotalHeldAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal override {
        if (_factor == 1) return;

        _holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition] *= _factor;
        _setTotalHeldLabafByPartition(_partition, _tokenHolder, _abaf);
    }

    function _beforeHold(bytes32 _partition, address _tokenHolder) internal override {
        _updateAccountSnapshot(_tokenHolder, _partition);
        _updateAccountHeldBalancesSnapshot(_tokenHolder, _partition);
    }

    function _beforeExecuteHold(HoldIdentifier calldata _holdIdentifier, address _to) internal override {
        _adjustHoldBalances(_holdIdentifier, _to);
        _updateAccountSnapshot(_to, _holdIdentifier.partition);
        _updateAccountHeldBalancesSnapshot(_holdIdentifier.tokenHolder, _holdIdentifier.partition);
    }

    function _beforeReleaseHold(HoldIdentifier calldata _holdIdentifier) internal override {
        _adjustHoldBalances(_holdIdentifier, _holdIdentifier.tokenHolder);
        _beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    function _beforeReclaimHold(HoldIdentifier calldata _holdIdentifier) internal override {
        _adjustHoldBalances(_holdIdentifier, _holdIdentifier.tokenHolder);
        _beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    function _adjustHoldBalances(HoldIdentifier calldata _holdIdentifier, address _to) internal override {
        _triggerAndSyncAll(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _to);

        uint256 abaf = _updateTotalHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder);

        _updateHold(_holdIdentifier.partition, _holdIdentifier.holdId, _holdIdentifier.tokenHolder, abaf);
    }

    function _updateHold(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _abaf) internal override {
        uint256 holdLabaf = _getHoldLabafByPartition(_partition, _holdId, _tokenHolder);

        if (_abaf != holdLabaf) {
            uint256 holdFactor = _calculateFactor(_abaf, holdLabaf);

            _updateHoldAmountById(_partition, _holdId, _tokenHolder, holdFactor);
            _setHeldLabafById(_partition, _tokenHolder, _holdId, _abaf);
        }
    }

    function _updateHoldAmountById(
        bytes32 _partition,
        uint256 _holdId,
        address _tokenHolder,
        uint256 _factor
    ) internal override {
        if (_factor == 1) return;
        HoldDataStorage storage holdStorage = _holdStorage();

        holdStorage.holdsByAccountPartitionAndId[_tokenHolder][_partition][_holdId].hold.amount *= _factor;
    }

    function _getHeldAmountForAdjusted(address _tokenHolder) internal view override returns (uint256 amount_) {
        uint256 factor = _calculateFactor(_getAbafAdjusted(), _getTotalHeldLabaf(_tokenHolder));

        return _getHeldAmountFor(_tokenHolder) * factor;
    }

    function _getHeldAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view override returns (uint256 amount_) {
        uint256 factor = _calculateFactorForHeldAmountByTokenHolderAdjustedAt(_tokenHolder, _timestamp);

        return _getHeldAmountFor(_tokenHolder) * factor;
    }

    function _getTotalBalanceForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual override returns (uint256) {
        return
            super._getTotalBalanceForByPartitionAdjusted(_partition, _tokenHolder) +
            _getHeldAmountForByPartitionAdjusted(_partition, _tokenHolder);
    }

    function _getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual override returns (uint256) {
        return
            super._getTotalBalanceForAdjustedAt(_tokenHolder, _timestamp) +
            _getHeldAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    function _getTotalBalance(address _tokenHolder) internal view virtual override returns (uint256) {
        return super._getTotalBalance(_tokenHolder) + _getHeldAmountForAdjusted(_tokenHolder);
    }

    function _getHeldAmountForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view override returns (uint256 amount_) {
        uint256 factor = _calculateFactor(_getAbafAdjusted(), _getTotalHeldLabafByPartition(_partition, _tokenHolder));
        return _getHeldAmountForByPartition(_partition, _tokenHolder) * factor;
    }

    function _getHoldForByPartitionAdjusted(
        HoldIdentifier calldata _holdIdentifier
    )
        internal
        view
        override
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartType_
        )
    {
        uint256 factor = _calculateFactor(
            _getAbafAdjusted(),
            _getHoldLabafByPartition(_holdIdentifier.partition, _holdIdentifier.holdId, _holdIdentifier.tokenHolder)
        );

        (
            amount_,
            expirationTimestamp_,
            escrow_,
            destination_,
            data_,
            operatorData_,
            thirdPartType_
        ) = _getHoldForByPartition(_holdIdentifier);
        amount_ *= factor;
    }

    function _getHoldThirdParty(
        HoldIdentifier calldata _holdIdentifier
    ) internal view override returns (address thirdParty_) {
        HoldDataStorage storage holdStorage = _holdStorage();

        thirdParty_ = holdStorage.holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];
    }

    function _restoreHoldAllowance(
        ThirdPartyType _thirdPartyType,
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) private {
        if (_thirdPartyType != ThirdPartyType.AUTHORIZED) return;
        _increaseAllowedBalance(
            _holdIdentifier.tokenHolder,
            _holdStorage().holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
                _holdIdentifier.partition
            ][_holdIdentifier.holdId],
            _amount
        );
    }
}
