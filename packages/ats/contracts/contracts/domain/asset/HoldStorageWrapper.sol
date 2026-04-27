// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _HOLD_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IHoldTypes } from "../../facets/layer_1/hold/IHoldTypes.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Types } from "../../facets/layer_1/ERC3643/IERC3643Types.sol";
import { ITransfer } from "../../facets/transfer/ITransfer.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { ThirdPartyType } from "./types/ThirdPartyType.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { checkNonceAndDeadline } from "../../infrastructure/utils/ERC712.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { LockStorageWrapper } from "../asset/LockStorageWrapper.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { ControlListStorageWrapper } from "../core/ControlListStorageWrapper.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title HoldStorageWrapper
 * @notice Storage wrapper for hold management operations
 * @dev Manages hold data storage including holds by account, partition, and hold ID
 * @author Hashgraph
 */
library HoldStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using LowLevelCall for address;

    struct HoldDataStorage {
        mapping(address => uint256) totalHeldAmountByAccount;
        mapping(address => mapping(bytes32 => uint256)) totalHeldAmountByAccountAndPartition;
        mapping(address => mapping(bytes32 => mapping(uint256 => IHoldTypes.HoldData))) holdsByAccountPartitionAndId;
        mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) holdIdsByAccountAndPartition;
        mapping(address => mapping(bytes32 => uint256)) nextHoldIdByAccountAndPartition;
        mapping(address => mapping(bytes32 => mapping(uint256 => address))) holdThirdPartyByAccountPartitionAndId;
    }

    function createHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal returns (bool success_, uint256 holdId_) {
        _prepareHoldCreation(_partition, _from);

        uint256 abaf = updateTotalHold(_partition, _from);

        beforeHold(_partition, _from);
        ERC1410StorageWrapper.reduceBalanceByPartition(_from, _hold.amount, _partition);

        holdId_ = _storeHold(_partition, _from, _hold, _operatorData, _thirdPartyType, abaf);

        _emitHoldCreationEvents(_partition, _from, _hold.amount, _operatorData);

        return (true, holdId_);
    }

    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal returns (bool success_, uint256 holdId_) {
        checkNonceAndDeadline(
            _protectedHold.nonce,
            _from,
            NonceStorageWrapper.getNonceFor(_from),
            _protectedHold.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        ProtectedPartitionsStorageWrapper.checkCreateHoldSignature(
            _partition,
            _from,
            _protectedHold,
            _signature,
            ERC20StorageWrapper.getName()
        );

        NonceStorageWrapper.setNonceFor(_protectedHold.nonce, _from);

        return createHoldByPartition(_partition, _from, _protectedHold.hold, "", ThirdPartyType.PROTECTED);
    }

    function decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) internal {
        address thirdPartyAddress = EvmAccessors.getMsgSender();
        ERC20StorageWrapper.decreaseAllowedBalance(_from, thirdPartyAddress, _amount);
        holdStorage().holdThirdPartyByAccountPartitionAndId[_from][_partition][_holdId] = thirdPartyAddress;
    }

    function executeHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) internal returns (bool success_, bytes32 partition_) {
        beforeExecuteHold(_holdIdentifier, _to);

        success_ = operateHoldByPartition(_holdIdentifier, _to, _amount, IHoldTypes.OperationType.Execute);
        partition_ = _holdIdentifier.partition;

        if (getHold(_holdIdentifier).hold.amount == 0) {
            AdjustBalancesStorageWrapper.removeLabafHold(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            );
        }
    }

    function releaseHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal returns (bool success_) {
        beforeReleaseHold(_holdIdentifier);

        _restoreHoldAllowance(getHold(_holdIdentifier).thirdPartyType, _holdIdentifier, _amount);

        success_ = operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            _amount,
            IHoldTypes.OperationType.Release
        );

        if (getHold(_holdIdentifier).hold.amount == 0) {
            AdjustBalancesStorageWrapper.removeLabafHold(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            );
        }
    }

    function reclaimHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    ) internal returns (bool success_, uint256 amount_) {
        beforeReclaimHold(_holdIdentifier);

        IHoldTypes.HoldData memory holdData = getHold(_holdIdentifier);
        amount_ = holdData.hold.amount;

        _restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, amount_);

        success_ = operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            amount_,
            IHoldTypes.OperationType.Reclaim
        );

        AdjustBalancesStorageWrapper.removeLabafHold(
            _holdIdentifier.partition,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.holdId
        );
    }

    function operateHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        IHoldTypes.OperationType _operation
    ) internal returns (bool success_) {
        IHoldTypes.HoldData memory holdData = getHold(_holdIdentifier);

        _validateHoldOperation(_holdIdentifier, holdData, _to, _operation);
        checkHoldAmount(_amount, holdData);

        transferHold(_holdIdentifier, _to, _amount);

        return true;
    }

    function transferHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) internal {
        _decreaseOrRemoveHold(_holdIdentifier, _amount);

        _transferHoldBalance(_holdIdentifier, _to, _amount);

        _notifyTransferComplianceIfNeeded(_holdIdentifier, _to, _amount);

        _emitHoldTransfer(_holdIdentifier, _to, _amount);
    }

    function decreaseHeldAmount(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal returns (uint256 newHoldBalance_) {
        HoldDataStorage storage holdStorageRef = holdStorage();

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

    function removeHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier) internal {
        HoldDataStorage storage holdStorageRef = holdStorage();

        holdStorageRef.holdIdsByAccountAndPartition[_holdIdentifier.tokenHolder][_holdIdentifier.partition].remove(
            _holdIdentifier.holdId
        );

        delete holdStorageRef.holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
            _holdIdentifier.holdId
        ];

        delete holdStorageRef.holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];

        AdjustBalancesStorageWrapper.removeLabafHold(
            _holdIdentifier.partition,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.holdId
        );
    }

    function updateTotalHold(bytes32 _partition, address _tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper.getAbaf();

        uint256 labaf = AdjustBalancesStorageWrapper.getTotalHeldLabaf(_tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper.getTotalHeldLabafByPartition(_partition, _tokenHolder);

        if (abaf_ != labaf) {
            updateTotalHeldAmountAndLabaf(
                _tokenHolder,
                AdjustBalancesStorageWrapper.calculateFactor(abaf_, labaf),
                abaf_
            );
        }

        if (abaf_ != labafByPartition) {
            updateTotalHeldAmountAndLabafByPartition(
                _partition,
                _tokenHolder,
                AdjustBalancesStorageWrapper.calculateFactor(abaf_, labafByPartition),
                abaf_
            );
        }
    }

    function updateTotalHeldAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal {
        holdStorage().totalHeldAmountByAccount[_tokenHolder] *= _factor;
        AdjustBalancesStorageWrapper.setTotalHeldLabaf(_tokenHolder, _abaf);
    }

    function updateTotalHeldAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal {
        holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition] *= _factor;
        AdjustBalancesStorageWrapper.setTotalHeldLabafByPartition(_partition, _tokenHolder, _abaf);
    }

    function adjustHoldBalances(IHoldTypes.HoldIdentifier calldata _holdIdentifier, address _to) internal {
        ERC1410StorageWrapper.triggerAndSyncAll(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _to);

        updateHold(
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _holdIdentifier.tokenHolder,
            updateTotalHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder)
        );
    }

    function updateHold(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _abaf) internal {
        uint256 holdLabaf = AdjustBalancesStorageWrapper.getHoldLabafById(_partition, _tokenHolder, _holdId);

        if (_abaf == holdLabaf) return;
        updateHoldAmountById(
            _partition,
            _holdId,
            _tokenHolder,
            AdjustBalancesStorageWrapper.calculateFactor(_abaf, holdLabaf)
        );
        AdjustBalancesStorageWrapper.setHeldLabafById(_partition, _tokenHolder, _holdId, _abaf);
    }

    function updateHoldAmountById(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _factor) internal {
        holdStorage().holdsByAccountPartitionAndId[_tokenHolder][_partition][_holdId].hold.amount *= _factor;
    }

    function beforeHold(bytes32 _partition, address _tokenHolder) internal {
        SnapshotsStorageWrapper.updateAccountSnapshot(_tokenHolder, _partition);
        SnapshotsStorageWrapper.updateAccountHeldBalancesSnapshot(_tokenHolder, _partition);
    }

    function beforeExecuteHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier, address _to) internal {
        adjustHoldBalances(_holdIdentifier, _to);
        SnapshotsStorageWrapper.updateAccountSnapshot(_to, _holdIdentifier.partition);
        SnapshotsStorageWrapper.updateAccountHeldBalancesSnapshot(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition
        );
    }

    function beforeReleaseHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier) internal {
        beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    function beforeReclaimHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier) internal {
        beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    function getHeldAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 amount_) {
        return
            getHeldAmountFor(_tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactorForHeldAmountByTokenHolderAdjustedAt(_tokenHolder, _timestamp);
    }

    function getHeldAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 amount_) {
        return
            getHeldAmountForByPartition(_partition, _tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
                AdjustBalancesStorageWrapper.getTotalHeldLabafByPartition(_partition, _tokenHolder)
            );
    }

    function requireValidHoldId(IHoldTypes.HoldIdentifier memory _holdIdentifier) internal view {
        if (!isHoldIdValid(_holdIdentifier)) revert IHoldTypes.WrongHoldId();
    }

    function isHoldIdValid(IHoldTypes.HoldIdentifier memory _holdIdentifier) internal view returns (bool) {
        return getHold(_holdIdentifier).id != 0;
    }

    function getHold(
        IHoldTypes.HoldIdentifier memory _holdIdentifier
    ) internal view returns (IHoldTypes.HoldData memory) {
        return
            holdStorage().holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
                _holdIdentifier.holdId
            ];
    }

    function getHeldAmountFor(address _tokenHolder) internal view returns (uint256 amount_) {
        return holdStorage().totalHeldAmountByAccount[_tokenHolder];
    }

    function getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view returns (uint256 amount_) {
        return holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory holdsId_) {
        return holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].getFromSet(_pageIndex, _pageLength);
    }

    function getHoldForByPartition(
        IHoldTypes.HoldIdentifier memory _holdIdentifier
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
        IHoldTypes.HoldData memory holdData = getHold(_holdIdentifier);
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

    function getHoldForByPartitionAdjustedAt(
        IHoldTypes.HoldIdentifier memory _holdIdentifier,
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
        (
            amount_,
            expirationTimestamp_,
            escrow_,
            destination_,
            data_,
            operatorData_,
            thirdPartType_
        ) = getHoldForByPartition(_holdIdentifier);
        amount_ *= AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
            AdjustBalancesStorageWrapper.getHoldLabafById(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            )
        );
    }

    function getHoldThirdParty(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    ) internal view returns (address thirdParty_) {
        thirdParty_ = holdStorage().holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];
    }

    function getHoldCountForByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].length();
    }

    function isHoldExpired(IHoldTypes.Hold memory _hold) internal view returns (bool) {
        return TimeTravelStorageWrapper.getBlockTimestamp() > _hold.expirationTimestamp;
    }

    function checkOperatorCreateHoldByPartition(
        uint256 _expirationTimestamp,
        address _account,
        address _to,
        address _from,
        address _escrow,
        bytes32 _partition
    ) internal view {
        checkCreateHoldFromByPartition(_expirationTimestamp, _account, _to, _from, _escrow, _partition);
        ERC1410StorageWrapper.requireOperator(_partition, _from);
    }

    function checkCreateHoldFromByPartition(
        uint256 _expirationTimestamp,
        address _account,
        address _to,
        address _from,
        address _escrow,
        bytes32 _partition
    ) internal view {
        LockStorageWrapper.requireValidExpirationTimestamp(_expirationTimestamp);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_account);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_to);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_escrow);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
    }

    function isEscrow(IHoldTypes.Hold memory _hold, address _escrow) internal pure returns (bool) {
        return _escrow == _hold.escrow;
    }

    function checkHoldAmount(uint256 _amount, IHoldTypes.HoldData memory holdData) internal pure {
        if (_amount > holdData.hold.amount) revert IHoldTypes.InsufficientHoldBalance(holdData.hold.amount, _amount);
    }

    function holdStorage() internal pure returns (HoldDataStorage storage hold_) {
        bytes32 position = _HOLD_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            hold_.slot := position
        }
    }

    function _restoreHoldAllowance(
        ThirdPartyType _thirdPartyType,
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) private {
        if (_thirdPartyType != ThirdPartyType.AUTHORIZED) return;
        ERC20StorageWrapper.increaseAllowedBalance(
            _holdIdentifier.tokenHolder,
            holdStorage().holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
                _holdIdentifier.holdId
            ],
            _amount
        );
    }

    function _prepareHoldCreation(bytes32 _partition, address _from) private {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _from, address(0));
    }

    function _storeHold(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType,
        uint256 abaf
    ) private returns (uint256 holdId_) {
        HoldDataStorage storage holdStorageRef = holdStorage();

        holdId_ = ++holdStorageRef.nextHoldIdByAccountAndPartition[_from][_partition];

        IHoldTypes.HoldData memory hold = IHoldTypes.HoldData(holdId_, _hold, _operatorData, _thirdPartyType);

        AdjustBalancesStorageWrapper.setHeldLabafById(_partition, _from, holdId_, abaf);

        holdStorageRef.holdsByAccountPartitionAndId[_from][_partition][holdId_] = hold;
        holdStorageRef.holdIdsByAccountAndPartition[_from][_partition].add(holdId_);
        holdStorageRef.totalHeldAmountByAccountAndPartition[_from][_partition] += _hold.amount;
        holdStorageRef.totalHeldAmountByAccount[_from] += _hold.amount;
    }

    function _emitHoldCreationEvents(
        bytes32 _partition,
        address _from,
        uint256 amount,
        bytes memory _operatorData
    ) private {
        emit IERC1410Types.TransferByPartition(
            _partition,
            EvmAccessors.getMsgSender(),
            _from,
            address(0),
            amount,
            _operatorData,
            ""
        );
        emit ITransfer.Transfer(_from, address(0), amount);
    }

    function _decreaseOrRemoveHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier, uint256 _amount) private {
        if (decreaseHeldAmount(_holdIdentifier, _amount) == 0) {
            removeHold(_holdIdentifier);
        }
    }

    function _transferHoldBalance(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) private {
        if (ERC1410StorageWrapper.validPartitionForReceiver(_holdIdentifier.partition, _to)) {
            ERC1410StorageWrapper.increaseBalanceByPartition(_to, _amount, _holdIdentifier.partition);
            return;
        }

        ERC1410StorageWrapper.addPartitionTo(_amount, _to, _holdIdentifier.partition);
    }

    function _notifyTransferComplianceIfNeeded(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) private {
        if (_holdIdentifier.tokenHolder == _to || _holdIdentifier.partition != _DEFAULT_PARTITION) return;

        (ERC3643StorageWrapper.erc3643Storage().compliance).functionCall(
            abi.encodeWithSelector(ICompliance.transferred.selector, _holdIdentifier.tokenHolder, _to, _amount),
            IERC3643Types.ComplianceCallFailed.selector
        );
    }

    function _emitHoldTransfer(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) private {
        emit IERC1410Types.TransferByPartition(
            _holdIdentifier.partition,
            EvmAccessors.getMsgSender(),
            address(0),
            _to,
            _amount,
            "",
            ""
        );
        emit ITransfer.Transfer(address(0), _to, _amount);
    }

    function _validateHoldOperation(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        IHoldTypes.HoldData memory holdData,
        address _to,
        IHoldTypes.OperationType _operation
    ) private view {
        if (_operation == IHoldTypes.OperationType.Execute) {
            _validateExecuteHold(_holdIdentifier, holdData, _to);
            return;
        }

        if (_operation == IHoldTypes.OperationType.Reclaim) {
            _validateReclaimHold(holdData);
            return;
        }

        _validateNonReclaimHold(holdData);
    }

    function _validateExecuteHold(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        IHoldTypes.HoldData memory holdData,
        address _to
    ) private view {
        if (!ControlListStorageWrapper.isAbleToAccess(_holdIdentifier.tokenHolder)) {
            revert ICommonErrors.AccountIsBlocked(_holdIdentifier.tokenHolder);
        }

        if (holdData.hold.to != address(0) && _to != holdData.hold.to) {
            revert IHoldTypes.InvalidDestinationAddress(holdData.hold.to, _to);
        }

        if (isHoldExpired(holdData.hold)) {
            revert IHoldTypes.HoldExpirationReached();
        }

        if (!isEscrow(holdData.hold, EvmAccessors.getMsgSender())) {
            revert IHoldTypes.IsNotEscrow();
        }
    }

    function _validateReclaimHold(IHoldTypes.HoldData memory holdData) private view {
        if (!isHoldExpired(holdData.hold)) {
            revert IHoldTypes.HoldExpirationNotReached();
        }
    }

    function _validateNonReclaimHold(IHoldTypes.HoldData memory holdData) private view {
        if (isHoldExpired(holdData.hold)) {
            revert IHoldTypes.HoldExpirationReached();
        }

        if (!isEscrow(holdData.hold, EvmAccessors.getMsgSender())) {
            revert IHoldTypes.IsNotEscrow();
        }
    }
}
