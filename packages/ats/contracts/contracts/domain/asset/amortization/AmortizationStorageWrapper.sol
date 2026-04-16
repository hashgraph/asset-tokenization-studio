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
import { IBondTypes } from "../../../facets/layer_2/bond/IBondTypes.sol";
import { IAmortizationStorageWrapper } from "./IAmortizationStorageWrapper.sol";
import { IHoldTypes } from "../../../facets/layer_1/hold/IHoldTypes.sol";
import { IERC1410Types } from "../../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { IERC20 } from "../../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { ThirdPartyType } from "../types/ThirdPartyType.sol";
import { Pagination } from "../../../infrastructure/utils/Pagination.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../core/CorporateActionsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../SnapshotsStorageWrapper.sol";
import { HoldStorageWrapper } from "../HoldStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../AdjustBalancesStorageWrapper.sol";
import { ERC20StorageWrapper } from "../ERC20StorageWrapper.sol";
import { BondStorageWrapper } from "../BondStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";
import { NominalValueStorageWrapper } from "../nominalValue/NominalValueStorageWrapper.sol";

/**
 * @title AmortizationStorageWrapper
 * @notice Storage wrapper for amortization management operations
 * @dev Manages amortization schedules, payments, and related calculations
 * @author Hashgraph
 */
library AmortizationStorageWrapper {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using Pagination for EnumerableSet.AddressSet;
    using Pagination for EnumerableSet.UintSet;

    struct AmortizationDataStorage {
        // solhint-disable max-line-length
        mapping(bytes32 corporateActionId => mapping(address tokenHolder => IAmortizationStorageWrapper.AmortizationHoldInfo)) amortizationHolds;
        mapping(bytes32 corporateActionId => EnumerableSet.AddressSet) activeHoldHolders;
        EnumerableSet.UintSet activeAmortizationIds;
        mapping(bytes32 corporateActionId => uint256) totalHoldByAmortizationId;
        mapping(bytes32 corporateActionId => bool) disabledAmortizations;
    }

    function setAmortization(
        IAmortization.Amortization memory _newAmortization
    ) internal returns (bytes32 corporateActionId_, uint256 amortizationID_) {
        (corporateActionId_, amortizationID_) = CorporateActionsStorageWrapper.addCorporateAction(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            abi.encode(_newAmortization)
        );

        if (corporateActionId_ == bytes32(0)) revert IAmortizationStorageWrapper.AmortizationCreationFailed();

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(_newAmortization.recordDate, SNAPSHOT_TASK_TYPE);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(_newAmortization.recordDate, corporateActionId_);
        _amortizationStorage().activeAmortizationIds.add(amortizationID_);

        emit IAmortizationStorageWrapper.AmortizationSet(
            corporateActionId_,
            amortizationID_,
            EvmAccessors.getMsgSender(),
            _newAmortization.recordDate,
            _newAmortization.executionDate
        );
    }

    function cancelAmortization(uint256 _amortizationID) internal returns (bool success_) {
        (
            IAmortization.RegisteredAmortization memory registeredAmortization,
            bytes32 corporateActionId,
            bool isDisabled
        ) = getAmortization(_amortizationID);

        if (isDisabled) revert IAmortizationStorageWrapper.AmortizationNotActive(corporateActionId, _amortizationID);

        if (registeredAmortization.amortization.executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IAmortizationStorageWrapper.AmortizationAlreadyExecuted(corporateActionId, _amortizationID);
        }

        _amortizationStorage().disabledAmortizations[corporateActionId] = true;
        _amortizationStorage().activeAmortizationIds.remove(_amortizationID);
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);

        emit IAmortizationStorageWrapper.AmortizationCancelled(_amortizationID, EvmAccessors.getMsgSender());
        success_ = true;
    }

    function setAmortizationHold(
        uint256 _amortizationID,
        address _tokenHolder,
        uint256 _tokenAmount
    ) internal returns (uint256 holdId_) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );

        if (_amortizationStorage().disabledAmortizations[corporateActionId]) {
            revert IAmortizationStorageWrapper.AmortizationNotActive(corporateActionId, _amortizationID);
        }

        AmortizationDataStorage storage s = _amortizationStorage();
        IAmortizationStorageWrapper.AmortizationHoldInfo storage existing = s.amortizationHolds[corporateActionId][
            _tokenHolder
        ];

        if (existing.holdActive) {
            IHoldTypes.HoldIdentifier memory id_ = IHoldTypes.HoldIdentifier({
                partition: _DEFAULT_PARTITION,
                tokenHolder: _tokenHolder,
                holdId: existing.holdId
            });
            uint256 existingAmount = HoldStorageWrapper.getHold(id_).hold.amount;
            _releaseHold(_tokenHolder, existing.holdId, existingAmount);
            s.totalHoldByAmortizationId[corporateActionId] -= existingAmount;
        }

        IHoldTypes.Hold memory hold = IHoldTypes.Hold({
            amount: _tokenAmount,
            expirationTimestamp: type(uint256).max,
            escrow: address(this),
            to: address(0),
            data: ""
        });

        (bool success, uint256 newHoldId) = HoldStorageWrapper.createHoldByPartition(
            _DEFAULT_PARTITION,
            _tokenHolder,
            hold,
            "",
            ThirdPartyType.CONTROLLER
        );

        if (!success) revert IAmortizationStorageWrapper.AmortizationHoldFailed(corporateActionId, _amortizationID);

        s.amortizationHolds[corporateActionId][_tokenHolder] = IAmortizationStorageWrapper.AmortizationHoldInfo({
            holdId: newHoldId,
            holdActive: true
        });
        s.activeHoldHolders[corporateActionId].add(_tokenHolder);
        s.totalHoldByAmortizationId[corporateActionId] += _tokenAmount;
        holdId_ = newHoldId;

        emit IAmortizationStorageWrapper.AmortizationHoldSet(
            corporateActionId,
            _amortizationID,
            _tokenHolder,
            newHoldId,
            _tokenAmount
        );
    }

    function releaseAmortizationHold(uint256 _amortizationID, address _tokenHolder) internal {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );

        AmortizationDataStorage storage s = _amortizationStorage();
        IAmortizationStorageWrapper.AmortizationHoldInfo storage holdInfo = s.amortizationHolds[corporateActionId][
            _tokenHolder
        ];

        if (!holdInfo.holdActive) {
            revert IAmortizationStorageWrapper.AmortizationHoldNotActive(
                corporateActionId,
                _amortizationID,
                _tokenHolder
            );
        }

        IHoldTypes.HoldIdentifier memory id_ = IHoldTypes.HoldIdentifier({
            partition: _DEFAULT_PARTITION,
            tokenHolder: _tokenHolder,
            holdId: holdInfo.holdId
        });
        uint256 holdAmount = HoldStorageWrapper.getHold(id_).hold.amount;
        _releaseHold(_tokenHolder, holdInfo.holdId, holdAmount);

        uint256 releasedHoldId = holdInfo.holdId;
        holdInfo.holdActive = false;
        s.activeHoldHolders[corporateActionId].remove(_tokenHolder);
        s.totalHoldByAmortizationId[corporateActionId] -= holdAmount;

        emit IAmortizationStorageWrapper.AmortizationHoldReleased(
            corporateActionId,
            _amortizationID,
            _tokenHolder,
            releasedHoldId
        );
    }

    function getAmortization(
        uint256 _amortizationID
    )
        internal
        view
        returns (
            IAmortization.RegisteredAmortization memory registeredAmortization_,
            bytes32 corporateActionId_,
            bool isDisabled_
        )
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );

        (, , bytes memory data, ) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);
        assert(data.length > 0);
        registeredAmortization_.amortization = abi.decode(data, (IAmortization.Amortization));
        registeredAmortization_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(
            corporateActionId_,
            SNAPSHOT_RESULT_ID
        );
        isDisabled_ = _amortizationStorage().disabledAmortizations[corporateActionId_];
    }

    function getAmortizationFor(
        uint256 _amortizationID,
        address _account
    ) internal view returns (IAmortization.AmortizationFor memory amortizationFor_) {
        (
            IAmortization.RegisteredAmortization memory registeredAmortization,
            bytes32 corporateActionId,

        ) = getAmortization(_amortizationID);

        amortizationFor_.account = _account;
        amortizationFor_.recordDate = registeredAmortization.amortization.recordDate;
        amortizationFor_.executionDate = registeredAmortization.amortization.executionDate;

        IAmortizationStorageWrapper.AmortizationHoldInfo storage holdInfo = _amortizationStorage().amortizationHolds[
            corporateActionId
        ][_account];
        amortizationFor_.holdId = holdInfo.holdId;
        amortizationFor_.holdActive = holdInfo.holdActive;

        (
            amortizationFor_.tokenBalance,
            amortizationFor_.decimalsBalance,
            amortizationFor_.recordDateReached
        ) = SnapshotsStorageWrapper.getSnapshotTakenBalance(
            registeredAmortization.amortization.recordDate,
            registeredAmortization.snapshotId,
            _account
        );

        uint256 timestamp = TimeTravelStorageWrapper.getBlockTimestamp();
        amortizationFor_.abafAtSnapshot = registeredAmortization.snapshotId != 0
            ? SnapshotsStorageWrapper.abafAtSnapshot(registeredAmortization.snapshotId)
            : amortizationFor_.abafAtSnapshot = AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp);

        amortizationFor_.nominalValue = NominalValueStorageWrapper._getNominalValue();
        amortizationFor_.nominalValueDecimals = NominalValueStorageWrapper._getNominalValueDecimals();

        if (holdInfo.holdId == 0) return amortizationFor_;

        (amortizationFor_.tokenHeldAmount, , , , , , ) = HoldStorageWrapper.getHoldForByPartitionAdjustedAt(
            IHoldTypes.HoldIdentifier({
                partition: _DEFAULT_PARTITION,
                tokenHolder: _account,
                holdId: holdInfo.holdId
            }),
            timestamp
        );
        amortizationFor_.decimalsHeld = ERC20StorageWrapper.decimalsAdjustedAt(timestamp);
        amortizationFor_.abafAtHold = AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp);
    }

    function getAmortizationsFor(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (IAmortization.AmortizationFor[] memory amortizationsFor_) {
        address[] memory holders = getAmortizationHolders(_amortizationID, _pageIndex, _pageLength);
        uint256 length = holders.length;
        amortizationsFor_ = new IAmortization.AmortizationFor[](length);
        for (uint256 i; i < length; ) {
            amortizationsFor_[i] = getAmortizationFor(_amortizationID, holders[i]);
            unchecked {
                ++i;
            }
        }
    }

    function getAmortizationsCount() internal view returns (uint256 amortizationCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(AMORTIZATION_CORPORATE_ACTION_TYPE);
    }

    function getAmortizationHolders(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        (IAmortization.RegisteredAmortization memory registeredAmortization, , bool isDisabled) = getAmortization(
            _amortizationID
        );

        if (isDisabled && registeredAmortization.snapshotId == 0) return new address[](0);

        uint256 now_ = TimeTravelStorageWrapper.getBlockTimestamp();
        if (registeredAmortization.amortization.recordDate >= now_) return new address[](0);

        if (registeredAmortization.snapshotId != 0) {
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredAmortization.snapshotId, _pageIndex, _pageLength);
        }

        return ERC1410StorageWrapper.getTokenHolders(_pageIndex, _pageLength);
    }

    function getTotalAmortizationHolders(uint256 _amortizationID) internal view returns (uint256) {
        (IAmortization.RegisteredAmortization memory registeredAmortization, , bool isDisabled) = getAmortization(
            _amortizationID
        );

        if (isDisabled && registeredAmortization.snapshotId == 0) return 0;

        uint256 now_ = TimeTravelStorageWrapper.getBlockTimestamp();
        if (registeredAmortization.amortization.recordDate >= now_) return 0;

        if (registeredAmortization.snapshotId != 0) {
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredAmortization.snapshotId);
        }

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function getAmortizationPaymentAmount(
        uint256 _amortizationID,
        address _tokenHolder
    ) internal view returns (uint256 tokenAmount_, uint8 decimals_) {
        IAmortization.AmortizationFor memory amortizationFor = getAmortizationFor(_amortizationID, _tokenHolder);
        tokenAmount_ = amortizationFor.tokenHeldAmount;
        decimals_ = amortizationFor.decimalsHeld;
    }

    function getAmortizationActiveHolders(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        return
            _amortizationStorage()
                .activeHoldHolders[
                    CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
                        AMORTIZATION_CORPORATE_ACTION_TYPE,
                        _amortizationID - 1
                    )
                ]
                .getFromSet(_pageIndex, _pageLength);
    }

    function getTotalAmortizationActiveHolders(uint256 _amortizationID) internal view returns (uint256) {
        return
            _amortizationStorage()
                .activeHoldHolders[
                    CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
                        AMORTIZATION_CORPORATE_ACTION_TYPE,
                        _amortizationID - 1
                    )
                ]
                .length();
    }

    function getTotalHoldByAmortizationId(uint256 _amortizationID) internal view returns (uint256) {
        return
            _amortizationStorage().totalHoldByAmortizationId[
                CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
                    AMORTIZATION_CORPORATE_ACTION_TYPE,
                    _amortizationID - 1
                )
            ];
    }

    function getActiveAmortizationIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory activeIds_) {
        return _amortizationStorage().activeAmortizationIds.getFromSet(_pageIndex, _pageLength);
    }

    function getTotalActiveAmortizationIds() internal view returns (uint256) {
        return _amortizationStorage().activeAmortizationIds.length();
    }

    function checkNoActiveAmortizationHolds(uint256 _amortizationID) internal view {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        if (_amortizationStorage().activeHoldHolders[corporateActionId].length() > 0) {
            revert IAmortizationStorageWrapper.AmortizationHasActiveHolds(corporateActionId, _amortizationID);
        }
    }

    function checkPositiveTokenAmount(uint256 _tokenAmount, uint256 _amortizationID) internal pure {
        if (_tokenAmount == 0) revert IAmortizationStorageWrapper.InvalidAmortizationHoldAmount(_amortizationID);
    }

    /// @dev Helper to release a hold by directly accessing Hold storage (no calldata conversion needed).
    function _releaseHold(address _tokenHolder, uint256 _holdId, uint256 _amount) private returns (bool) {
        bytes32 partition = _DEFAULT_PARTITION;

        // Direct storage access - no calldata conversion needed
        HoldStorageWrapper.HoldDataStorage storage holdStorageRef = HoldStorageWrapper.holdStorage();

        // Get hold data
        IHoldTypes.HoldData storage holdData = holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][partition][
            _holdId
        ];

        // Validate hold exists and has sufficient amount
        if (holdData.hold.amount < _amount) {
            revert IHoldTypes.InsufficientHoldBalance(holdData.hold.amount, _amount);
        }

        // Decrease or remove hold
        if (_amount == holdData.hold.amount) {
            // Remove completely
            holdStorageRef.holdIdsByAccountAndPartition[_tokenHolder][partition].remove(_holdId);
            delete holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][partition][_holdId];
            delete holdStorageRef.holdThirdPartyByAccountPartitionAndId[_tokenHolder][partition][_holdId];
        } else {
            // Decrease amount
            holdData.hold.amount -= _amount;
        }

        // Update totals
        holdStorageRef.totalHeldAmountByAccount[_tokenHolder] -= _amount;
        holdStorageRef.totalHeldAmountByAccountAndPartition[_tokenHolder][partition] -= _amount;

        // Restore allowance if AUTHORIZED third party
        if (holdData.thirdPartyType == ThirdPartyType.AUTHORIZED) {
            address thirdParty = holdStorageRef.holdThirdPartyByAccountPartitionAndId[_tokenHolder][partition][_holdId];
            if (thirdParty != address(0)) {
                ERC20StorageWrapper.increaseAllowedBalance(_tokenHolder, thirdParty, _amount);
            }
        }

        // Remove LABAF hold
        AdjustBalancesStorageWrapper.removeLabafHold(partition, _tokenHolder, _holdId);

        // Emit events
        emit IERC1410Types.TransferByPartition(
            partition,
            EvmAccessors.getMsgSender(),
            address(0),
            _tokenHolder,
            _amount,
            "",
            ""
        );
        emit IERC20.Transfer(address(0), _tokenHolder, _amount);

        return true;
    }

    /// @dev Helper to query adjusted hold amount at timestamp by directly accessing Hold storage.
    function _getHoldAdjustedAt(
        address _tokenHolder,
        uint256 _holdId,
        uint256 _timestamp
    ) private view returns (uint256 amount_) {
        bytes32 partition = _DEFAULT_PARTITION;

        // Direct storage access - no calldata conversion needed
        HoldStorageWrapper.HoldDataStorage storage holdStorageRef = HoldStorageWrapper.holdStorage();
        IHoldTypes.HoldData storage holdData = holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][partition][
            _holdId
        ];

        // Get base amount
        amount_ = holdData.hold.amount;

        // Apply adjustment factor for timestamp
        uint256 abafAdjusted = AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp);
        uint256 holdLabaf = AdjustBalancesStorageWrapper.getHoldLabafById(partition, _tokenHolder, _holdId);

        amount_ = amount_ * AdjustBalancesStorageWrapper.calculateFactor(abafAdjusted, holdLabaf);
    }

    function _amortizationStorage() private pure returns (AmortizationDataStorage storage amortizationData_) {
        bytes32 position = _AMORTIZATION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            amortizationData_.slot := position
        }
    }
}
