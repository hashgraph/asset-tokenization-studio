// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { _AMORTIZATION_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import {
    AMORTIZATION_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE,
    _DEFAULT_PARTITION
} from "../../../constants/values.sol";
import { IAmortization } from "../../../facets/layer_2/amortization/IAmortization.sol";
import { IAmortizationStorageWrapper } from "./IAmortizationStorageWrapper.sol";
import { SecurityStorageWrapper } from "../security/SecurityStorageWrapper.sol";
import { Hold, HoldIdentifier } from "../../../facets/layer_1/hold/IHold.sol";
import { ThirdPartyType } from "../types/ThirdPartyType.sol";
import { LibCommon } from "../../../infrastructure/utils/LibCommon.sol";

abstract contract AmortizationStorageWrapper is IAmortizationStorageWrapper, SecurityStorageWrapper {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;

    struct AmortizationDataStorage {
        // solhint-disable max-line-length
        mapping(bytes32 corporateActionId => mapping(address tokenHolder => IAmortizationStorageWrapper.AmortizationHoldInfo)) amortizationHolds;
        mapping(bytes32 corporateActionId => EnumerableSet.AddressSet) activeHoldHolders;
        EnumerableSet.UintSet activeAmortizationIds;
    }

    modifier onlyNoActiveAmortizationHolds(uint256 _amortizationID) override {
        _checkNoActiveAmortizationHolds(_amortizationID);
        _;
    }

    function _setAmortization(
        IAmortization.Amortization memory _newAmortization
    ) internal virtual override returns (bytes32 corporateActionId_, uint256 amortizationID_) {
        bytes memory data = abi.encode(_newAmortization);

        (corporateActionId_, amortizationID_) = _addCorporateAction(AMORTIZATION_CORPORATE_ACTION_TYPE, data);

        _initAmortization(corporateActionId_, _newAmortization);
        _amortizationStorage().activeAmortizationIds.add(amortizationID_);

        emit AmortizationSet(
            corporateActionId_,
            amortizationID_,
            _msgSender(),
            _newAmortization.recordDate,
            _newAmortization.executionDate
        );
    }

    function _initAmortization(bytes32 _actionId, IAmortization.Amortization memory _newAmortization) internal virtual {
        if (_actionId == bytes32(0)) {
            revert AmortizationCreationFailed();
        }

        _addScheduledCrossOrderedTask(_newAmortization.recordDate, SNAPSHOT_TASK_TYPE);
        _addScheduledSnapshot(_newAmortization.recordDate, _actionId);
    }

    function _cancelAmortization(uint256 _amortizationID) internal override returns (bool success_) {
        IAmortization.RegisteredAmortization memory registeredAmortization;
        bytes32 corporateActionId;
        (registeredAmortization, corporateActionId, ) = _getAmortization(_amortizationID);

        if (registeredAmortization.amortization.executionDate <= _blockTimestamp()) {
            revert IAmortizationStorageWrapper.AmortizationAlreadyExecuted(corporateActionId, _amortizationID);
        }

        _cancelCorporateAction(corporateActionId);
        _amortizationStorage().activeAmortizationIds.remove(_amortizationID);
        success_ = true;
        emit AmortizationCancelled(_amortizationID, _msgSender());
    }

    function _setAmortizationHold(
        uint256 _amortizationID,
        address _tokenHolder,
        uint256 _tokenAmount
    ) internal virtual override returns (uint256 holdId_) {
        bytes32 corporateActionId = _getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );

        AmortizationDataStorage storage s = _amortizationStorage();
        AmortizationHoldInfo storage existing = s.amortizationHolds[corporateActionId][_tokenHolder];

        if (existing.holdActive) {
            HoldIdentifier memory identifier = HoldIdentifier({
                partition: _DEFAULT_PARTITION,
                tokenHolder: _tokenHolder,
                holdId: existing.holdId
            });
            uint256 existingAmount = _getHold(identifier).hold.amount;
            _releaseHoldByPartition(identifier, existingAmount);
        }

        Hold memory hold = Hold({
            amount: _tokenAmount,
            expirationTimestamp: type(uint256).max,
            escrow: address(this),
            to: address(0),
            data: ""
        });

        (bool success, uint256 newHoldId) = _createHoldByPartition(
            _DEFAULT_PARTITION,
            _tokenHolder,
            hold,
            "",
            ThirdPartyType.CONTROLLER
        );

        if (!success) revert IAmortizationStorageWrapper.AmortizationHoldFailed(corporateActionId, _amortizationID);

        s.amortizationHolds[corporateActionId][_tokenHolder] = AmortizationHoldInfo({
            holdId: newHoldId,
            holdActive: true
        });

        s.activeHoldHolders[corporateActionId].add(_tokenHolder);

        holdId_ = newHoldId;

        emit AmortizationHoldSet(corporateActionId, _amortizationID, _tokenHolder, newHoldId, _tokenAmount);
    }
    function _releaseAmortizationHold(uint256 _amortizationID, address _tokenHolder) internal override {
        bytes32 corporateActionId = _getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );

        AmortizationDataStorage storage s = _amortizationStorage();
        AmortizationHoldInfo storage holdInfo = s.amortizationHolds[corporateActionId][_tokenHolder];

        if (!holdInfo.holdActive) {
            revert IAmortizationStorageWrapper.AmortizationHoldNotActive(
                corporateActionId,
                _amortizationID,
                _tokenHolder
            );
        }

        HoldIdentifier memory identifier = HoldIdentifier({
            partition: _DEFAULT_PARTITION,
            tokenHolder: _tokenHolder,
            holdId: holdInfo.holdId
        });
        uint256 holdAmount = _getHold(identifier).hold.amount;
        _releaseHoldByPartition(identifier, holdAmount);

        uint256 releasedHoldId = holdInfo.holdId;
        holdInfo.holdActive = false;
        s.activeHoldHolders[corporateActionId].remove(_tokenHolder);

        emit AmortizationHoldReleased(corporateActionId, _amortizationID, _tokenHolder, releasedHoldId);
    }

    function _getAmortization(
        uint256 _amortizationID
    )
        internal
        view
        virtual
        override
        returns (
            IAmortization.RegisteredAmortization memory registeredAmortization_,
            bytes32 corporateActionId_,
            bool isDisabled_
        )
    {
        corporateActionId_ = _getCorporateActionIdByTypeIndex(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1);

        bytes memory data;
        (, , data, isDisabled_) = _getCorporateAction(corporateActionId_);

        assert(data.length > 0);
        (registeredAmortization_.amortization) = abi.decode(data, (IAmortization.Amortization));

        registeredAmortization_.snapshotId = _getUintResultAt(corporateActionId_, SNAPSHOT_RESULT_ID);
    }

    function _getAmortizationFor(
        uint256 _amortizationID,
        address _account
    ) internal view override returns (IAmortization.AmortizationFor memory amortizationFor_) {
        (
            IAmortization.RegisteredAmortization memory registeredAmortization,
            bytes32 corporateActionId,

        ) = _getAmortization(_amortizationID);

        amortizationFor_.account = _account;
        amortizationFor_.recordDate = registeredAmortization.amortization.recordDate;
        amortizationFor_.executionDate = registeredAmortization.amortization.executionDate;

        AmortizationHoldInfo storage holdInfo = _amortizationStorage().amortizationHolds[corporateActionId][_account];
        amortizationFor_.holdId = holdInfo.holdId;
        amortizationFor_.holdActive = holdInfo.holdActive;

        (
            amortizationFor_.tokenBalance,
            amortizationFor_.decimalsBalance,
            amortizationFor_.recordDateReached
        ) = _getSnapshotTakenBalance(
            registeredAmortization.amortization.recordDate,
            registeredAmortization.snapshotId,
            _account
        );

        if (registeredAmortization.snapshotId != 0) {
            amortizationFor_.abafAtSnapshot = _abafAtSnapshot(registeredAmortization.snapshotId);
        } else {
            amortizationFor_.abafAtSnapshot = _getAbafAdjustedAt(_blockTimestamp());
        }

        amortizationFor_.nominalValue = _getNominalValue();
        amortizationFor_.nominalValueDecimals = _getNominalValueDecimals();

        if (holdInfo.holdId != 0) {
            HoldIdentifier memory identifier = HoldIdentifier({
                partition: _DEFAULT_PARTITION,
                tokenHolder: _account,
                holdId: holdInfo.holdId
            });

            (amortizationFor_.tokenHeldAmount, , , , , , ) = _getHoldForByPartitionAdjustedAt(
                identifier,
                _blockTimestamp()
            );
            amortizationFor_.decimalsHeld = _decimalsAdjustedAt(_blockTimestamp());
            amortizationFor_.abafAtHold = _getAbafAdjustedAt(_blockTimestamp());
        }
    }

    function _getAmortizationsFor(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (IAmortization.AmortizationFor[] memory amortizationsFor_) {
        address[] memory holders = _getAmortizationHolders(_amortizationID, _pageIndex, _pageLength);
        uint256 length = holders.length;
        amortizationsFor_ = new IAmortization.AmortizationFor[](length);
        for (uint256 i; i < length; ) {
            amortizationsFor_[i] = _getAmortizationFor(_amortizationID, holders[i]);
            unchecked {
                ++i;
            }
        }
    }

    function _getAmortizationsCount() internal view override returns (uint256 amortizationCount_) {
        return _getCorporateActionCountByType(AMORTIZATION_CORPORATE_ACTION_TYPE);
    }

    function _getAmortizationHolders(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (address[] memory holders_) {
        (IAmortization.RegisteredAmortization memory registeredAmortization, , bool isDisabled) = _getAmortization(
            _amortizationID
        );

        if (isDisabled && registeredAmortization.snapshotId == 0) return new address[](0);

        if (registeredAmortization.amortization.recordDate >= _blockTimestamp()) return new address[](0);

        if (registeredAmortization.snapshotId != 0)
            return _tokenHoldersAt(registeredAmortization.snapshotId, _pageIndex, _pageLength);

        return _getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalAmortizationHolders(uint256 _amortizationID) internal view override returns (uint256) {
        (IAmortization.RegisteredAmortization memory registeredAmortization, , bool isDisabled) = _getAmortization(
            _amortizationID
        );

        if (isDisabled && registeredAmortization.snapshotId == 0) return 0;

        if (registeredAmortization.amortization.recordDate >= _blockTimestamp()) return 0;

        if (registeredAmortization.snapshotId != 0) return _totalTokenHoldersAt(registeredAmortization.snapshotId);

        return _getTotalTokenHolders();
    }

    function _getAmortizationPaymentAmount(
        uint256 _amortizationID,
        address _tokenHolder
    ) internal view override returns (uint256 tokenAmount_, uint8 decimals_) {
        IAmortization.AmortizationFor memory amortizationFor = _getAmortizationFor(_amortizationID, _tokenHolder);
        tokenAmount_ = amortizationFor.tokenHeldAmount;
        decimals_ = amortizationFor.decimalsHeld;
    }

    function _getActiveAmortizationHoldHolders(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (address[] memory holders_) {
        bytes32 corporateActionId = _getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        return
            LibCommon.getFromSet(_amortizationStorage().activeHoldHolders[corporateActionId], _pageIndex, _pageLength);
    }

    function _getTotalActiveAmortizationHoldHolders(uint256 _amortizationID) internal view override returns (uint256) {
        bytes32 corporateActionId = _getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        return _amortizationStorage().activeHoldHolders[corporateActionId].length();
    }

    function _getActiveAmortizationIds() internal view override returns (uint256[] memory activeIds_) {
        return _amortizationStorage().activeAmortizationIds.values();
    }

    function _checkNoActiveAmortizationHolds(uint256 _amortizationID) internal view {
        bytes32 corporateActionId = _getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        if (_amortizationStorage().activeHoldHolders[corporateActionId].length() > 0) {
            revert IAmortizationStorageWrapper.AmortizationHasActiveHolds(corporateActionId, _amortizationID);
        }
    }

    function _amortizationStorage() internal pure returns (AmortizationDataStorage storage amortizationData_) {
        bytes32 position = _AMORTIZATION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            amortizationData_.slot := position
        }
    }
}
