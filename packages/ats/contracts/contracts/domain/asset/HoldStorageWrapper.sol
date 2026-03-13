// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _HOLD_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    IHold,
    Hold,
    ProtectedHold,
    HoldIdentifier,
    HoldData,
    OperationType,
    HoldDataStorage
} from "../../facets/layer_1/hold/IHold.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Management } from "../../facets/layer_1/ERC3643/IERC3643Management.sol";
import { IERC20StorageWrapper } from "./ERC1400/ERC20/IERC20StorageWrapper.sol";
import { IERC1410StorageWrapper } from "./ERC1400/ERC1410/IERC1410StorageWrapper.sol";
import { ThirdPartyType } from "./types/ThirdPartyType.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { checkNounceAndDeadline } from "../../infrastructure/utils/ERC712Lib.sol";
import { IControlListStorageWrapper } from "../core/controlList/IControlListStorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { ControlListStorageWrapper } from "../core/ControlListStorageWrapper.sol";

library HoldStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using LowLevelCall for address;

    // --- Guard functions ---

    function _requireValidHoldId(HoldIdentifier memory _holdIdentifier) internal view {
        if (!_isHoldIdValid(_holdIdentifier)) revert IHold.WrongHoldId();
    }

    // --- Storage access ---

    function _holdStorage() internal pure returns (HoldDataStorage storage hold_) {
        bytes32 position = _HOLD_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            hold_.slot := position
        }
    }

    // --- Hold ID validation and retrieval ---

    // solhint-disable-next-line ordering
    function _isHoldIdValid(HoldIdentifier memory _holdIdentifier) internal view returns (bool) {
        return _getHold(_holdIdentifier).id != 0;
    }

    function _getHold(HoldIdentifier memory _holdIdentifier) internal view returns (HoldData memory) {
        return
            _holdStorage().holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
                _holdIdentifier.holdId
            ];
    }

    // --- Hold amount queries ---

    function _getHeldAmountFor(address _tokenHolder) internal view returns (uint256 amount_) {
        return _holdStorage().totalHeldAmountByAccount[_tokenHolder];
    }

    function _getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view returns (uint256 amount_) {
        return _holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    // --- Hold pagination ---

    function _getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory holdsId_) {
        return
            _holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].getFromSet(_pageIndex, _pageLength);
    }

    // --- Hold details ---

    function _getHoldForByPartition(
        HoldIdentifier calldata _holdIdentifier
    )
        internal
        view
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
        HoldData memory holdData = _getHold(_holdIdentifier);
        return (
            holdData.hold.amount,
            holdData.hold.expirationTimestamp,
            holdData.hold.escrow,
            holdData.hold.to,
            holdData.hold.data,
            holdData.operatorData,
            holdData.thirdPartyType
        );
    }

    function _getHoldForByPartitionAdjustedAt(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _timestamp
    )
        internal
        view
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
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(_timestamp),
            AdjustBalancesStorageWrapper._getHoldLabafById(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            )
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

    function _getHoldThirdParty(HoldIdentifier calldata _holdIdentifier) internal view returns (address thirdParty_) {
        HoldDataStorage storage holdStorageRef = _holdStorage();

        thirdParty_ = holdStorageRef.holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];
    }

    // --- Hold count ---

    function _getHoldCountForByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return _holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].length();
    }

    // --- Hold validation checks ---

    function _isHoldExpired(Hold memory _hold) internal view returns (bool) {
        return block.timestamp > _hold.expirationTimestamp;
    }

    function _isEscrow(Hold memory _hold, address _escrow) internal pure returns (bool) {
        return _escrow == _hold.escrow;
    }

    function _checkHoldAmount(uint256 _amount, HoldData memory holdData) internal pure {
        if (_amount > holdData.hold.amount) revert IHold.InsufficientHoldBalance(holdData.hold.amount, _amount);
    }

    // --- Create hold ---

    function _createHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal returns (bool success_, uint256 holdId_) {
        ERC1410StorageWrapper._triggerAndSyncAll(_partition, _from, address(0));

        uint256 abaf = _updateTotalHold(_partition, _from);

        _beforeHold(_partition, _from);
        ERC1410StorageWrapper._reduceBalanceByPartition(_from, _hold.amount, _partition);

        HoldDataStorage storage holdStorageRef = _holdStorage();

        holdId_ = ++holdStorageRef.nextHoldIdByAccountAndPartition[_from][_partition];

        HoldData memory hold = HoldData(holdId_, _hold, _operatorData, _thirdPartyType);
        AdjustBalancesStorageWrapper._setHeldLabafById(_partition, _from, holdId_, abaf);

        holdStorageRef.holdsByAccountPartitionAndId[_from][_partition][holdId_] = hold;
        holdStorageRef.holdIdsByAccountAndPartition[_from][_partition].add(holdId_);
        holdStorageRef.totalHeldAmountByAccountAndPartition[_from][_partition] += _hold.amount;
        holdStorageRef.totalHeldAmountByAccount[_from] += _hold.amount;

        emit IERC1410StorageWrapper.TransferByPartition(
            _partition,
            msg.sender,
            _from,
            address(0),
            _hold.amount,
            _operatorData,
            ""
        );
        emit IERC20StorageWrapper.Transfer(_from, address(0), _hold.amount);

        success_ = true;
    }

    // --- Protected create hold ---

    function _protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal returns (bool success_, uint256 holdId_) {
        checkNounceAndDeadline(
            _protectedHold.nonce,
            _from,
            NonceStorageWrapper._getNonceFor(_from),
            _protectedHold.deadline,
            block.timestamp
        );

        ProtectedPartitionsStorageWrapper._checkCreateHoldSignature(_partition, _from, _protectedHold, _signature);

        NonceStorageWrapper._setNonceFor(_protectedHold.nonce, _from);

        return _createHoldByPartition(_partition, _from, _protectedHold.hold, "", ThirdPartyType.PROTECTED);
    }

    // --- Decrease allowance for hold ---

    function _decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) internal {
        address thirdPartyAddress = msg.sender;
        ERC1410StorageWrapper.decreaseAllowedBalance(_from, thirdPartyAddress, _amount);
        _holdStorage().holdThirdPartyByAccountPartitionAndId[_from][_partition][_holdId] = thirdPartyAddress;
    }

    // --- Execute hold ---

    function _executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) internal returns (bool success_, bytes32 partition_) {
        _beforeExecuteHold(_holdIdentifier, _to);

        success_ = _operateHoldByPartition(_holdIdentifier, _to, _amount, OperationType.Execute);
        partition_ = _holdIdentifier.partition;

        HoldData memory holdData = _getHold(_holdIdentifier);

        if (holdData.hold.amount == 0) {
            AdjustBalancesStorageWrapper._removeLabafHold(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            );
        }
    }

    // --- Release hold ---

    function _releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal returns (bool success_) {
        _beforeReleaseHold(_holdIdentifier);

        HoldData memory holdData = _getHold(_holdIdentifier);

        _restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, _amount);

        success_ = _operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            _amount,
            OperationType.Release
        );

        holdData = _getHold(_holdIdentifier);

        if (holdData.hold.amount == 0) {
            AdjustBalancesStorageWrapper._removeLabafHold(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            );
        }
    }

    // --- Reclaim hold ---

    function _reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier
    ) internal returns (bool success_, uint256 amount_) {
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

        AdjustBalancesStorageWrapper._removeLabafHold(
            _holdIdentifier.partition,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.holdId
        );
    }

    // --- Operate hold (core hold processing) ---

    function _operateHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        OperationType _operation
    ) internal returns (bool success_) {
        HoldData memory holdData = _getHold(_holdIdentifier);

        if (_operation == OperationType.Execute) {
            if (!ControlListStorageWrapper._isAbleToAccess(_holdIdentifier.tokenHolder)) {
                revert IControlListStorageWrapper.AccountIsBlocked(_holdIdentifier.tokenHolder);
            }

            if (holdData.hold.to != address(0) && _to != holdData.hold.to) {
                revert IHold.InvalidDestinationAddress(holdData.hold.to, _to);
            }
        }
        if (_operation != OperationType.Reclaim) {
            if (_isHoldExpired(holdData.hold)) revert IHold.HoldExpirationReached();
            if (!_isEscrow(holdData.hold, msg.sender)) revert IHold.IsNotEscrow();
        } else if (_operation == OperationType.Reclaim && !_isHoldExpired(holdData.hold)) {
            revert IHold.HoldExpirationNotReached();
        }

        _checkHoldAmount(_amount, holdData);

        _transferHold(_holdIdentifier, _to, _amount);

        success_ = true;
    }

    // --- Transfer hold to recipient ---

    function _transferHold(HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) internal {
        if (_decreaseHeldAmount(_holdIdentifier, _amount) == 0) {
            _removeHold(_holdIdentifier);
        }
        if (ERC1410StorageWrapper._validPartitionForReceiver(_holdIdentifier.partition, _to)) {
            ERC1410StorageWrapper._increaseBalanceByPartition(_to, _amount, _holdIdentifier.partition);
            if (_holdIdentifier.tokenHolder != _to && _holdIdentifier.partition == _DEFAULT_PARTITION) {
                (ERC3643StorageWrapper._erc3643Storage().compliance).functionCall(
                    abi.encodeWithSelector(ICompliance.transferred.selector, _holdIdentifier.tokenHolder, _to, _amount),
                    IERC3643Management.ComplianceCallFailed.selector
                );
            }
            emit IERC1410StorageWrapper.TransferByPartition(
                _holdIdentifier.partition,
                msg.sender,
                address(0),
                _to,
                _amount,
                "",
                ""
            );
            emit IERC20StorageWrapper.Transfer(address(0), _to, _amount);
            return;
        }
        ERC1410StorageWrapper._addPartitionTo(_amount, _to, _holdIdentifier.partition);
        if (_holdIdentifier.tokenHolder != _to && _holdIdentifier.partition == _DEFAULT_PARTITION) {
            (ERC3643StorageWrapper._erc3643Storage().compliance).functionCall(
                abi.encodeWithSelector(ICompliance.transferred.selector, _holdIdentifier.tokenHolder, _to, _amount),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }
        emit IERC1410StorageWrapper.TransferByPartition(
            _holdIdentifier.partition,
            msg.sender,
            address(0),
            _to,
            _amount,
            "",
            ""
        );
        emit IERC20StorageWrapper.Transfer(address(0), _to, _amount);
    }

    // --- Hold amount operations ---

    function _decreaseHeldAmount(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal returns (uint256 newHoldBalance_) {
        HoldDataStorage storage holdStorageRef = _holdStorage();

        holdStorageRef.totalHeldAmountByAccount[_holdIdentifier.tokenHolder] -= _amount;
        holdStorageRef.totalHeldAmountByAccountAndPartition[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ] -= _amount;
        holdStorageRef
        .holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][_holdIdentifier.holdId]
            .hold
            .amount -= _amount;

        newHoldBalance_ = holdStorageRef
        .holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][_holdIdentifier.holdId]
            .hold
            .amount;
    }

    // --- Remove hold ---

    function _removeHold(HoldIdentifier calldata _holdIdentifier) internal {
        HoldDataStorage storage holdStorageRef = _holdStorage();

        holdStorageRef.holdIdsByAccountAndPartition[_holdIdentifier.tokenHolder][_holdIdentifier.partition].remove(
            _holdIdentifier.holdId
        );

        delete holdStorageRef.holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
            _holdIdentifier.holdId
        ];

        delete holdStorageRef.holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];

        AdjustBalancesStorageWrapper._removeLabafHold(
            _holdIdentifier.partition,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.holdId
        );
    }

    // --- Update total hold balances ---

    function _updateTotalHold(bytes32 _partition, address _tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper._getAbaf();

        uint256 labaf = AdjustBalancesStorageWrapper._getTotalHeldLabaf(_tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper._getTotalHeldLabafByPartition(_partition, _tokenHolder);

        if (abaf_ != labaf) {
            uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(abaf_, labaf);

            _updateTotalHeldAmountAndLabaf(_tokenHolder, factor, abaf_);
        }

        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = AdjustBalancesStorageWrapper._calculateFactor(abaf_, labafByPartition);

            _updateTotalHeldAmountAndLabafByPartition(_partition, _tokenHolder, factorByPartition, abaf_);
        }
    }

    function _updateTotalHeldAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal {
        _holdStorage().totalHeldAmountByAccount[_tokenHolder] *= _factor;
        AdjustBalancesStorageWrapper._setTotalHeldLabaf(_tokenHolder, _abaf);
    }

    function _updateTotalHeldAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal {
        _holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition] *= _factor;
        AdjustBalancesStorageWrapper._setTotalHeldLabafByPartition(_partition, _tokenHolder, _abaf);
    }

    // --- Adjust hold balances ---

    function _adjustHoldBalances(HoldIdentifier calldata _holdIdentifier, address _to) internal {
        ERC1410StorageWrapper._triggerAndSyncAll(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _to);

        uint256 abaf = _updateTotalHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder);

        _updateHold(_holdIdentifier.partition, _holdIdentifier.holdId, _holdIdentifier.tokenHolder, abaf);
    }

    function _updateHold(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _abaf) internal {
        uint256 holdLabaf = AdjustBalancesStorageWrapper._getHoldLabafById(_partition, _tokenHolder, _holdId);

        if (_abaf != holdLabaf) {
            uint256 holdFactor = AdjustBalancesStorageWrapper._calculateFactor(_abaf, holdLabaf);

            _updateHoldAmountById(_partition, _holdId, _tokenHolder, holdFactor);
            AdjustBalancesStorageWrapper._setHeldLabafById(_partition, _tokenHolder, _holdId, _abaf);
        }
    }

    function _updateHoldAmountById(
        bytes32 _partition,
        uint256 _holdId,
        address _tokenHolder,
        uint256 _factor
    ) internal {
        HoldDataStorage storage holdStorageRef = _holdStorage();

        holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][_partition][_holdId].hold.amount *= _factor;
    }

    // --- Before-hook callbacks ---

    function _beforeHold(bytes32 _partition, address _tokenHolder) internal {
        SnapshotsStorageWrapper._updateAccountSnapshot(_tokenHolder, _partition);
        SnapshotsStorageWrapper._updateAccountHeldBalancesSnapshot(_tokenHolder, _partition);
    }

    function _beforeExecuteHold(HoldIdentifier calldata _holdIdentifier, address _to) internal {
        _adjustHoldBalances(_holdIdentifier, _to);
        SnapshotsStorageWrapper._updateAccountSnapshot(_to, _holdIdentifier.partition);
        SnapshotsStorageWrapper._updateAccountHeldBalancesSnapshot(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition
        );
    }

    function _beforeReleaseHold(HoldIdentifier calldata _holdIdentifier) internal {
        _beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    function _beforeReclaimHold(HoldIdentifier calldata _holdIdentifier) internal {
        _beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    // --- Adjusted-at queries ---

    function _getHeldAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactorForHeldAmountByTokenHolderAdjustedAt(
            _tokenHolder,
            _timestamp
        );

        return _getHeldAmountFor(_tokenHolder) * factor;
    }

    function _getHeldAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(_timestamp),
            AdjustBalancesStorageWrapper._getTotalHeldLabafByPartition(_partition, _tokenHolder)
        );
        return _getHeldAmountForByPartition(_partition, _tokenHolder) * factor;
    }

    // --- Private helper ---

    function _restoreHoldAllowance(
        ThirdPartyType _thirdPartyType,
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) private {
        if (_thirdPartyType != ThirdPartyType.AUTHORIZED) return;
        ERC1410StorageWrapper.increaseAllowedBalance(
            _holdIdentifier.tokenHolder,
            _holdStorage().holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
                _holdIdentifier.partition
            ][_holdIdentifier.holdId],
            _amount
        );
    }
}
